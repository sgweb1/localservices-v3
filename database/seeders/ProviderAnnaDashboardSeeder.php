<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRequest;
use App\Models\ProviderProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ProviderAnnaDashboardSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Plan PRO
        $plan = SubscriptionPlan::firstOrCreate(
            ['name' => 'Pro Plan'],
            [
                'uuid' => (string) Str::uuid(),
                'slug' => 'pro',
                'description' => 'Plan PRO dla providerów',
                'price_monthly' => 99.00,
                'price_yearly' => 990.00,
                'max_services' => 15,
                'max_bookings_per_month' => 500,
                'featured_listing' => true,
                'priority_support' => true,
                'analytics_dashboard' => true,
                'features' => [
                    'instant_booking',
                    'messaging',
                    'analytics',
                    'calendar',
                    'limits' => [
                        'max_listings' => 15,
                        'max_service_categories' => 8,
                    ],
                ],
                'is_active' => true,
                'display_order' => 2,
            ]
        );

        // 2) Provider Anna
        $user = User::where('email', 'korepetycje1@example.com')->firstOrFail();

        // Subskrypcja PRO
        Subscription::updateOrCreate(
            ['user_id' => $user->id, 'subscription_plan_id' => $plan->id],
            [
                'uuid' => (string) Str::uuid(),
                'billing_period' => 'monthly',
                'status' => 'active',
                'started_at' => now()->subMonth(),
                'ends_at' => Carbon::create(2026, 1, 15),
                'renews_at' => Carbon::create(2026, 1, 15),
                'auto_renew' => true,
            ]
        );

        $user->forceFill([
            'current_subscription_plan_id' => $plan->id,
            'subscription_expires_at' => Carbon::create(2026, 1, 15),
            'profile_completion' => 92,
        ])->save();

        // Provider profile metryki zgodne z mockiem
        ProviderProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => 'Elektryk Anna - Instalacje i Naprawy',
                'trust_score' => 78,
                'response_time_hours' => 2.5,
                'completion_rate' => 92.5,
                'repeat_customers' => 8,
                'cancellation_rate' => 2.1,
            ]
        );

        // 3) Services (6 pozycji jak w mocku)
        $services = [
            ['title' => 'Remont łazienki', 'category_id' => 1, 'views_count' => 145, 'status' => 'active'],
            ['title' => 'Instalacja hydrauliczna', 'category_id' => 2, 'views_count' => 98, 'status' => 'active'],
            ['title' => 'Naprawa awaryjna', 'category_id' => 2, 'views_count' => 76, 'status' => 'active'],
            ['title' => 'Malowanie ścian', 'category_id' => 3, 'views_count' => 54, 'status' => 'active'],
            ['title' => 'Układanie płytek', 'category_id' => 1, 'views_count' => 43, 'status' => 'paused'],
            ['title' => 'Wymiana baterii', 'category_id' => 2, 'views_count' => 32, 'status' => 'active'],
        ];

        foreach ($services as $svc) {
            Service::updateOrCreate(
                ['provider_id' => $user->id, 'title' => $svc['title']],
                array_merge(
                    $svc,
                    [
                        'slug' => Str::slug($svc['title']) . '-' . $user->id,
                        'description' => 'Opis usługi: ' . $svc['title'],
                        'pricing_type' => 'fixed',
                        'base_price' => 150,
                        'price_currency' => 'PLN',
                        'accepts_quote_requests' => true,
                        'instant_booking' => true,
                        'min_notice_hours' => 4,
                        'max_advance_days' => 30,
                        'rating_average' => 4.7,
                        'reviews_count' => 12,
                        'bookings_count' => 5,
                        'status' => $svc['status'],
                    ]
                )
            );
        }

        $serviceIds = Service::where('provider_id', $user->id)->pluck('id')->all();
        $customerId = User::where('user_type', 'customer')->value('id') ?? $user->id;
        $rqCounter = 1;
        $bookingCounter = 1;

        // 4) BookingRequests (last 30 days)
        BookingRequest::where('provider_id', $user->id)->delete();
        $reqData = [
            ['status' => 'pending', 'count' => 12],
            ['status' => 'quoted', 'count' => 8],
            ['status' => 'accepted', 'count' => 5],
        ];
        foreach ($reqData as $row) {
            for ($i = 0; $i < $row['count']; $i++) {
                BookingRequest::create([
                    'provider_id' => $user->id,
                    'customer_id' => $customerId,
                    'service_id' => Arr::random($serviceIds),
                    'description' => 'Zapytanie seedowane - opis potrzeb klienta',
                    'service_address' => 'Warszawa, ul. Marszałkowska 1',
                    'status' => $row['status'],
                    'request_number' => 'RQ-' . now()->format('Ymd') . '-' . sprintf('%05d', $rqCounter++),
                    'created_at' => now()->subDays(rand(0, 25)),
                    'updated_at' => now(),
                ]);
            }
        }

        // 5) Bookings (last 30 days)
        // Najpierw usuwamy stare bookings i reviews providera
        Review::where('reviewed_id', $user->id)->delete();
        Booking::where('provider_id', $user->id)->delete();
        
        $bookData = [
            ['status' => 'pending', 'count' => 3],
            ['status' => 'confirmed', 'count' => 7],
            ['status' => 'completed', 'count' => 15],
        ];
        $createdBookings = collect();
        foreach ($bookData as $row) {
            for ($i = 0; $i < $row['count']; $i++) {
                $day = Carbon::now()->subDays(rand(0, 25));
                $start = (clone $day)->setTime(rand(8, 18), Arr::random([0, 15, 30, 45]));
                $duration = Arr::random([60, 90, 120]);
                $end = (clone $start)->addMinutes($duration);
                $servicePrice = Arr::random([180, 220, 260]);
                $travelFee = Arr::random([0, 20, 30]);
                $platformFee = 0;

                $booking = Booking::create([
                    'uuid' => (string) Str::uuid(),
                    'booking_number' => 'BK-' . $day->format('Ymd') . '-' . time() . '-' . rand(100, 999),
                    'provider_id' => $user->id,
                    'customer_id' => $customerId,
                    'service_id' => Service::where('provider_id', $user->id)->inRandomOrder()->value('id'),
                    'status' => $row['status'],
                    'booking_date' => $day->toDateString(),
                    'start_time' => $start->format('H:i:s'),
                    'end_time' => $end->format('H:i:s'),
                    'duration_minutes' => $duration,
                    'service_address' => 'Warszawa, ul. Marszałkowska 1',
                    'service_price' => $servicePrice,
                    'travel_fee' => $travelFee,
                    'platform_fee' => $platformFee,
                    'total_price' => $servicePrice + $travelFee + $platformFee,
                    'currency' => 'PLN',
                    'payment_status' => 'pending',
                    'created_at' => $day,
                    'updated_at' => Carbon::now(),
                ]);
                $createdBookings->push($booking);
            }
        }

        // 6) Reviews dla providera Anna (ostatnie 10 dni)
        $customers = User::where('user_type', 'customer')->limit(10)->get();
        if ($customers->count() > 0 && $createdBookings->isNotEmpty()) {
            for ($i = 0; $i < 8; $i++) {
                $daysAgo = rand(1, 10);
                $customer = $customers->random();
                
                Review::create([
                    'uuid' => (string) Str::uuid(),
                    'booking_id' => $createdBookings->random()->id,
                    'reviewer_id' => $customer->id,
                    'reviewed_id' => $user->id, // provider Anna
                    'rating' => rand(4, 5), // Dobre oceny
                    'comment' => Arr::random([
                        'Świetne korepetycje, polecam!',
                        'Bardzo pomocna i cierpliwa nauczycielka.',
                        'Córka poprawiła oceny dzięki tym zajęciom.',
                        'Profesjonalne podejście, wysoka jakość.',
                        'Doskonały kontakt z uczniem, efekty widoczne szybko.',
                    ]),
                    'created_at' => Carbon::now()->subDays($daysAgo),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }

        $this->command?->info('✅ Provider Anna zasilona danymi PRO dla dashboardu.');
    }
}
