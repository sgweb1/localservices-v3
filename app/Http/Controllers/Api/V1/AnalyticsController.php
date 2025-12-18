<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Api\AnalyticsApiService;
use App\Http\Resources\ProviderMetricResource;
use App\Http\Resources\SearchAnalyticResource;
use App\Http\Resources\ApiEndpointMetricResource;
use App\Http\Resources\ConversionResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * AnalyticsController - API endpoints dla Analytics System
 * 
 * Routes:
 * - GET /api/v1/analytics/providers/{id}/metrics (metryki providera)
 * - GET /api/v1/analytics/endpoints (metryki API endpoints)
 * - GET /api/v1/analytics/funnel (conversion funnel)
 * - GET /api/v1/analytics/search (metryki wyszukiwań)
 * - GET /api/v1/analytics/dashboard (podsumowanie)
 */
class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsApiService $analyticsService) {}

    /**
     * GET /api/v1/analytics/providers/{id}/metrics
     * Pobierz metryki providera na podany okres
     */
    public function providerMetrics(Request $request, int $providerId)
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $dateFrom = isset($validated['date_from']) && $validated['date_from'] ? Carbon::parse($validated['date_from']) : null;
        $dateTo = isset($validated['date_to']) && $validated['date_to'] ? Carbon::parse($validated['date_to']) : null;

        $metrics = $this->analyticsService->getProviderMetrics($providerId, $dateFrom, $dateTo);

        return response()->json([
            'data' => ProviderMetricResource::collection($metrics),
            'meta' => [
                'current_page' => $metrics->currentPage(),
                'per_page' => $metrics->perPage(),
                'total' => $metrics->total(),
                'last_page' => $metrics->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/analytics/providers/{id}/today
     * Pobierz dzisiejsze metryki providera
     */
    public function providerTodayMetrics(int $providerId)
    {
        $metrics = $this->analyticsService->getProviderTodayMetrics($providerId);

        return response()->json([
            'data' => $metrics,
        ]);
    }

    /**
     * GET /api/v1/analytics/endpoints
     * Pobierz metryki dla wszystkich endpointów
     */
    public function endpointMetrics(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validated['endpoint'] ?? null) {
            $endpoint = $validated['endpoint'];
            $dateFrom = isset($validated['date_from']) && $validated['date_from'] ? Carbon::parse($validated['date_from']) : null;
            $dateTo = isset($validated['date_to']) && $validated['date_to'] ? Carbon::parse($validated['date_to']) : null;

            $metrics = $this->analyticsService->getApiEndpointMetrics($endpoint, $dateFrom, $dateTo);

            return response()->json([
                'data' => ApiEndpointMetricResource::collection($metrics),
                'meta' => [
                    'current_page' => $metrics->currentPage(),
                    'per_page' => $metrics->perPage(),
                    'total' => $metrics->total(),
                    'last_page' => $metrics->lastPage(),
                ],
            ]);
        }

        // Return all endpoints for today
        $todayMetrics = $this->analyticsService->getTodayAllEndpointsMetrics();

        return response()->json([
            'data' => $todayMetrics,
        ]);
    }

    /**
     * GET /api/v1/analytics/funnel
     * Pobierz metryki conversion funnel (booking flow)
     */
    public function funnelMetrics(Request $request)
    {
        $validated = $request->validate([
            'funnel_name' => 'required|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $dateFrom = isset($validated['date_from']) && $validated['date_from'] ? Carbon::parse($validated['date_from']) : null;
        $dateTo = isset($validated['date_to']) && $validated['date_to'] ? Carbon::parse($validated['date_to']) : null;

        $funnelData = $this->analyticsService->getFunnelMetrics($validated['funnel_name'], $dateFrom, $dateTo);

        return response()->json([
            'data' => $funnelData,
        ]);
    }

    /**
     * GET /api/v1/analytics/search
     * Pobierz analitykę wyszukiwań
     */
    public function searchMetrics(Request $request)
    {
        $validated = $request->validate([
            'service_category' => 'nullable|string',
            'city' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $filters = array_filter($validated, fn($value) => $value !== null);
        $metrics = $this->analyticsService->getSearchMetrics($filters);

        return response()->json([
            'data' => SearchAnalyticResource::collection($metrics),
            'meta' => [
                'current_page' => $metrics->currentPage(),
                'per_page' => $metrics->perPage(),
                'total' => $metrics->total(),
                'last_page' => $metrics->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/analytics/search-stats
     * Pobierz podsumowanie statystyk wyszukiwań
     */
    public function searchStats()
    {
        $stats = $this->analyticsService->getSearchConversionStats();

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/v1/analytics/dashboard
     * Pobierz summary dla dashboardu (health check)
     */
    public function dashboard()
    {
        $summary = $this->analyticsService->getDashboardSummary();

        return response()->json([
            'data' => $summary,
        ]);
    }
}
