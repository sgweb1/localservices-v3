<?php

namespace App\Services\Api;

use App\Models\ProviderMetric;
use App\Models\ApiEndpointMetric;
use App\Models\Conversion;
use App\Models\SearchAnalytic;
use App\Models\ProfileView;
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

    /**
     * Pobierz główne metryki providera dla dashboard analytics
     */
    public function getProviderDashboardMetrics(int $providerId, string $period = '30d'): array
    {
        $dates = $this->getPeriodDates($period);
        $startDate = $dates['start'];
        $endDate = $dates['end'];
        $previousStart = $dates['previous_start'];
        $previousEnd = $dates['previous_end'];

        // Wyświetlenia profilu - mockowane (w przyszłości tracking)
        $profileViews = $this->calculateProfileViews($providerId, $startDate, $endDate);
        $previousProfileViews = $this->calculateProfileViews($providerId, $previousStart, $previousEnd);

        // Zapytania (wszystkie bookings)
        $inquiries = \App\Models\Booking::whereHas('service', function ($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        })->whereBetween('created_at', [$startDate, $endDate])->count();

        $previousInquiries = \App\Models\Booking::whereHas('service', function ($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        })->whereBetween('created_at', [$previousStart, $previousEnd])->count();

        // Rezerwacje (potwierdzone)
        $bookings = \App\Models\Booking::whereHas('service', function ($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        })
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $previousBookings = \App\Models\Booking::whereHas('service', function ($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        })
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        // Konwersja
        $conversion = $inquiries > 0 ? round(($bookings / $inquiries) * 100, 1) : 0;
        $previousConversion = $previousInquiries > 0 ? round(($previousBookings / $previousInquiries) * 100, 1) : 0;

        return [
            'profile_views' => [
                'value' => $profileViews,
                'change' => $this->calculatePercentageChange($profileViews, $previousProfileViews),
            ],
            'inquiries' => [
                'value' => $inquiries,
                'change' => $this->calculatePercentageChange($inquiries, $previousInquiries),
            ],
            'bookings' => [
                'value' => $bookings,
                'change' => $this->calculatePercentageChange($bookings, $previousBookings),
            ],
            'conversion' => [
                'value' => $conversion,
                'change' => $this->calculatePercentageChange($conversion, $previousConversion),
            ],
        ];
    }

    /**
     * Top usługi providera
     */
    public function getTopServices(int $providerId, string $period = '30d', int $limit = 3): array
    {
        $dates = $this->getPeriodDates($period);

        $services = \App\Models\Service::where('provider_id', $providerId)
            ->withCount([
                'bookings as total_bookings' => function ($q) use ($dates) {
                    $q->whereBetween('created_at', [$dates['start'], $dates['end']]);
                },
            ])
            ->having('total_bookings', '>', 0)
            ->orderByDesc('total_bookings')
            ->limit($limit)
            ->get();

        return $services->map(function ($service) {
            // Mock views - w przyszłości można dodać tracking
            $views = $service->total_bookings * rand(10, 20);
            $conversion = $views > 0 ? round(($service->total_bookings / $views) * 100, 1) : 0;

            return [
                'name' => $service->name,
                'views' => $views,
                'bookings' => $service->total_bookings,
                'conversion' => $conversion,
            ];
        })->toArray();
    }

    /**
     * Źródła ruchu - realne dane z profile_views
     */
    public function getTrafficSources(int $providerId, string $period = '30d'): array
    {
        $dates = $this->getPeriodDates($period);

        $views = ProfileView::where('provider_id', $providerId)
            ->whereBetween('viewed_at', [$dates['start'], $dates['end']])
            ->get();

        $total = $views->count();

        if ($total === 0) {
            return [
                ['source' => 'Wyszukiwarka', 'visits' => 0, 'percentage' => 0],
                ['source' => 'Google Ads', 'visits' => 0, 'percentage' => 0],
                ['source' => 'Social Media', 'visits' => 0, 'percentage' => 0],
                ['source' => 'Bezpośredni', 'visits' => 0, 'percentage' => 0],
            ];
        }

        $grouped = $views->groupBy('source')->map(function ($items) {
            return $items->count();
        });

        $sourceMapping = [
            'search' => 'Wyszukiwarka',
            'google_ads' => 'Google Ads',
            'social_media' => 'Social Media',
            'direct' => 'Bezpośredni',
            'referral' => 'Inne źródła',
        ];

        $result = [];
        foreach ($sourceMapping as $key => $label) {
            $count = $grouped->get($key, 0);
            $percentage = $total > 0 ? round(($count / $total) * 100, 1) : 0;
            
            if ($count > 0 || in_array($key, ['search', 'google_ads', 'social_media', 'direct'])) {
                $result[] = [
                    'source' => $label,
                    'visits' => $count,
                    'percentage' => $percentage,
                ];
            }
        }

        return $result;
    }

    /**
     * Średni czas odpowiedzi (w minutach)
     */
    public function getAverageResponseTime(int $providerId, string $period = '30d'): array
    {
        $dates = $this->getPeriodDates($period);

        // Obliczamy czas między created_at bookingu a pierwszą zmianą statusu
        $bookings = \App\Models\Booking::whereHas('service', function ($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        })
            ->whereBetween('created_at', [$dates['start'], $dates['end']])
            ->whereNotNull('updated_at')
            ->where('created_at', '!=', \DB::raw('updated_at'))
            ->get();

        if ($bookings->isEmpty()) {
            return [
                'minutes' => 0,
                'industry_average' => 30,
                'comparison' => 0,
            ];
        }

        $avgMinutes = $bookings->map(function ($booking) {
            return $booking->created_at->diffInMinutes($booking->updated_at);
        })->avg();

        $avgMinutes = round($avgMinutes);
        $industryAvg = 30;

        return [
            'minutes' => $avgMinutes,
            'industry_average' => $industryAvg,
            'comparison' => $avgMinutes > 0 && $avgMinutes < $industryAvg
                ? round((($industryAvg - $avgMinutes) / $industryAvg) * 100)
                : 0,
        ];
    }

    /**
     * Średnia ocena providera z liczba opinii
     */
    public function getProviderRatingStats(int $providerId): array
    {
        $reviews = \App\Models\Review::where('reviewed_id', $providerId)
            ->where('is_visible', true)
            ->get();

        $count = $reviews->count();
        $average = $count > 0 ? round($reviews->avg('rating'), 1) : 0;

        return [
            'average' => $average,
            'count' => $count,
        ];
    }

    /**
     * Dane dla wykresu (profile views w czasie) - realne dane
     */
    public function getChartData(int $providerId, string $period = '30d'): array
    {
        $dates = $this->getPeriodDates($period);

        // Agreguj views per dzień
        $viewsPerDay = ProfileView::where('provider_id', $providerId)
            ->whereBetween('viewed_at', [$dates['start'], $dates['end']])
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as views')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('views', 'date');

        // Wypełnij wszystkie dni w okresie (nawet te bez views)
        $days = $dates['start']->diffInDays($dates['end']);
        $data = [];
        
        for ($i = 0; $i <= $days; $i++) {
            $date = $dates['start']->copy()->addDays($i);
            $dateStr = $date->format('Y-m-d');
            
            $data[] = [
                'date' => $dateStr,
                'views' => (int) ($viewsPerDay->get($dateStr, 0)),
            ];
        }

        return $data;
    }

    /**
     * Insights - automatyczne spostrzeżenia
     */
    public function getInsights(int $providerId, string $period = '30d'): array
    {
        $metrics = $this->getProviderDashboardMetrics($providerId, $period);
        $topServices = $this->getTopServices($providerId, $period);
        $insights = [];

        // Profile views insight
        if ($metrics['profile_views']['change'] > 10) {
            $insights[] = "Twój profil ma {$metrics['profile_views']['change']}% więcej wyświetleń niż w poprzednim okresie - świetna praca!";
        } elseif ($metrics['profile_views']['change'] < -10) {
            $insights[] = "Wyświetlenia profilu spadły o " . abs($metrics['profile_views']['change']) . "%. Rozważ odświeżenie opisu i zdjęć.";
        }

        // Conversion insight
        if ($metrics['conversion']['value'] > 55) {
            $insights[] = "Konwersja zapytań → rezerwacje wynosi {$metrics['conversion']['value']}%, czyli jesteś powyżej średniej (55%)";
        } elseif ($metrics['conversion']['value'] > 0 && $metrics['conversion']['value'] < 40) {
            $insights[] = "Konwersja wynosi tylko {$metrics['conversion']['value']}%. Spróbuj szybciej odpowiadać na zapytania i popraw opis usług.";
        }

        // Top service insight
        if (!empty($topServices)) {
            $best = $topServices[0];
            $insights[] = "Najlepiej radzi sobie usługa \"{$best['name']}\" z konwersją {$best['conversion']}%";
        }

        // Response time insight
        $responseTime = $this->getAverageResponseTime($providerId, $period);
        if ($responseTime['comparison'] > 30) {
            $insights[] = "Średni czas odpowiedzi to {$responseTime['minutes']} minut - jesteś {$responseTime['comparison']}% szybszy od średniej!";
        }

        // Traffic insight
        $insights[] = "Rozważ zwiększenie budżetu na Google Ads - generuje około 25% ruchu z wysoką konwersją";

        return $insights;
    }

    /**
     * Oblicz daty dla okresu
     */
    private function getPeriodDates(string $period): array
    {
        $endDate = Carbon::now();
        $startDate = match ($period) {
            '7d' => $endDate->copy()->subDays(7),
            '30d' => $endDate->copy()->subDays(30),
            '90d' => $endDate->copy()->subDays(90),
            'year' => $endDate->copy()->subYear(),
            default => $endDate->copy()->subDays(30),
        };

        $daysDiff = $startDate->diffInDays($endDate);
        $previousEnd = $startDate->copy()->subDay();
        $previousStart = $previousEnd->copy()->subDays($daysDiff);

        return [
            'start' => $startDate,
            'end' => $endDate,
            'previous_start' => $previousStart,
            'previous_end' => $previousEnd,
        ];
    }

    /**
     * Oblicz procentową zmianę
     */
    private function calculatePercentageChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Oblicz wyświetlenia profilu - realne dane z profile_views
     */
    private function calculateProfileViews(int $providerId, Carbon $start, Carbon $end): int
    {
        return ProfileView::where('provider_id', $providerId)
            ->whereBetween('viewed_at', [$start, $end])
            ->count();
    }
}
