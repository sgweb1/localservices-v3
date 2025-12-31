<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Provider Bookings Controller
 * 
 * Zarządzanie rezerwacjami providera:
 * - Lista bookings z filtrowaniem
 * - Akcje: accept, reject, complete
 * - Bulk actions
 * - Integracja z systemem powiadomień
 */
class ProviderBookingController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Lista bookings providera z paginacją
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $status = $request->input('status');
        $hiddenFilter = $request->input('hidden', 'visible'); // 'visible', 'hidden', 'all'

        // Pobierz bookings providera z paginacją
        $query = Booking::with(['customer:id,name', 'service:id,title'])
            ->where('provider_id', $user->id);

        // Filtrowanie po hidden status
        // ZMIANA (2025-01-01): Dodano obsługę hidden_by_provider filter
        // - visible: pokazuj tylko widoczne rezerwacje (domyślnie)
        // - hidden: pokazuj tylko ukryte rezerwacje
        // - all: pokazuj wszystkie niezależnie od hidden status
        if ($hiddenFilter === 'hidden') {
            $query->where('hidden_by_provider', 1);
        } elseif ($hiddenFilter === 'visible') {
            $query->where('hidden_by_provider', 0);
        }
        // Jeśli 'all' - nie filtruj po hidden_by_provider

        // Filtrowanie po statusie jeśli podany
        if ($status) {
            $query->where('status', $status);
        }

        $bookingsPaginated = $query
            ->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate($perPage);

        // Przygotuj dane
        $data = $bookingsPaginated->getCollection()->map(function ($booking) {
            $serviceAddress = $booking->service_address;
            
            // Jeśli address jest array, użyj go; w przeciwnym wypadku spróbuj sparsować
            if (is_array($serviceAddress)) {
                $addressData = [
                    'street' => $serviceAddress['street'] ?? null,
                    'postal_code' => $serviceAddress['postal_code'] ?? null,
                    'city' => $serviceAddress['city'] ?? null,
                ];
            } else {
                // Fallback jeśli jest string
                $addressData = ['street' => $serviceAddress];
            }
            
            return [
                'id' => $booking->id,
                'customerName' => $booking->customer?->name ?? 'Klient',
                'customerId' => $booking->customer_id,
                'serviceName' => $booking->service?->title ?? 'Usługa',
                'bookingNumber' => $booking->booking_number,
                'bookingDate' => $booking->booking_date,
                'startTime' => $booking->start_time,
                'endTime' => $booking->end_time,
                'durationMinutes' => $booking->duration_minutes,
                'serviceAddress' => $addressData,
                'customerNotes' => $booking->notes,
                'servicePrice' => (float) $booking->service_price,
                'totalPrice' => (float) $booking->total_price,
                'paymentStatus' => $booking->payment_status,
                'status' => $booking->status,
                'canAccess' => true,
                'isHidden' => (bool) $booking->hidden_by_provider,
            ];
        });

        // Wszystkie bookings do statystyk (bez paginacji)
        $allBookings = $bookingsPaginated->getCollection();

        // Stats
        // ZMIANA (2025-01-01): Total powinno być z gefilteredych rezerwacji (paginated->total())
        // a nie z aktualnej strony (allBookings->count())
        // Teraz total odzwierciedla liczbę rezerwacji pasujących do aktualnych filtrów
        $counts = [
            'total' => $bookingsPaginated->total(), // Całkowita liczba z filtrami
            'pending' => $allBookings->where('status', 'pending')->count(),
            'confirmed' => $allBookings->where('status', 'confirmed')->count(),
            'completed' => $allBookings->where('status', 'completed')->count(),
            'cancelled' => $allBookings->where('status', 'cancelled')->count(),
        ];

        // Overdue confirmed bookings (data < dzisiaj + potwierdzone)
        $overdueConfirmed = $allBookings->filter(function ($booking) {
            if ($booking->status !== 'confirmed') {
                return false;
            }
            $bookingDate = Carbon::parse($booking->booking_date);
            return $bookingDate->lt(Carbon::today());
        })->count();

        return response()->json([
            'data' => $data,
            'counts' => $counts,
            'overdueConfirmedCount' => $overdueConfirmed,
            'canManage' => true, // TODO: check subscription
            'showUpsell' => false,
            'hasBookings' => $bookingsPaginated->total() > 0,
            'showTrialInfo' => false,
            // Paginacja
            'pagination' => [
                'current_page' => $bookingsPaginated->currentPage(),
                'last_page' => $bookingsPaginated->lastPage(),
                'per_page' => $bookingsPaginated->perPage(),
                'total' => $bookingsPaginated->total(),
                'from' => $bookingsPaginated->firstItem(),
                'to' => $bookingsPaginated->lastItem(),
            ],
        ]);
    }

    /**
     * Pokaż rezerwację providera
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 403);
        }

        return response()->json([
            'data' => new BookingResource($booking->fresh(['service', 'customer', 'provider'])),
        ], 200);
    }

    /**
     * Zaakceptuj booking (pending -> confirmed)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function accept(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== UserType::Provider) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $booking = Booking::where('provider_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$booking) {
                return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
            }

            if ($booking->status !== 'pending') {
                return response()->json(['error' => 'Booking is not pending'], 400);
            }

            $booking->update(['status' => 'confirmed']);

            // Wyślij powiadomienie do customera
            if ($booking->customer) {
                try {
                    $this->notificationService->send(
                        'booking.confirmed',
                        $booking->customer,
                        'customer',
                        [
                            'customer_name' => $booking->customer->name,
                            'provider_name' => $user->name,
                            'service_name' => optional($booking->service)->title ?? 'Usługa',
                            'booking_date' => Carbon::parse($booking->booking_date)->format('d.m.Y'),
                            'booking_time' => substr($booking->start_time ?? '00:00:00', 0, 5),
                            'booking_id' => $booking->id,
                        ]
                    );
                } catch (\Exception $e) {
                    // Log notification error but don't fail the response
                    \Log::warning('Notification error in booking accept: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Rezerwacja została zaakceptowana',
                'data' => [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'booking_number' => $booking->booking_number,
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Accept booking error: ' . $e->getMessage(), ['booking_id' => $id, 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Wewnętrzny błąd serwera'], 500);
        }
    }

    /**
     * Odrzuć booking (pending -> rejected)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['error' => 'Booking is not pending'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        // Wyślij powiadomienie do customera
        if ($booking->customer) {
            $this->notificationService->send(
                'booking.rejected',
                $booking->customer,
                'customer',
                [
                    'customer_name' => $booking->customer->name,
                    'provider_name' => $user->name,
                    'service_name' => $booking->service->title ?? 'Usługa',
                    'booking_date' => Carbon::parse($booking->booking_date)->format('d.m.Y'),
                    'booking_time' => substr($booking->start_time ?? '00:00:00', 0, 5),
                    'booking_id' => $booking->id,
                    'rejection_reason' => 'Brak dostępności w wybranym terminie',
                ]
            );
        }

        return response()->json([
            'data' => new BookingResource($booking->fresh(['service', 'customer', 'provider'])),
        ], 200);
    }

    /**
     * Oznacz jako ukończone (confirmed -> completed)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user || $user->user_type !== UserType::Provider) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $booking = Booking::where('provider_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$booking) {
                return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
            }

            // Validate status - booking must be confirmed or in_progress to complete
            if (!in_array($booking->status, [BookingStatus::CONFIRMED->value, BookingStatus::IN_PROGRESS->value])) {
                return response()->json([
                    'error' => 'Można zakończyć tylko potwierdzone lub w trakcie realizacji rezerwacje',
                    'current_status' => $booking->status
                ], 422);
            }

            // Validate request data - but make it optional
            $validated = $request->validate([
                'notes' => 'nullable|string|max:1000',
                'final_price' => 'nullable|numeric|min:0',
            ]) ?? [];

            $updateData = ['status' => BookingStatus::COMPLETED->value, 'completed_at' => now()];
            
            if (!empty($validated['final_price'])) {
                $updateData['total_price'] = $validated['final_price'];
            }
            
            if (!empty($validated['notes'])) {
                $updateData['provider_notes'] = $validated['notes'];
            }

            $booking->update($updateData);

            // Wyślij powiadomienie do customera (prośba o opinię)
            if ($booking->customer) {
                try {
                    $this->notificationService->send(
                        'booking.completed',
                        $booking->customer,
                        'customer',
                        [
                            'customer_name' => $booking->customer->name,
                            'provider_name' => $user->name,
                            'service_name' => optional($booking->service)->title ?? 'Usługa',
                            'booking_date' => Carbon::parse($booking->booking_date)->format('d.m.Y'),
                            'booking_time' => substr($booking->start_time ?? '00:00:00', 0, 5),
                            'booking_id' => $booking->id,
                        ]
                    );
                } catch (\Exception $e) {
                    \Log::warning('Notification error in booking complete: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Rezerwacja została oznaczona jako ukończona',
                'data' => [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'booking_number' => $booking->booking_number,
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Complete booking error: ' . $e->getMessage(), ['booking_id' => $id, 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Wewnętrzny błąd serwera'], 500);
        }
    }

    /**
     * Bulk complete overdue confirmed bookings
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function completeOverdue(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Znajdź wszystkie potwierdzone bookings z datą < dzisiaj
        $bookings = Booking::where('provider_id', $user->id)
            ->where('status', 'confirmed')
            ->where('booking_date', '<', Carbon::today())
            ->get();

        $updated = 0;
        foreach ($bookings as $booking) {
            $booking->update(['status' => 'completed']);
            $updated++;

            // Wyślij powiadomienie do każdego customera
            if ($booking->customer) {
                $this->notificationService->send(
                    'booking.completed',
                    $booking->customer,
                    'customer',
                    [
                        'customer_name' => $booking->customer->name,
                        'provider_name' => $user->name,
                        'service_name' => $booking->service->title ?? 'Usługa',
                        'booking_date' => Carbon::parse($booking->booking_date)->format('d.m.Y'),
                        'booking_time' => substr($booking->start_time ?? '00:00:00', 0, 5),
                        'booking_id' => $booking->id,
                    ]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Oznaczono {$updated} rezerwacji jako ukończone",
            'count' => $updated,
        ]);
    }

    /**
     * Wyślij cytat
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function sendQuote(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'duration_hours' => 'nullable|numeric|min:0.5',
            'description' => 'nullable|string|max:1000',
        ]);

        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        // Zaktualizuj cenę i status
        $booking->update([
            'status' => 'quote_sent',
            'service_price' => $validated['price'],
            'total_price' => $validated['price'],
            'duration_minutes' => $validated['duration_hours'] ? (int)($validated['duration_hours'] * 60) : null,
            'provider_notes' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'data' => new BookingResource($booking->fresh(['service', 'customer', 'provider'])),
        ], 200);
    }

    /**
     * Rozpocznij usługę
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function start(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'error' => 'Można rozpocząć tylko potwierdzone rezerwacje',
                'current_status' => $booking->status
            ], 422);
        }

        // Oznacz jako w trakcie realizacji
        $booking->update([
            'status' => 'in_progress',
            'started_at' => now(),
            'provider_notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'data' => new BookingResource($booking->fresh(['service', 'customer', 'provider'])),
        ], 200);
    }

    /**
     * Pobierz statystyki providera
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $allBookings = Booking::where('provider_id', $user->id)->get();

        // Policz statystyki
        $totalBookings = $allBookings->count();
        $completedBookings = $allBookings->where('status', 'completed')->count();
        $pendingBookings = $allBookings->whereIn('status', ['pending', 'quote_sent'])->count();
        $cancelledBookings = $allBookings->where('status', 'cancelled')->count();
        $declinedBookings = $allBookings->where('status', 'declined')->count();

        $completionRate = $totalBookings > 0 ? ($completedBookings / $totalBookings) * 100 : 0;

        return response()->json([
            'data' => [
                'total_bookings' => $totalBookings,
                'completed_bookings' => $completedBookings,
                'pending_bookings' => $pendingBookings,
                'cancelled_bookings' => $cancelledBookings,
                'declined_bookings' => $declinedBookings,
                'completion_rate' => round($completionRate, 2),
                'average_rating' => 0, // TODO: dodać recenzje
                'trust_score' => 0, // TODO: Trust Score ze ProviderProfile
                'response_time' => 0, // TODO: z ProviderProfile
            ],
        ]);
    }

    /**
     * Początek destroy metody
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Znajdź booking należący do tego providera (niezależnie od hidden status)
        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        // Jeśli już hidden, zwróć success (idempotent)
        if ($booking->hidden_by_provider) {
            return response()->json([
                'success' => true,
                'message' => 'Rezerwacja już była ukryta w Twoim panelu',
            ]);
        }

        // Ukryj dla providera
        $booking->update(['hidden_by_provider' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została ukryta w Twoim panelu',
        ]);
    }

    /**
     * Przywróć (unhide) ukrytą rezerwację
     * POST /provider/bookings/{id}/restore
     * 
     * Ustawia hidden_by_provider na false, robiąc rezerwację widoczną znowu
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Znajdź booking należący do tego providera (niezależnie od hidden status)
        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        // Jeśli już visible, zwróć success (idempotent)
        if (!$booking->hidden_by_provider) {
            return response()->json([
                'success' => true,
                'message' => 'Rezerwacja już była widoczna w Twoim panelu',
            ]);
        }

        // Przywróć (unhide) rezerwację dla providera
        $booking->update(['hidden_by_provider' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została przywrócona w Twoim panelu',
        ]);
    }
}
