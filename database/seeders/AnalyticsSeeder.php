<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\ProviderMetric;
use App\Models\SearchAnalytic;
use App\Models\UserSession;
use App\Models\Conversion;
use App\Models\ApiEndpointMetric;
use App\Models\FeatureFlag;
use App\Models\FeatureFlagEvent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AnalyticsSeeder extends Seeder
{
    /**
     * Analytics System Seeder
     * Tworzy: 50 events, 20 provider metrics, 30 search analytics,
     *         15 user sessions, 25 conversions, 7 API metrics, 3 feature flags
     */
    public function run(): void
    {
        $this->seedEvents();
        $this->seedProviderMetrics();
        $this->seedSearchAnalytics();
        $this->seedUserSessions();
        $this->seedConversions();
        $this->seedApiEndpointMetrics();
        $this->seedFeatureFlags();

        $this->command->info('✅ Analytics System seeded successfully');
    }

    /**
     * Seed Event records (API performance tracking)
     */
    private function seedEvents(): void
    {
        $events = [
            ['event_name' => 'booking.created', 'event_type' => 'user_action', 'response_time_ms' => 250],
            ['event_name' => 'booking.updated', 'event_type' => 'user_action', 'response_time_ms' => 180],
            ['event_name' => 'review.submitted', 'event_type' => 'user_action', 'response_time_ms' => 320],
            ['event_name' => 'search.performed', 'event_type' => 'user_action', 'response_time_ms' => 450],
            ['event_name' => 'provider.profile_viewed', 'event_type' => 'user_action', 'response_time_ms' => 200],
            ['event_name' => 'message.sent', 'event_type' => 'user_action', 'response_time_ms' => 150],
            ['event_name' => 'error.api_timeout', 'event_type' => 'error', 'response_time_ms' => 5000],
            ['event_name' => 'error.invalid_request', 'event_type' => 'error', 'response_time_ms' => 100],
        ];

        for ($i = 0; $i < 50; $i++) {
            $event = $events[$i % count($events)];
            Event::create([
                'uuid' => fake()->uuid(),
                'event_name' => $event['event_name'],
                'event_type' => $event['event_type'],
                'response_time_ms' => $event['response_time_ms'] + rand(-50, 100),
                'http_method' => fake()->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
                'http_status' => $event['event_type'] === 'error' ? fake()->randomElement(['500', '404', '422']) : '200',
                'metadata' => [
                    'endpoint' => '/api/v1/' . explode('.', $event['event_name'])[0],
                    'user_id' => fake()->numberBetween(1, 15),
                    'page' => fake()->numberBetween(1, 3),
                ],
                'created_at' => now()->subDays(fake()->numberBetween(0, 30)),
            ]);
        }

        $this->command->info('   📊 50 Events created');
    }

    /**
     * Seed ProviderMetric records (Provider performance daily)
     */
    private function seedProviderMetrics(): void
    {
        $providers = User::where('user_type', 'provider')->take(10)->pluck('id');

        foreach ($providers as $providerId) {
            for ($day = 30; $day >= 0; $day--) {
                ProviderMetric::create([
                    'uuid' => fake()->uuid(),
                    'provider_id' => $providerId,
                    'metric_date' => now()->subDays($day),
                    'bookings_completed' => fake()->numberBetween(0, 5),
                    'bookings_cancelled' => fake()->numberBetween(0, 2),
                    'cancellation_rate' => fake()->randomFloat(2, 0, 30),
                    'avg_response_time_minutes' => fake()->randomFloat(2, 5, 120),
                    'reviews_count' => fake()->numberBetween(0, 3),
                    'avg_rating' => fake()->randomFloat(2, 3.5, 5),
                    'ratings_distribution' => json_encode([
                        5 => fake()->numberBetween(5, 15),
                        4 => fake()->numberBetween(2, 8),
                        3 => fake()->numberBetween(0, 3),
                        2 => fake()->numberBetween(0, 2),
                        1 => 0,
                    ]),
                    'slots_available' => fake()->numberBetween(10, 50),
                    'slots_booked' => fake()->numberBetween(5, 30),
                    'utilization_rate' => fake()->randomFloat(2, 40, 90),
                    'total_revenue' => fake()->randomFloat(2, 500, 5000),
                    'subscription_status' => 1, // active
                ]);
            }
        }

        $this->command->info('   📈 20 ProviderMetric records created (10 providers, 31 days)');
    }

    /**
     * Seed SearchAnalytic records
     */
    private function seedSearchAnalytics(): void
    {
        $categories = ['plumbing', 'electrical', 'cleaning', 'tutoring', 'caregiving'];
        $cities = ['Wrocław', 'Poznań', 'Gdańsk', 'Kraków', 'Warszawa'];
        $devices = ['mobile', 'desktop', 'tablet'];

        $queries = [
            'hydraulika',
            'nauka angielskiego',
            'sprzątanie domu',
            'elektryk',
            'opieka nad dzieckiem',
            'naprawa pralki',
            'programowanie',
            'fryzjer',
            'trainer fitness',
        ];

        for ($i = 0; $i < 30; $i++) {
            $resultsCount = fake()->numberBetween(1, 15);
            $clicked = rand(0, 1);
            
            SearchAnalytic::create([
                'uuid' => fake()->uuid(),
                'user_id' => fake()->randomElement([null, ...User::where('user_type', 'customer')->take(5)->pluck('id')->toArray()]),
                'search_query' => fake()->randomElement($queries),
                'service_category' => fake()->randomElement($categories),
                'city' => fake()->randomElement($cities),
                'results_count' => $resultsCount,
                'results_clicked' => $clicked ? fake()->numberBetween(1, 3) : 0,
                'first_result_clicked' => $clicked,
                'conversion_happened' => $clicked ? rand(0, 1) : 0,
                'time_to_booking_seconds' => $clicked ? fake()->numberBetween(60, 3600) : null,
                'device' => fake()->randomElement($devices),
                'created_at' => now()->subDays(fake()->numberBetween(0, 30)),
            ]);
        }

        $this->command->info('   🔍 30 SearchAnalytic records created');
    }

    /**
     * Seed UserSession records
     */
    private function seedUserSessions(): void
    {
        $devices = ['mobile', 'desktop', 'tablet'];
        $browsers = ['chrome', 'safari', 'firefox', 'edge'];
        $os = ['ios', 'android', 'windows', 'macos'];
        $pages = ['/services', '/providers', '/reviews', '/bookings', '/chat'];

        $users = User::take(10)->pluck('id');

        for ($i = 0; $i < 15; $i++) {
            $startedAt = now()->subDays(fake()->numberBetween(0, 30))->subHours(fake()->numberBetween(0, 23));
            $endedAt = $startedAt->clone()->addMinutes(fake()->numberBetween(5, 120));
            $duration = $endedAt->diffInSeconds($startedAt);
            $bounce = rand(0, 1);

            UserSession::create([
                'uuid' => fake()->uuid(),
                'user_id' => fake()->randomElement([null, ...$users->toArray()]),
                'session_id' => fake()->uuid(),
                'device_type' => fake()->randomElement($devices),
                'browser' => fake()->randomElement($browsers),
                'os' => fake()->randomElement($os),
                'started_at' => $startedAt,
                'ended_at' => $bounce ? null : $endedAt,
                'duration_seconds' => $bounce ? null : $duration,
                'page_views' => $bounce ? 1 : fake()->numberBetween(2, 10),
                'actions_count' => $bounce ? 0 : fake()->numberBetween(1, 20),
                'entry_page' => fake()->randomElement($pages),
                'exit_page' => $bounce ? null : fake()->randomElement($pages),
                'bounce' => $bounce,
            ]);
        }

        $this->command->info('   🕐 15 UserSession records created');
    }

    /**
     * Seed Conversion records (booking flow funnel)
     */
    private function seedConversions(): void
    {
        $stages = [
            ['stage' => 0, 'stage_name' => 'search'],
            ['stage' => 1, 'stage_name' => 'viewed_profile'],
            ['stage' => 2, 'stage_name' => 'viewed_price'],
            ['stage' => 3, 'stage_name' => 'booking_started'],
            ['stage' => 4, 'stage_name' => 'booking_completed'],
        ];

        $customers = User::where('user_type', 'customer')->take(5)->pluck('id');
        $providers = User::where('user_type', 'provider')->take(10)->pluck('id');

        for ($i = 0; $i < 25; $i++) {
            $stage = $stages[$i % count($stages)];
            $completed = $stage['stage'] === 4 && rand(0, 1);
            $reachedAt = now()->subDays(fake()->numberBetween(0, 30))->subHours(fake()->numberBetween(0, 23));
            $leftAt = $completed ? null : $reachedAt->clone()->addMinutes(fake()->numberBetween(5, 60));

            Conversion::create([
                'uuid' => fake()->uuid(),
                'customer_id' => fake()->randomElement($customers->toArray()),
                'provider_id' => fake()->randomElement($providers->toArray()),
                'booking_id' => $completed ? fake()->numberBetween(1, 8) : null,
                'funnel_name' => 'booking_flow',
                'stage' => $stage['stage'],
                'stage_name' => $stage['stage_name'],
                'reached_at' => $reachedAt,
                'left_at' => $leftAt,
                'completed' => $completed,
                'drop_reason' => $completed ? null : fake()->randomElement(['cancel', 'timeout', 'price_too_high', 'user_choice']),
                'time_in_stage_seconds' => $leftAt ? $leftAt->diffInSeconds($reachedAt) : null,
                'interactions_count' => fake()->numberBetween(0, 10),
                'metadata' => [
                    'device' => fake()->randomElement(['mobile', 'desktop']),
                    'source' => fake()->randomElement(['organic', 'paid', 'direct']),
                ],
            ]);
        }

        $this->command->info('   🔄 25 Conversion records created (funnel tracking)');
    }

    /**
     * Seed ApiEndpointMetric records
     */
    private function seedApiEndpointMetrics(): void
    {
        $endpoints = [
            ['endpoint' => '/api/v1/bookings', 'method' => 'GET'],
            ['endpoint' => '/api/v1/reviews', 'method' => 'GET'],
            ['endpoint' => '/api/v1/providers/{id}/trust-score', 'method' => 'GET'],
            ['endpoint' => '/api/v1/conversations', 'method' => 'GET'],
            ['endpoint' => '/api/v1/providers/{id}/schedule', 'method' => 'GET'],
            ['endpoint' => '/api/v1/providers/{id}/available-slots', 'method' => 'GET'],
            ['endpoint' => '/api/v1/conversations/{id}/messages', 'method' => 'GET'],
        ];

        foreach ($endpoints as $endpoint) {
            for ($day = 30; $day >= 0; $day--) {
                $errorRate = fake()->randomFloat(2, 0, 5);
                $requestCount = fake()->numberBetween(50, 500);

                ApiEndpointMetric::create([
                    'endpoint' => $endpoint['endpoint'],
                    'method' => $endpoint['method'],
                    'metric_date' => now()->subDays($day),
                    'request_count' => $requestCount,
                    'error_count' => (int)($requestCount * $errorRate / 100),
                    'not_found_count' => fake()->numberBetween(0, 10),
                    'error_rate' => $errorRate,
                    'avg_response_time_ms' => fake()->randomFloat(2, 100, 500),
                    'p95_response_time_ms' => fake()->randomFloat(2, 200, 800),
                    'p99_response_time_ms' => fake()->randomFloat(2, 300, 1200),
                    'min_response_time_ms' => fake()->randomFloat(2, 50, 100),
                    'max_response_time_ms' => fake()->randomFloat(2, 800, 3000),
                    'avg_query_count' => fake()->numberBetween(3, 15),
                    'avg_query_time_ms' => fake()->randomFloat(2, 50, 300),
                ]);
            }
        }

        $this->command->info('   ⚡ 217 ApiEndpointMetric records created (7 endpoints, 31 days)');
    }

    /**
     * Seed FeatureFlag records
     */
    private function seedFeatureFlags(): void
    {
        $flags = [
            [
                'flag_name' => 'instant_booking_v2',
                'description' => 'Nowy UI dla instant booking',
                'is_enabled' => true,
                'rollout_percentage' => 50,
            ],
            [
                'flag_name' => 'new_profile_design',
                'description' => 'Redesign profilu providera',
                'is_enabled' => true,
                'rollout_percentage' => 25,
            ],
            [
                'flag_name' => 'subscription_reminder_email',
                'description' => 'Reminder emaile przed wygaśnięciem subskrypcji',
                'is_enabled' => true,
                'rollout_percentage' => 100,
            ],
        ];

        foreach ($flags as $flag) {
            $featureFlag = FeatureFlag::create([
                'uuid' => fake()->uuid(),
                'flag_name' => $flag['flag_name'],
                'description' => $flag['description'],
                'is_enabled' => $flag['is_enabled'],
                'rollout_percentage' => $flag['rollout_percentage'],
                'target_roles' => fake()->randomElement([null, ['provider'], ['customer']]),
                'target_cities' => fake()->randomElement([null, ['Wrocław', 'Poznań'], ['Kraków']]),
                'started_at' => now()->subDays(fake()->numberBetween(0, 30)),
                'ended_at' => null,
            ]);

            // Seed events dla tego flaga
            for ($i = 0; $i < fake()->numberBetween(20, 50); $i++) {
                FeatureFlagEvent::create([
                    'uuid' => fake()->uuid(),
                    'feature_flag_id' => $featureFlag->id,
                    'user_id' => fake()->randomElement([null, ...User::take(5)->pluck('id')->toArray()]),
                    'event_type' => fake()->randomElement(['viewed', 'interacted', 'converted']),
                    'metadata' => [
                        'device' => fake()->randomElement(['mobile', 'desktop']),
                        'duration_seconds' => fake()->numberBetween(5, 300),
                    ],
                    'created_at' => now()->subDays(fake()->numberBetween(0, 30)),
                ]);
            }
        }

        $this->command->info('   🚩 3 FeatureFlag records created (with 100+ events)');
    }
}
