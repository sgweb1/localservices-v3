<?php

namespace App\Services\Api;

use App\Models\ProviderMetric;
use App\Models\ApiEndpointMetric;
use App\Models\Conversion;
use App\Models\SearchAnalytic;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * AnalyticsApiService - Business logic dla analytics
 * 
 * Metody:
 * - getProviderMetrics(providerId, date_from, date_to)
 * - getApiEndpointMetrics(endpoint, method, date_from, date_to)
 * - getFunnelMetrics(funnel_name, date_from, date_to)
 * - getSearchMetrics(filters)
 * - getDashboardSummary()
 */
class AnalyticsApiService
{
    /**
     * Pobierz metryki providera na podany okres
     */
    public function getProviderMetrics(int $providerId, ?Carbon $dateFrom = null, ?Carbon $dateTo = null): LengthAwarePaginator
    {
        $dateFrom ??= now()->subDays(30);
        $dateTo ??= now();

        return ProviderMetric::where('provider_id', $providerId)
            ->whereBetween('metric_date', [$dateFrom, $dateTo])
            ->orderBy('metric_date', 'desc')
            ->paginate(10);
    }

    /**
     * Pobierz szczegółowe metryki providera na dzisiejszy dzień
     */
    public function getProviderTodayMetrics(int $providerId): array
    {
        $metric = ProviderMetric::where('provider_id', $providerId)
            ->where('metric_date', now()->toDateString())
            ->first();

        if (!$metric) {
            return [
                'bookings_completed' => 0,
                'bookings_cancelled' => 0,
                'cancellation_rate' => 0,
                'avg_response_time_minutes' => 0,
                'avg_rating' => 0,
                'utilization_rate' => 0,
                'total_revenue' => 0,
            ];
        }

        return [
            'bookings_completed' => $metric->bookings_completed,
            'bookings_cancelled' => $metric->bookings_cancelled,
            'cancellation_rate' => $metric->cancellation_rate,
            'avg_response_time_minutes' => $metric->avg_response_time_minutes,
            'avg_rating' => $metric->avg_rating,
            'utilization_rate' => $metric->utilization_rate,
            'total_revenue' => $metric->total_revenue,
        ];
    }

    /**
     * Pobierz metryki API endpoints
     */
    public function getApiEndpointMetrics(string $endpoint, ?Carbon $dateFrom = null, ?Carbon $dateTo = null): LengthAwarePaginator
    {
        $dateFrom ??= now()->subDays(30);
        $dateTo ??= now();

        return ApiEndpointMetric::where('endpoint', $endpoint)
            ->whereBetween('metric_date', [$dateFrom, $dateTo])
            ->orderBy('metric_date', 'desc')
            ->paginate(10);
    }

    /**
     * Pobierz metryki dla wszystkich endpointów na dzisiaj
     */
    public function getTodayAllEndpointsMetrics(): array
    {
        $metrics = ApiEndpointMetric::where('metric_date', now()->toDateString())
            ->get()
            ->groupBy('endpoint')
            ->map(function ($endpointMetrics) {
                $latestMetric = $endpointMetrics->first();
                
                return [
                    'endpoint' => $latestMetric->endpoint,
                    'method' => $latestMetric->method,
                    'request_count' => $latestMetric->request_count,
                    'error_rate' => $latestMetric->error_rate,
                    'avg_response_time_ms' => $latestMetric->avg_response_time_ms,
                    'p95_response_time_ms' => $latestMetric->p95_response_time_ms,
                ];
            })
            ->values()
            ->toArray();

        return $metrics;
    }

    /**
     * Pobierz metryki funnel (booking flow)
     */
    public function getFunnelMetrics(string $funnelName, ?Carbon $dateFrom = null, ?Carbon $dateTo = null): array
    {
        $dateFrom ??= now()->subDays(30);
        $dateTo ??= now();

        $conversions = Conversion::where('funnel_name', $funnelName)
            ->whereBetween('reached_at', [$dateFrom, $dateTo])
            ->get();

        $stages = [
            0 => 'search',
            1 => 'viewed_profile',
            2 => 'viewed_price',
            3 => 'booking_started',
            4 => 'booking_completed',
        ];

        $funnelData = [];
        foreach ($stages as $stageNum => $stageName) {
            $stageConversions = $conversions->where('stage', $stageNum);
            $completed = $stageConversions->where('completed', true)->count();
            $dropped = $stageConversions->where('completed', false)->count();

            $funnelData[] = [
                'stage' => $stageNum,
                'stage_name' => $stageName,
                'reached' => $stageConversions->count(),
                'completed' => $completed,
                'dropped' => $dropped,
                'drop_rate' => $stageConversions->count() > 0 
                    ? round(($dropped / $stageConversions->count()) * 100, 2)
                    : 0,
                'avg_time_seconds' => $stageConversions->avg('time_in_stage_seconds') ?? 0,
            ];
        }

        return $funnelData;
    }

    /**
     * Pobierz metryki wyszukiwań
     */
    public function getSearchMetrics(array $filters = []): LengthAwarePaginator
    {
        $query = SearchAnalytic::query();

        if (isset($filters['service_category'])) {
            $query->where('service_category', $filters['service_category']);
        }

        if (isset($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    /**
     * Pobierz statystyki konwersji dla wyszukiwań
     */
    public function getSearchConversionStats(): array
    {
        $totalSearches = SearchAnalytic::count();
        $withClicks = SearchAnalytic::where('results_clicked', '>', 0)->count();
        $withConversion = SearchAnalytic::where('conversion_happened', true)->count();

        return [
            'total_searches' => $totalSearches,
            'searches_with_clicks' => $withClicks,
            'searches_with_conversion' => $withConversion,
            'click_through_rate' => $totalSearches > 0 ? round(($withClicks / $totalSearches) * 100, 2) : 0,
            'conversion_rate' => $totalSearches > 0 ? round(($withConversion / $totalSearches) * 100, 2) : 0,
            'avg_time_to_booking_seconds' => SearchAnalytic::where('conversion_happened', true)->avg('time_to_booking_seconds') ?? 0,
        ];
    }

    /**
     * Pobierz summary dashboard
     */
    public function getDashboardSummary(): array
    {
        $today = now()->toDateString();

        // API health
        $todayMetrics = ApiEndpointMetric::where('metric_date', $today)->get();
        $avgErrorRate = $todayMetrics->avg('error_rate') ?? 0;
        $avgResponseTime = $todayMetrics->avg('avg_response_time_ms') ?? 0;

        // Provider metrics
        $providerMetrics = ProviderMetric::where('metric_date', $today)->get();
        $totalRevenue = $providerMetrics->sum('total_revenue');
        $avgRating = $providerMetrics->avg('avg_rating') ?? 0;

        // Conversions
        $todayConversions = Conversion::where('reached_at', '>=', now()->startOfDay())->get();
        $completedConversions = $todayConversions->where('completed', true)->count();

        // Search stats
        $searchStats = $this->getSearchConversionStats();

        return [
            'api' => [
                'avg_error_rate' => $avgErrorRate,
                'avg_response_time_ms' => $avgResponseTime,
                'total_requests' => $todayMetrics->sum('request_count'),
            ],
            'providers' => [
                'total_revenue' => $totalRevenue,
                'avg_rating' => $avgRating,
                'total_bookings_completed' => $providerMetrics->sum('bookings_completed'),
            ],
            'conversions' => [
                'completed_today' => $completedConversions,
                'total_in_funnel' => $todayConversions->count(),
            ],
            'search' => $searchStats,
        ];
    }
}
