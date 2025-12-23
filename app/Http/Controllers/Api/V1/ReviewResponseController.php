<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewResponseController extends Controller
{
    /**
     * POST /api/v1/provider/reviews/{review}/response
     * Tworzy lub aktualizuje odpowiedź providera na recenzję (jeden provider = jedna odpowiedź).
     */
    public function store(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Provider może odpowiadać tylko na recenzje, które dotyczą jego konta
        if ((int) $review->reviewed_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'response' => 'required|string|min:2|max:2000',
        ]);

        $existing = ReviewResponse::where('review_id', $review->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Już odpowiedziałeś na tę opinię. Edycja nie jest możliwa.',
            ], 409);
        }

        $response = ReviewResponse::create([
            'review_id' => $review->id,
            'user_id' => $user->id,
            'response' => $validated['response'],
            'is_visible' => true,
        ]);

        return response()->json([
            'data' => [
                'id' => $response->id,
                'response' => $response->response,
                'created_at' => optional($response->created_at)->toIso8601String(),
                'updated_at' => optional($response->updated_at)->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * DELETE /api/v1/provider/reviews/{review}/response
     * Usuwa odpowiedź providera na recenzję.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Autoryzacja
        if ((int) $review->reviewed_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $response = ReviewResponse::where('review_id', $review->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$response) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $response->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
