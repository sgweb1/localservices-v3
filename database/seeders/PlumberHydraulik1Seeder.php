<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRequest;
use App\Models\ProviderProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * COMPREHENSIVE SEEDER dla hydraulika1@example.com
 * 
 * Tworzy:
 * - Konto providera (hydraulika)
 * - Różne statusy rezerwacji (pending, confirmed, in_progress, completed, cancelled)
 * - Rezerwacje w przeszłości i przyszłości
 * - Sloty dostępności w kalendarzu
 * - Recenzje od klientów
 * - Booking requests
 * - Metryki profileu
 * - Subskrypcję
 * 
 * Docelowo: max wariantów do testowania UI/API
 */
class PlumberHydraulik1Seeder extends Seeder
{
    private User $provider;
    private SubscriptionPlan $plan;
    private array $serviceIds = [];
    private array $customerIds = [];

    public function run(): void
    {
        $this->command->info('🔧 Uruchamianie Plumber Hydraulik1 Seeder...');

        // 1. Tworzenie/pobranie providera
        $this->ensureProvider();

        // 2. Plan subskrypcji
        $this->setupSubscription();

        // 3. Profile metryki
        $this->setupProviderProfile();

        // 4. Usługi
        $this->createServices();

        // 5. Klienci dla rezerwacji
        $this->getCustomerIds();

        // 6. Rezerwacje w różnych statusach
        $this->createBookings();

        // 7. Booking Requests
        $this->createBookingRequests();

        // 8. Sloty dostępności (kalendarze)
        $this->createAvailabilitySlots();

        // 9. Recenzje
        $this->createReviews();

        $this->command->info('✅ Seeder ukończony pomyślnie!');
        $this->command->info('📧 Konto: hydraulik1@example.com');
        $this->command->info('🔐 Hasło: password');
    }

    private function ensureProvider(): void
    {
        $this->provider = User::firstOrCreate(
            ['email' => 'hydraulik1@example.com'],
            [
                'name' => 'Piotr Wodecki - Hydraulik',
                'user_type' => 'provider',
                'phone' => '+48 600 111 222',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
                'profile_completion' => 95,
                'is_verified' => true,
                'is_active' => true,
            ]
        );

        // Nadaj role
        if (!$this->provider->hasRole('provider')) {
            $this->provider->assignRole('provider');
        }

        $this->command->info("✅ Provider: {$this->provider->email}");
    }

    private function setupSubscription(): void
    {
        // Plan PRO
        $this->plan = SubscriptionPlan::firstOrCreate(
            ['slug' => 'pro'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Pro Plan',
                'description' => 'Plan PRO dla providerów - pełny dostęp',
                'price_monthly' => 99.00,
                'price_yearly' => 990.00,
                'max_services' => 20,
                'max_bookings_per_month' => 1000,
                'featured_listing' => true,
                'priority_support' => true,
                'analytics_dashboard' => true,
                'features' => [
                    'instant_booking',
                    'messaging',
                    'analytics',
                    'calendar',
                    'boost_ads',
                    'custom_profile',
                ],
                'is_active' => true,
                'display_order' => 2,
            ]
        );

        // Subskrypcja dla providera
        Subscription::updateOrCreate(
            ['user_id' => $this->provider->id],
            [
                'subscription_plan_id' => $this->plan->id,
                'uuid' => (string) Str::uuid(),
                'billing_period' => 'monthly',
                'status' => 'active',
                'started_at' => now()->subMonths(3),
                'ends_at' => now()->addMonths(6),
                'renews_at' => now()->addMonths(1),
                'auto_renew' => true,
            ]
        );

        $this->provider->update([
            'current_subscription_plan_id' => $this->plan->id,
            'subscription_expires_at' => now()->addMonths(6),
        ]);

        $this->command->info('✅ Subskrypcja PRO aktywna');
    }

    private function setupProviderProfile(): void
    {
        ProviderProfile::updateOrCreate(
            ['user_id' => $this->provider->id],
            [
                'business_name' => 'Piotr Wodecki - Usługi Hydrauliczne',
                'service_description' => 'Profesjonalne usługi hydrauliczne z 15-letnim doświadczeniem. Szybkie interwencje, solidne wykonanie. Dostępne 24/7 dla awaryjnych zleceń.',
                'trust_score' => 92,
                'response_time_hours' => 1.5,
                'completion_rate' => 97.8,
                'repeat_customers' => 48,
                'cancellation_rate' => 0.8,
                'verification_level' => 2,
                'id_verified' => true,
                'background_check_passed' => true,
            ]
        );

        $this->command->info('✅ Profil providera skonfigurowany');
    }

    private function createServices(): void
    {
        // Kategorie (z ServiceCategorySeeder.php):
        // 1 = Hydraulika, 7 = Budowlane (Remonty)
        $categoryHydraulika = 1;  // Hydraulika
        $categoryBuilding = 7;     // Budowlane (dla remontów)

        // Sprawdź czy kategorie faktycznie istnieją
        $hydraulikaExists = ServiceCategory::where('id', $categoryHydraulika)->exists();
        $buildingExists = ServiceCategory::where('id', $categoryBuilding)->exists();

        if (!$hydraulikaExists || !$buildingExists) {
            $this->command->warn('⚠️ Kategorie nie znalezione - sprawdzam alternate IDs...');
            // Fallback: pobierz pierwsze dwie aktywne
            $categories = ServiceCategory::where('is_active', true)->limit(2)->pluck('id');
            if ($categories->count() >= 2) {
                $categoryHydraulika = $categories[0];
                $categoryBuilding = $categories[1];
            } else {
                $this->command->error('❌ Brak wystarczających kategorii w bazie');
                return;
            }
        }

        $serviceDefinitions = [
            // Awaria
            [
                'title' => 'Usunięcie awarii - odpływ zablokowany',
                'category_id' => $categoryHydraulika,
                'description' => 'Szybka naprawa zablokowanego odpływu. Używamy profesjonalnych urządzeń.',
                'pricing_type' => 'fixed',
                'base_price' => 250.00,
            ],
            [
                'title' => 'Naprawa przeciekającego kranu',
                'category_id' => $categoryHydraulika,
                'description' => 'Wymiana zaworu, uszczelniania lub całego kranu.',
                'pricing_type' => 'fixed',
                'base_price' => 180.00,
            ],
            [
                'title' => 'Wymiana wylewki prysznicowej',
                'category_id' => $categoryHydraulika,
                'description' => 'Szybka wymiana wylewki. Na miejscu lub dostawa klienta.',
                'pricing_type' => 'fixed',
                'base_price' => 150.00,
            ],
            // Instalacja
            [
                'title' => 'Instalacja nowego kranu lub baterii',
                'category_id' => $categoryHydraulika,
                'description' => 'Profesjonalna instalacja ze wszystkimi wymaganymi podłączeniami.',
                'pricing_type' => 'quote',
                'base_price' => 300.00,
            ],
            [
                'title' => 'Wymiana rury wodnej (metal na PEX)',
                'category_id' => $categoryHydraulika,
                'description' => 'Zastosowanie nowoczesnych rur PEX zamiast starego metalu.',
                'pricing_type' => 'quote',
                'base_price' => 800.00,
            ],
            [
                'title' => 'Montaż grzejnika (radiator)',
                'category_id' => $categoryHydraulika,
                'description' => 'Profesjonalny montaż grzejnika z podłączeniami.',
                'pricing_type' => 'fixed',
                'base_price' => 400.00,
            ],
            // Remont
            [
                'title' => 'Remont łazienki (pełny)',
                'category_id' => $categoryBuilding,
                'description' => 'Kompleksowy remont łazienki - hydraulika, armatura, płytki.',
                'pricing_type' => 'quote',
                'base_price' => 3500.00,
            ],
            [
                'title' => 'Wymiana pisuaru w toalecie publicznej',
                'category_id' => $categoryHydraulika,
                'description' => 'Profesjonalna wymiana pisuaru w lokalach komercyjnych.',
                'pricing_type' => 'fixed',
                'base_price' => 600.00,
            ],
            // Specjalne
            [
                'title' => 'Konsultacja hydrauliczna (godzinowo)',
                'category_id' => $categoryHydraulika,
                'description' => 'Ocena stanu instalacji, doradztwo techniczne.',
                'pricing_type' => 'hourly',
                'base_price' => 120.00,
            ],
            [
                'title' => 'Awaryjne wyjazd 24/7',
                'category_id' => $categoryHydraulika,
                'description' => 'Dostęp do awaryjnych napraw w nocy i weekendy (dodatkowa opłata).',
                'pricing_type' => 'fixed',
                'base_price' => 50.00,
            ],
        ];

        foreach ($serviceDefinitions as $svc) {
            $service = Service::updateOrCreate(
                ['provider_id' => $this->provider->id, 'title' => $svc['title']],
                array_merge(
                    $svc,
                    [
                        'uuid' => (string) Str::uuid(),
                        'slug' => Str::slug($svc['title']) . '-' . Str::random(4),
                        'price_currency' => 'PLN',
                        'accepts_quote_requests' => in_array($svc['pricing_type'], ['quote']),
                        'instant_booking' => $svc['pricing_type'] === 'fixed',
                        'min_notice_hours' => 4,
                        'max_advance_days' => 90,
                    ]
                )
            );

            $this->serviceIds[] = $service->id;
        }

        $this->command->info("✅ Usługi: " . count($this->serviceIds) . " stworzono");
    }

    private function getCustomerIds(): void
    {
        // Pobierz istniejących klientów lub stwórz testowych
        $customers = User::where('user_type', 'customer')->limit(5)->get();

        if ($customers->isEmpty()) {
            // Stwórz testowych klientów
            for ($i = 1; $i <= 5; $i++) {
                $customer = User::firstOrCreate(
                    ['email' => "customer{$i}@example.com"],
                    [
                        'name' => "Klient Testowy {$i}",
                        'user_type' => 'customer',
                        'phone' => "+48 700 00{$i} 00{$i}",
                        'email_verified_at' => now(),
                        'password' => bcrypt('password'),
                        'is_active' => true,
                    ]
                );
                $customer->assignRole('customer');
                $this->customerIds[] = $customer->id;
            }
        } else {
            $this->customerIds = $customers->pluck('id')->toArray();
        }

        $this->command->info("✅ Klienci: " . count($this->customerIds));
    }

    private function createBookings(): void
    {
        $basePrice = 250.00;
        $created = 0;

        // PRZESZŁOŚĆ (15 completed - do testowania hide)
        $this->createBookingsForStatus('completed', 15, -30, -2, $basePrice, $created);

        // PRZESZŁOŚĆ (5 cancelled)
        $this->createBookingsForStatus('cancelled', 5, -45, -5, $basePrice, $created);

        // AKTUALNIE (5 in_progress)
        $this->createBookingsForStatus('in_progress', 5, 0, 2, $basePrice, $created);

        // AKTUALNIE (10 confirmed - potwierdzone, czekają)
        $this->createBookingsForStatus('confirmed', 10, 1, 7, $basePrice, $created);

        // PRZYSZŁOŚĆ (5 pending - nowe, czekają na akceptację)
        $this->createBookingsForStatus('pending', 5, 8, 14, $basePrice, $created);

        // PRZYSZŁOŚĆ (5 quote_sent)
        $this->createBookingsForStatus('quote_sent', 5, 15, 30, $basePrice, $created);

        $this->command->info("✅ Rezerwacji stworzono: {$created}");
    }

    private function createBookingsForStatus(
        string $status,
        int $count,
        int $daysFromNow,
        int $daysFromNowEnd,
        float $basePrice,
        int &$created
    ): void {
        for ($i = 0; $i < $count; $i++) {
            $bookingDate = now()->addDays(rand($daysFromNow, $daysFromNowEnd));
            $customer = User::find(Arr::random($this->customerIds));
            $service = Service::find(Arr::random($this->serviceIds));

            $price = $basePrice + rand(-50, 200);
            
            // Generate unique booking number using UUID to avoid collisions
            $uniqueSuffix = substr(Str::uuid()->toString(), 0, 8);

            $booking = Booking::create([
                'uuid' => (string) Str::uuid(),
                'booking_number' => 'BK-H1-' . now()->format('Ymd') . '-' . $uniqueSuffix,
                'provider_id' => $this->provider->id,
                'customer_id' => $customer->id,
                'service_id' => $service->id,
                'status' => $status,
                'booking_date' => $bookingDate->toDateString(),
                'start_time' => $bookingDate->copy()->setHour(rand(8, 18))->toTimeString(),
                'end_time' => $bookingDate->copy()->setHour(rand(9, 19))->toTimeString(),
                'duration_minutes' => rand(30, 240),
                'service_price' => $price,
                'total_price' => $price,
                'service_address' => [
                    'street' => Arr::random([
                        'Marszałkowska 1',
                        'Puławska 100',
                        'Krakowskie Przedmieście 50',
                        'Nowy Świat 75',
                        'Ujazdowskie 45',
                    ]),
                    'city' => 'Warszawa',
                    'postal_code' => '00-000',
                ],
                'customer_notes' => "Uwagi klienta #{$i}",
                'provider_notes' => $status === 'completed' ? 'Usługa wykonana bez uwag' : null,
                'payment_status' => $status === 'completed' ? 'paid' : 'pending',
                'payment_method' => Arr::random(['cash', 'card', 'transfer', 'online']),
                'created_at' => $bookingDate->copy()->subDays(rand(1, 7)),
                'updated_at' => now(),
            ]);

            // Rating dla ukończonych
            if ($status === 'completed') {
                Review::create([
                    'uuid' => (string) Str::uuid(),
                    'booking_id' => $booking->id,
                    'reviewer_id' => $customer->id,  // Klient pisze recenzję
                    'reviewed_id' => $this->provider->id,  // Recenzja dla providera
                    'rating' => rand(4, 5),
                    'comment' => Arr::random([
                        'Wykonane profesjonalnie, wszystko działało bez problemów.',
                        'Szybka interwencja, polecam!',
                        'Dobrze zrobione, wrócimy do tego hydraulika.',
                        'Odpowiadająca cena, solidne wykonanie.',
                    ]),
                    'is_visible' => true,
                    'published_at' => $booking->completed_at?->addDays(1) ?? now(),
                    'created_at' => $booking->completed_at?->addDays(3) ?? now(),
                ]);
            }

            $created++;
        }
    }

    private function createSpecialBookingScenarios(float $basePrice, int &$created): void
    {
        // Bez specjalnych scenariuszy - seeder jest już prosty
    }

    private function createBookingRequests(): void
    {
        $statuses = ['pending', 'quoted', 'accepted'];
        $created = 0;

        foreach ($statuses as $status) {
            $count = match ($status) {
                'pending' => 12,
                'quoted' => 8,
                'accepted' => 5,
            };

            for ($i = 0; $i < $count; $i++) {
                BookingRequest::create([
                    'provider_id' => $this->provider->id,
                    'customer_id' => Arr::random($this->customerIds),
                    'service_id' => Arr::random($this->serviceIds),
                    'description' => Arr::random([
                        'Potrzebuję szybkiej naprawy kranu',
                        'Chciałbym wymienić baterie w całej łazience',
                        'Mam problem z odpływem',
                        'Szukam profesjonalisty do remontu',
                        'Awaria hydrauliczna - срочна помощь',
                    ]),
                    'service_address' => 'Warszawa, ul. ' . Arr::random([
                        'Puławska 100',
                        'Tygielskiego 5',
                        'Mokotowska 60',
                    ]),
                    'status' => $status,
                    'request_number' => 'RQ-' . now()->format('Ymd') . '-' . sprintf('%05d', $created + 1000),
                    'quoted_price' => $status !== 'pending' ? rand(200, 1000) : null,
                    'created_at' => now()->subDays(rand(0, 25)),
                    'updated_at' => now(),
                ]);
                $created++;
            }
        }

        $this->command->info("✅ Booking Requests: {$created}");
    }

    private function createAvailabilitySlots(): void
    {
        // TODO: Availability slots będą tworzone poprzez API provider dashboard
        // Ten seeder fokusuje się na rezerwacje, usługi i profile
        $this->command->info("✅ Sloty dostępności: (do ustawienia w panelu providera)");
    }

    private function createReviews(): void
    {
        // Recenzje są tworzone automatycznie w createBookings() dla completed bookingów
        $this->command->info("✅ Recenzje: (tworzone automatycznie dla completed rezerwacji)");
    }
}
