<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificationResource;
use App\Http\Resources\PortfolioItemResource;
use App\Services\Api\AvailabilityApiService;
use App\Services\Api\VerificationApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla profilu providera
 */
class ProviderController extends Controller
{
    public function __construct(
        private VerificationApiService $verificationService,
        private AvailabilityApiService $availabilityService,
    ) {
    }

    /**
     * GET /api/v1/providers/{providerId}/verification
     * Weryfikacje providera
     */
    public function verifications(int $providerId): JsonResponse
    {
        $verifications = $this->verificationService->getProviderVerifications($providerId);

        return response()->json(['data' => $verifications]);
    }

    /**
     * GET /api/v1/providers/{providerId}/trust-score
     * Trust score providera
     */
    public function trustScore(int $providerId): JsonResponse
    {
        $score = $this->verificationService->getTrustScore($providerId);

        return response()->json([
            'data' => [
                'trust_score' => $score,
                'is_verified' => $score >= 50,
            ],
        ]);
    }

    /**
     * GET /api/v1/providers/{providerId}/certifications
     * Certyfikaty providera
     */
    public function certifications(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'verified_only' => 'boolean',
        ]);

        $certifications = $this->verificationService->listCertifications($providerId, $validated);

        return response()->json([
            'data' => CertificationResource::collection($certifications),
            'meta' => [
                'current_page' => $certifications->currentPage(),
                'per_page' => $certifications->perPage(),
                'total' => $certifications->total(),
                'last_page' => $certifications->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/providers/{providerId}/portfolio
     * Portfolio providera
     */
    public function portfolio(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'verified_only' => 'boolean',
        ]);

        $portfolio = $this->verificationService->listPortfolio($providerId, $validated);

        return response()->json([
            'data' => PortfolioItemResource::collection($portfolio),
            'meta' => [
                'current_page' => $portfolio->currentPage(),
                'per_page' => $portfolio->perPage(),
                'total' => $portfolio->total(),
                'last_page' => $portfolio->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/providers/{providerId}/schedule
     * Harmonogram dostępności providera
     */
    public function schedule(int $providerId): JsonResponse
    {
        $schedule = $this->availabilityService->getProviderSchedule($providerId);

        return response()->json(['data' => $schedule]);
    }

    /**
     * GET /api/v1/providers/{providerId}/available-slots
     * Dostępne sloty dla providera
     */
    public function availableSlots(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'duration_minutes' => 'integer|min:30|max:480',
        ]);

        $slots = $this->availabilityService->getAvailableSlots(
            $providerId,
            $validated['date'],
            $validated['duration_minutes'] ?? 120
        );

        return response()->json(['data' => ['slots' => $slots]]);
    }
}
