<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Provider Bookings Controller
 * 
 * Zarządzanie rezerwacjami providera:
 * - Lista bookings z filtrowaniem
 * - Akcje: accept, reject, complete
 * - Bulk actions
 */
class ProviderBookingController extends Controller
{
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

        // DEBUG: pokaż wszystkie booking IDs w bazie
        $allBookingIds = Booking::pluck('id')->toArray();
        $annaBookingIds = Booking::where('provider_id', $user->id)->pluck('id')->toArray();

        // Pobierz bookings providera z paginacją (bez ukrytych)
        $bookingsPaginated = Booking::with(['customer:id,name', 'service:id,title'])
            ->where('provider_id', $user->id)
            ->where('hidden_by_provider', 0)
            ->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate($perPage);

        // Przygotuj dane
        $data = $bookingsPaginated->getCollection()->map(function ($booking) {
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
                'serviceAddress' => [
                    'street' => $booking->service_address ?? null,
                ],
                'customerNotes' => $booking->notes,
                'servicePrice' => (float) $booking->service_price,
                'totalPrice' => (float) $booking->total_price,
                'paymentStatus' => $booking->payment_status,
                'status' => $booking->status,
                'canAccess' => true,
            ];
        });

        // Wszystkie bookings do statystyk (bez paginacji)
        $allBookings = $bookingsPaginated->getCollection();

        // Stats
        $counts = [
            'total' => $allBookings->count(),
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
            // DEBUG
            'debug_all_booking_ids' => $allBookingIds,
            'debug_anna_booking_ids' => $annaBookingIds,
            'debug_user_id' => $user->id,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została zaakceptowana',
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
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
            return response()->json(['error' => 'Booking is not pending'], 400);
        }

        $booking->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została odrzucona',
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
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

        if ($booking->status !== 'confirmed') {
            return response()->json(['error' => 'Booking is not confirmed'], 400);
        }

        $booking->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została oznaczona jako ukończona',
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
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
        $updated = Booking::where('provider_id', $user->id)
            ->where('status', 'confirmed')
            ->where('booking_date', '<', Carbon::today())
            ->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => "Oznaczono {$updated} rezerwacji jako ukończone",
            'count' => $updated,
        ]);
    }

    /**
     * Ukryj rezerwację w panelu providera
     * 
     * Provider ukrywa rezerwację tylko w swoim panelu.
     * Customer nadal widzi rezerwację w swoim panelu.
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Znajdź booking należący do tego providera
        $booking = Booking::where('provider_id', $user->id)
            ->where('id', $id)
            ->where('hidden_by_provider', 0)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Rezerwacja nie została znaleziona'], 404);
        }

        // Ukryj tylko dla providera
        $booking->update(['hidden_by_provider' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Rezerwacja została ukryta w Twoim panelu',
        ]);
    }
}
