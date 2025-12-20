<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Models\Booking;
use App\Models\BookingRequest;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Serwis API dla dashboardu providera
 * 
 * Logika biznesowa skopiowana 1:1 z LocalServices DashboardNew Livewire component.
 * Każda metoda prepare* zwraca dane dla konkretnego widgetu dashboardu.
 */
class ProviderDashboardApiService
{
    /**
     * Pobiera wszystkie dane dla dashboardu providera
     * 
     * @param User $provider Użytkownik typu provider
     * @return array<string, mixed> Dane wszystkich widgetów
     */
    public function getDashboardWidgets(User $provider): array
    {
        // Załaduj relacje potrzebne dla wszystkich widgetów
        $provider->load([
            'providerProfile:id,user_id,trust_score,response_time_hours,completion_rate,repeat_customers,cancellation_rate',
        ]);

        // Załaduj subscription tylko jeśli istnieje (opcjonalne eager loading)
        $provider->loadMissing(['subscription' => function ($query) {
            $query->with('subscriptionPlan');
        }]);

        return [
            'plan' => $this->preparePlanCard($provider),
            'addons' => $this->prepareAddonsCarousel($provider),
            'pipeline' => $this->preparePipelineBoard($provider),
            'insights' => $this->prepareInsightsCard($provider),
            'tasks' => $this->prepareTasksCard($provider),
            'performance' => $this->preparePerformanceSnapshot($provider),
            'calendar' => $this->prepareCalendarGlance($provider),
            'messages' => $this->prepareMessageCenter($provider),
            'notifications' => $this->prepareNotificationsCard($provider),
            'services' => $this->prepareServicesCard($provider),
            'live_activity' => $this->prepareLiveActivityFeed($provider),
        ];
    }

    /**
     * Widget: Plan Card
     * 
     * Wyświetla aktywny plan subskrypcji, datę wygaśnięcia oraz limity
     * (max_listings, max_service_categories) z paskami progresu i ostrzeżeniami.
     * 
     * @param User $provider
     * @return array{plan_name: string, plan_slug: string, expires_at: string|null, items: array}
     */
    protected function preparePlanCard(User $provider): array
    {
        $plan = $provider->activePlan ?? null;

        $itemsConfig = [
            'max_listings' => [
                'title' => 'Ogłoszenia',
                'description' => 'Widoczne w katalogu',
                'icon' => 'heroicon-o-rectangle-stack',
            ],
            'max_service_categories' => [
                'title' => 'Kategorie usług',
                'description' => 'Zakres działalności',
                'icon' => 'heroicon-o-tag',
            ],
        ];

        $items = [];

        foreach ($itemsConfig as $key => $meta) {
            $usage = $provider->getLimitUsage($key);

            $items[] = [
                'key' => $key,
                'title' => $meta['title'],
                'description' => $meta['description'],
                'icon' => $meta['icon'],
                'current' => $usage['current'],
                'limit' => $usage['limit'],
                'percentage' => $usage['is_unlimited'] ? 0 : min(100, (int) $usage['percentage']),
                'is_unlimited' => $usage['is_unlimited'],
                'is_exceeded' => $usage['is_exceeded'],
            ];
        }

        return [
            'plan_name' => $plan?->name ?? 'FREE',
            'plan_slug' => $plan?->slug ?? 'free',
            'expires_at' => $provider->subscription_expires_at?->format('d.m.Y'),
            'items' => $items,
        ];
    }

    /**
     * Widget: Addons Carousel
     * 
     * Karuzela z dodatkami PRO (Instant Booking, Analityka PRO).
     * Każdy addon ma badge (Aktywne / Od PLAN), CTA do planów lub analytics.
     * 
     * @param User $provider
     * @return array<int, array{key: string, title: string, description: string, feature: string, required_plan: string, icon: string, available: bool, cta_url: string, badge: string}>
     */
    protected function prepareAddonsCarousel(User $provider): array
    {
        $defs = [
            [
                'key' => 'instant-booking',
                'title' => 'Instant Booking',
                'description' => 'Pozwalaj klientom rezerwować bez oczekiwania na akceptację.',
                'feature' => 'instant_booking',
                'required_plan' => 'PRO',
                'icon' => 'heroicon-o-bolt',
            ],
            [
                'key' => 'analytics',
                'title' => 'Analityka PRO',
                'description' => 'Śledź źródła ruchu i konwersje w jednym miejscu.',
                'feature' => 'analytics',
                'required_plan' => 'BASIC',
                'icon' => 'heroicon-o-chart-bar',
            ],
        ];

        return collect($defs)
            ->map(function (array $def) use ($provider) {
                $available = $provider->hasFeature($def['feature']);

                // Dla analityki: jeśli aktywna, link do analityki; jeśli nie, do planów
                $ctaUrl = match ($def['key']) {
                    'analytics' => $available ? '/provider/analytics' : '/provider/subscription/plans',
                    default => '/provider/subscription/plans',
                };

                return [
                    ...$def,
                    'available' => $available,
                    'cta_url' => $ctaUrl,
                    'badge' => $available ? 'Aktywne' : 'Od '.$def['required_plan'],
                ];
            })
            ->all();
    }

    /**
     * Widget: Pipeline Board
     * 
     * Tablica z zapytaniami ofertowymi (pending/quoted/accepted) + konwersja oraz
     * rezerwacjami (pending/confirmed/completed). Gating szczegółów gdy brak instant_booking + messaging.
     * 
     * @param User $provider
     * @return array{period: string, can_view_details: bool, requests: array, bookings: array}
     */
    protected function preparePipelineBoard(User $provider): array
    {
        $providerId = $provider->id;
        $since = now()->subDays(30);

        // Zapytania ofertowe (BookingRequest)
        $requests = BookingRequest::query()
            ->where('provider_id', $providerId)
            ->where('created_at', '>=', $since)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Rezerwacje (Booking)
        $bookings = Booking::query()
            ->where('provider_id', $providerId)
            ->where('created_at', '>=', $since)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $incoming = (int) ($requests['pending'] ?? 0);
        $quoted = (int) ($requests['quoted'] ?? 0);
        $converted = (int) ($requests['accepted'] ?? 0);
        $totalRequests = max(1, $incoming + $quoted + $converted);
        $conversionRate = round(($converted / $totalRequests) * 100, 1);

        $canViewDetails = $provider->hasFeature('instant_booking') && $provider->hasFeature('messaging');

        return [
            'period' => 'Ostatnie 30 dni',
            'can_view_details' => $canViewDetails,
            'requests' => [
                'incoming' => $incoming,
                'quoted' => $quoted,
                'converted' => $converted,
                'conversion_rate' => $conversionRate,
            ],
            'bookings' => [
                'pending' => (int) ($bookings['pending'] ?? 0),
                'confirmed' => (int) ($bookings['confirmed'] ?? 0),
                'completed' => (int) ($bookings['completed'] ?? 0),
            ],
        ];
    }

    /**
     * Widget: Insights Card
     * 
     * Trust Score™, CTR, liczba zakończonych zleceń (bieżący miesiąc),
     * źródła ruchu (split katalog/polecenia/bezpośrednie, fallback gdy brak danych).
     * 
     * @param User $provider
     * @return array{trust_score: int, trust_delta: int, click_rate: float|null, completed: int, traffic_sources: array, period_label: string}
     */
    protected function prepareInsightsCard(User $provider): array
    {
        // Oblicz CTR z service_listings (views_count jako podstawa)
        $totalViews = (int) $provider->serviceListings()->sum('views_count');
        
        // CTR estimation: zakładamy że 1 booking request = 1 click
        // Realny CTR = (booking_requests / views) * 100
        $recentRequests = BookingRequest::query()
            ->where('provider_id', $provider->id)
            ->whereBetween('created_at', [now()->subDays(30), now()])
            ->count();
        
        $ctr = $totalViews > 0 ? round(($recentRequests / $totalViews) * 100, 2) : null;

        $completed = Booking::query()
            ->where('provider_id', $provider->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [now()->startOfMonth(), now()])
            ->count();

        $trustScore = $provider->getTrustScore();
        
        // Traffic sources na podstawie views_count
        $sources = $totalViews > 0 ? $this->defaultTrafficSplit($totalViews) : [];

        return [
            'trust_score' => $trustScore,
            'trust_delta' => $trustScore - 70,
            'click_rate' => $ctr,
            'completed' => $completed,
            'traffic_sources' => $sources,
            'period_label' => 'Ostatnie 30 dni',
        ];
    }

    /**
     * Zapewnia podział źródeł ruchu, gdy brak realnych danych
     * 
     * @param int $views Łączna liczba wyświetleń
     * @return array<int, array{label: string, value: int}>
     */
    protected function defaultTrafficSplit(int $views): array
    {
        if ($views <= 0) {
            return [];
        }

        $catalog = (int) round($views * 0.58);
        $referrals = (int) round($views * 0.27);
        $direct = max(0, $views - $catalog - $referrals);

        return [
            ['label' => 'Katalog LocalServices', 'value' => $catalog],
            ['label' => 'Polecenia / social', 'value' => $referrals],
            ['label' => 'Bezpośrednio', 'value' => $direct],
        ];
    }

    /**
     * Widget: Tasks Card
     * 
     * Onboarding + growth tasks pobierane z user->onboarding_steps + dodatkowe
     * (portfolio ≥3 zdjęcia, włączenie Instant Booking). Progres w %.
     * 
     * @param User $provider
     * @return array{progress: int, items: array}
     */
    protected function prepareTasksCard(User $provider): array
    {
        $onboarding = $provider->onboarding_steps ?? [];
        $steps = collect($onboarding['steps'] ?? [])
            ->map(fn ($step) => [
                'id' => $step['id'],
                'title' => $step['title'],
                'description' => $step['description'],
                'completed' => (bool) ($step['completed'] ?? false),
                'route' => $step['route'] ?? null,
                'reward' => null,
            ]);

        $profile = $provider->providerProfile;

        $extra = collect([
            [
                'id' => 'portfolio',
                'title' => 'Dodaj zdjęcia realizacji',
                'description' => 'Minimum 3 zdjęcia zwiększa zaufanie klientów.',
                'completed' => ! empty($profile?->portfolio_photos) && count($profile->portfolio_photos) >= 3,
                'route' => '/provider/profile/edit',
                'reward' => '+5 Trust Score™',
            ],
            [
                'id' => 'instant-booking-optin',
                'title' => 'Włącz Instant Booking',
                'description' => 'Automatyczne potwierdzanie terminów dla powtarzalnych usług.',
                'completed' => $provider->hasFeature('instant_booking'),
                'route' => '/provider/subscription/plans',
                'reward' => 'Oszczędzasz do 4h tygodniowo',
            ],
        ]);

        $items = $steps->merge($extra)->all();

        $completed = collect($items)->where('completed', true)->count();
        $progress = count($items) > 0 ? round(($completed / count($items)) * 100) : 0;

        return [
            'progress' => $progress,
            'items' => $items,
        ];
    }

    /**
     * Widget: Performance Snapshot
     * 
     * Response time (min), completion rate, repeat customers, cancellation rate, Trust Score™.
     * 
     * @param User $provider
     * @return array{response_minutes: int|null, completion_rate: float|null, repeat_customers: int|null, cancellation_rate: float|null, trust_score: int}
     */
    protected function preparePerformanceSnapshot(User $provider): array
    {
        $profile = $provider->providerProfile;

        return [
            'response_minutes' => $profile?->response_time_hours ? (int) round($profile->response_time_hours * 60) : null,
            'completion_rate' => $profile?->completion_rate,
            'repeat_customers' => $profile?->repeat_customers,
            'cancellation_rate' => $profile?->cancellation_rate,
            'trust_score' => $profile?->trust_score ?? $provider->getTrustScore(),
        ];
    }

    /**
     * Widget: Calendar Glance
     * 
     * Najbliższe rezerwacje (max 3 dni, 2 sloty/dzień), dane blur jeśli brak uprawnień
     * do szczegółów (instant_booking + messaging). Link do kalendarza dostępności.
     * 
     * @param User $provider
     * @return array{slots: array, can_view_details: bool, calendar_url: string}
     */
    protected function prepareCalendarGlance(User $provider): array
    {
        $canViewDetails = $provider->hasFeature('instant_booking') && $provider->hasFeature('messaging');

        // TODO: Zaimplementować Availability model w LS2
        // Na razie puste sloty
        $reservations = [];

        return [
            'slots' => $reservations,
            'can_view_details' => $canViewDetails,
            'calendar_url' => '/provider/availability',
        ];
    }

    /**
     * Widget: Message Center
     * 
     * Ostatnie 4 zapytania (klient/status), liczba nieprzeczytanych powiadomień.
     * Link do wiadomości.
     * 
     * @param User $provider
     * @return array{requests: array, unread_notifications: int, messages_url: string}
     */
    protected function prepareMessageCenter(User $provider): array
    {
        $requests = BookingRequest::query()
            ->where('provider_id', $provider->id)
            ->latest()
            ->limit(4)
            ->with(['customer:id,name'])
            ->get()
            ->map(fn (BookingRequest $request) => [
                'id' => $request->id,
                'customer' => $request->customer?->name ?? 'Klient',
                'status' => $request->status,
                'created_at' => $request->created_at?->diffForHumans(),
                'quote_due' => $request->quote_valid_until?->format('d.m'),
            ])
            ->all();

        return [
            'requests' => $requests,
            'unread_notifications' => $provider->unreadNotifications()->count(),
            'messages_url' => '/provider/messages',
        ];
    }

    /**
     * Widget: Notifications Card
     * 
     * Ostatnie powiadomienia providera.
     * 
     * @param User $provider
     * @return array{notifications: array}
     */
    protected function prepareNotificationsCard(User $provider): array
    {
        $notifications = $provider->notifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'data' => $notification->data,
                'read_at' => $notification->read_at?->diffForHumans(),
                'created_at' => $notification->created_at->diffForHumans(),
            ])
            ->all();

        return [
            'notifications' => $notifications,
        ];
    }

    /**
     * Widget: Services Card
     * 
     * Top 6 ogłoszeń wg views_count (z kategorią).
     * 
     * @param User $provider
     * @return array{services: array}
     */
    protected function prepareServicesCard(User $provider): array
    {
        $services = $provider->serviceListings()
            ->with(['category:id,name'])
            ->select(['id', 'provider_id', 'title', 'status', 'views_count'])
            ->orderByDesc('views_count')
            ->limit(6)
            ->get()
            ->map(fn ($service) => [
                'id' => $service->id,
                'title' => $service->title,
                'status' => $service->status,
                'views_count' => $service->views_count,
                'category' => $service->category?->name,
            ])
            ->all();

        return [
            'services' => $services,
        ];
    }

    /**
     * Widget: Live Activity Feed
     * 
     * Ostatnie aktywności providera (booking requests, reviews, notifications)
     * posortowane chronologicznie.
     * 
     * @param User $provider
     * @return array{activities: array}
     */
    protected function prepareLiveActivityFeed(User $provider): array
    {
        $activities = collect();

        // 1. Ostatnie booking requests (max 5)
        $recentRequests = BookingRequest::query()
            ->where('provider_id', $provider->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (BookingRequest $req) => [
                'type' => 'inquiry',
                'title' => 'Nowe zapytanie',
                'description' => 'Zapytanie o ' . ($req->service?->title ?? 'usługę'),
                'icon' => 'MessageSquare',
                'color' => 'teal',
                'timestamp' => $req->created_at->toISOString(),
                'created_at' => $req->created_at->diffForHumans(),
            ]);

        $activities = $activities->merge($recentRequests);

        // 2. Ostatnie reviews (max 5)
        $recentReviews = \App\Models\Review::query()
            ->where('reviewed_id', $provider->id)
            ->latest()
            ->limit(5)
            ->with('reviewer:id,name')
            ->get()
            ->map(fn ($review) => [
                'type' => 'review',
                'title' => 'Nowa opinia',
                'description' => sprintf('Otrzymałeś %d gwiazdek od %s', 
                    $review->rating, 
                    $review->reviewer?->name ?? 'klienta'
                ),
                'icon' => 'Star',
                'color' => 'orange',
                'timestamp' => $review->created_at->toISOString(),
                'created_at' => $review->created_at->diffForHumans(),
            ]);

        $activities = $activities->merge($recentReviews);

        // 3. Ostatnie notifications (max 5)
        $recentNotifications = $provider->notifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($notification) => [
                'type' => $this->mapNotificationType($notification->type),
                'title' => $notification->data['title'] ?? 'Powiadomienie',
                'description' => $notification->data['message'] ?? '',
                'icon' => $this->mapNotificationIcon($notification->type),
                'color' => 'cyan',
                'timestamp' => $notification->created_at->toISOString(),
                'created_at' => $notification->created_at->diffForHumans(),
            ]);

        $activities = $activities->merge($recentNotifications);

        // Sortuj wszystko po czasie (najnowsze pierwsze)
        $sortedActivities = $activities
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->all();

        return [
            'activities' => $sortedActivities,
        ];
    }

    /**
     * Mapuje typ notyfikacji na typ aktywności
     */
    protected function mapNotificationType(string $notificationType): string
    {
        return match (true) {
            str_contains($notificationType, 'Booking') => 'booking',
            str_contains($notificationType, 'Review') => 'review',
            str_contains($notificationType, 'Message') => 'message',
            default => 'notification',
        };
    }

    /**
     * Mapuje typ notyfikacji na ikonę
     */
    protected function mapNotificationIcon(string $notificationType): string
    {
        return match (true) {
            str_contains($notificationType, 'Booking') => 'Calendar',
            str_contains($notificationType, 'Review') => 'Star',
            str_contains($notificationType, 'Message') => 'MessageSquare',
            default => 'Bell',
        };
    }
}
