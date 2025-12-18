<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\Api\BookingApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla rezerwacji
 */
class BookingController extends Controller
{
    public function __construct(private BookingApiService $service)
    {
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
}
