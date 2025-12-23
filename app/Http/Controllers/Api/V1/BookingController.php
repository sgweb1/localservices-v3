<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\Api\BookingApiService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * API Controller dla rezerwacji
 */
class BookingController extends Controller
{
    public function __construct(
        private BookingApiService $service,
        private NotificationService $notificationService
    ) {
    }

    /**
     * GET /api/v1/bookings
     * Lista rezerwacji z paginacją i filtrowaniem
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'provider_id' => 'integer|exists:users,id',
            'customer_id' => 'integer|exists:users,id',
            'status' => 'string|in:confirmed,completed,cancelled,in_progress',
            'service_id' => 'integer|exists:services,id',
            'sort_by' => 'string|in:booking_date,created_at,total_price',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $bookings = $this->service->list($validated);

        return response()->json([
            'data' => BookingResource::collection($bookings),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/bookings/{id}
     * Szczegóły rezerwacji
     */
    public function show(int $id): JsonResponse
    {
        $booking = $this->service->getById($id);

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie znaleziona'], 404);
        }

        return response()->json(['data' => new BookingResource($booking)]);
    }

    /**
     * GET /api/v1/providers/{providerId}/bookings
     * Rezerwacje dla providera
     */
    public function providerBookings(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'status' => 'string|in:confirmed,completed,cancelled,in_progress',
            'sort_by' => 'string|in:booking_date,created_at,total_price',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $bookings = $this->service->getProviderBookings($providerId, $validated);

        return response()->json([
            'data' => BookingResource::collection($bookings),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/customers/{customerId}/bookings
     * Rezerwacje dla customera
     */
    public function customerBookings(int $customerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'status' => 'string|in:confirmed,completed,cancelled,in_progress',
            'sort_by' => 'string|in:booking_date,created_at,total_price',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $bookings = $this->service->getCustomerBookings($customerId, $validated);

        return response()->json([
            'data' => BookingResource::collection($bookings),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/bookings
     * Utwórz nową rezerwację (Instant Booking)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => [
                'required',
                'integer',
                'exists:users,id',
                Rule::notIn([auth()->id()]), // Blokada self-booking
            ],
            'service_id' => 'required|integer|exists:services,id',
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'duration_minutes' => 'nullable|integer|min:15',
            'service_address' => 'required|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'customer_notes' => 'nullable|string|max:1000',
            'special_requirements' => 'nullable|array',
        ], [
            'provider_id.not_in' => 'Nie możesz rezerwować własnych usług',
        ]);

        // Pobierz service dla ceny
        $service = \App\Models\Service::findOrFail($validated['service_id']);

        // Utwórz rezerwację
        $booking = \App\Models\Booking::create([
            'customer_id' => auth()->id(),
            'provider_id' => $validated['provider_id'],
            'service_id' => $validated['service_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'service_address' => $validated['service_address'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'service_price' => $service->base_price ?? 0,
            'travel_fee' => 0,
            'platform_fee' => 0,
            'total_price' => $service->base_price ?? 0,
            'currency' => 'PLN',
            'payment_status' => 'pending',
            'status' => 'confirmed', // Instant booking
            'customer_notes' => $validated['customer_notes'] ?? null,
            'special_requirements' => $validated['special_requirements'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja utworzona',
            'data' => new BookingResource($booking->fresh(['service', 'customer', 'provider'])),
        ], 201);
    }

    /**
     * PATCH /api/v1/provider/bookings/{id}/confirm
     * Potwierdź rezerwację (tylko provider, sprawdza limity slotu)
     */
    public function confirm(int $id, Request $request): JsonResponse
    {
        $booking = \App\Models\Booking::find($id);
        
        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie znaleziona'], 404);
        }
        
        // Sprawdź czy provider jest właścicielem
        if ($booking->provider_id !== $request->user()->id) {
            return response()->json(['error' => 'Brak uprawnień'], 403);
        }
        
        // Sprawdź czy rezerwacja jest w statusie pending
        if ($booking->status !== 'pending') {
            return response()->json(['error' => 'Można potwierdzić tylko oczekujące rezerwacje'], 400);
        }
        
        // Znajdź slot dla tej rezerwacji
        $slot = \App\Models\Availability::where('provider_id', $booking->provider_id)
            ->where('day_of_week', date('N', strtotime($booking->booking_date)))
            ->where('start_time', $booking->start_time)
            ->first();
        
        if (!$slot) {
            return response()->json(['error' => 'Slot nie znaleziony'], 404);
        }
        
        // Policz potwierdzone rezerwacje dla tego slotu w tym dniu
        $confirmedCount = \App\Models\Booking::where('provider_id', $booking->provider_id)
            ->where('booking_date', $booking->booking_date)
            ->where('start_time', $booking->start_time)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->count();
        
        // Sprawdź limit
        if ($confirmedCount >= $slot->max_bookings) {
            return response()->json([
                'error' => 'Osiągnięto maksymalną liczbę rezerwacji dla tego slotu',
                'max_bookings' => $slot->max_bookings,
                'current_bookings' => $confirmedCount
            ], 422);
        }
        
        // Potwierdź rezerwację
        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
        
        // Wyślij powiadomienie do customera
        $this->sendBookingConfirmedNotification($booking);
        
        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja potwierdzona',
            'data' => new BookingResource($booking->fresh())
        ]);
    }

    /**
     * Wysyła powiadomienie o potwierdzeniu rezerwacji
     */
    private function sendBookingConfirmedNotification(\App\Models\Booking $booking): void
    {
        $this->notificationService->send(
            eventKey: 'booking.confirmed',
            user: $booking->customer,
            recipientType: 'customer',
            variables: [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
                'service_name' => $booking->service?->name ?? 'Usługa',
                'provider_name' => $booking->provider?->name ?? 'Usługodawca',
                'scheduled_at' => $booking->scheduled_at?->format('Y-m-d H:i') ?? '',
            ]
        );
    }

    /**
     * PATCH /api/v1/provider/bookings/{id}/reject
     * Odrzuć rezerwację pending lub confirmed (tylko provider)
     */
    public function reject(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $booking = \App\Models\Booking::find($id);
        
        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie znaleziona'], 404);
        }
        
        // Sprawdź czy provider jest właścicielem
        if ($booking->provider_id !== $request->user()->id) {
            return response()->json(['error' => 'Brak uprawnień'], 403);
        }
        
        // Sprawdź czy rezerwacja jest pending lub confirmed
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'error' => 'Można odrzucić tylko oczekujące lub potwierdzone rezerwacje',
                'current_status' => $booking->status
            ], 400);
        }
        
        // Odrzuć rezerwację
        $booking->update([
            'status' => 'rejected',
            'cancelled_by' => $request->user()->id,
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['reason'] ?? 'Odrzucone przez providera',
        ]);
        
        // Wyślij powiadomienie do customera (jeśli ma włączone)
        $this->sendBookingRejectedNotification($booking);
        
        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja odrzucona',
            'data' => new BookingResource($booking->fresh())
        ]);
    }

    /**
     * Wysyła powiadomienie o odrzuceniu rezerwacji zgodnie z preferencjami customera
     */
    private function sendBookingRejectedNotification(\App\Models\Booking $booking): void
    {
        $this->notificationService->send(
            eventKey: 'booking.rejected',
            user: $booking->customer,
            recipientType: 'customer',
            variables: [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
                'service_name' => $booking->service?->name ?? 'Usługa',
                'provider_name' => $booking->provider?->name ?? 'Usługodawca',
                'reason' => $booking->cancellation_reason ?? 'Brak powodu',
                'scheduled_at' => $booking->scheduled_at?->format('Y-m-d H:i') ?? '',
            ]
        );
    }
}
