<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Api\VisibilityPreviewService;
use App\Services\VisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * VisibilityController - API dla rankingu i widoczności providerów
 */
class VisibilityController extends Controller
{
    public function __construct(
        private VisibilityPreviewService $previewService,
        private VisibilityService $visibilityService
    ) {}

    /**
     * GET /api/v1/visibility/preview
     */
    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city' => 'required|string|exists:locations,slug',
            'category' => 'required|string|exists:service_categories,slug',
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
        ]);

        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 10;

        $result = $this->previewService->preview(
            $validated['city'],
            $validated['category'],
            $perPage,
            $page
        );

        return response()->json($result);
    }

    /**
     * GET /api/v1/visibility/providers/{city}
     *
     * Pobiera ranking providerów dla danego miasta z boost'ami
     *
     * @param  Request  $request  Z opcjonalnymi parametrami: category, page, per_page, sort
     * @param  string  $city  Slug miasta (np. warszawa)
     * @return JsonResponse Lista providerów posortowana po rankingu
     */
    public function providers(Request $request, string $city): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort' => 'nullable|in:rank_score,trust_score',
        ]);

        $category = $validated['category'] ?? null;
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 20;

        try {
            $result = $this->visibilityService->rankProviders($city, $category, $perPage, $page);

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Błąd podczas pobierania rankingu: '.$e->getMessage(),
            ], 500);
        }
    }
}
