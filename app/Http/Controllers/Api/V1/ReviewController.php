<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Services\Api\ReviewApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla recenzji
 */
class ReviewController extends Controller
{
    public function __construct(private ReviewApiService $service)
    {
    }

    /**
     * GET /api/v1/reviews
     * Lista recenzji
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'provider_id' => 'integer|exists:users,id',
            'service_id' => 'integer|exists:services,id',
            'rating_min' => 'integer|min:1|max:5',
            'rating_max' => 'integer|min:1|max:5',
            'sort_by' => 'string|in:rating,created_at',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $reviews = $this->service->list($validated);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/reviews/{id}
     * Szczegóły recenzji
     */
    public function show(int $id): JsonResponse
    {
        $review = $this->service->getById($id);

        if (!$review) {
            return response()->json(['error' => 'Recenzja nie znaleziona'], 404);
        }

        return response()->json(['data' => new ReviewResource($review)]);
    }

    /**
     * GET /api/v1/providers/{providerId}/reviews
     * Recenzje dla providera
     */
    public function providerReviews(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'rating_min' => 'integer|min:1|max:5',
            'rating_max' => 'integer|min:1|max:5',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $reviews = $this->service->getProviderReviews($providerId, $validated);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/providers/{providerId}/rating
     * Średnia ocena providera
     */
    public function providerRating(int $providerId): JsonResponse
    {
        $rating = $this->service->getProviderRating($providerId);

        return response()->json(['data' => $rating]);
    }
}
