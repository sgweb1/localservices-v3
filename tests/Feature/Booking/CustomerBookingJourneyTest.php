<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\ProviderProfile;
use App\Enums\UserType;
use App\Enums\BookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * SC-201: Scenariusz podróży klienta - rezerwacja usługi
 * 
 * Kroki:
 * 1. Przeglądanie dostępnych usług w mieście
 * 2. Wyszukiwanie usług po kategorii
 * 3. Wyświetlenie szczegółów dostawcy
 * 4. Rezerwacja usługi (instant booking lub request)
 * 5. Śledzenie statusu rezerwacji
 * 
 * @group booking
 * @group customer-journey
 */
class CustomerBookingJourneyTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $provider;
    protected Location $warsaw;
    protected Location $krakow;
    protected ServiceCategory $plumbing;
    protected ServiceCategory $electrical;
    protected Service $instantService;
    protected Service $requestService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup lokalizacje
        $this->warsaw = Location::factory()->create([
            'name' => 'Warszawa',
            'slug' => 'warszawa',
        ]);
        
        $this->krakow = Location::factory()->create([
            'name' => 'Kraków',
            'slug' => 'krakow',
        ]);

        // Setup kategorie usług
        $this->plumbing = ServiceCategory::factory()->create([
            'name' => 'Hydraulika',
            'slug' => 'hydraulika',
        ]);
        
        $this->electrical = ServiceCategory::factory()->create([
            'name' => 'Elektryka',
            'slug' => 'elektryka',
        ]);

        // Setup provider z profilem
        $this->provider = User::factory()->provider()->create([
            'name' => 'Jan Kowalski - Hydraulik',
            'email' => 'jan.kowalski@example.com',
        ]);

        ProviderProfile::factory()->create([
            'user_id' => $this->provider->id,
            'trust_score' => 92,
            'verification_level' => 5,
            'response_time_hours' => 15,
            'completion_rate' => 98.5,
        ]);

        // Setup usługi providera
        $this->instantService = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->warsaw->id,
            'category_id' => $this->plumbing->id,
            'title' => 'Wymiana baterii kuchni',
            'description' => 'Szybka wymiana baterii kuchni',
            'base_price' => 150,
            'instant_booking' => true,
            'status' => 'active',
        ]);

        $this->requestService = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->warsaw->id,
            'category_id' => $this->plumbing->id,
            'title' => 'Naprawa pralki',
            'description' => 'Profesjonalna naprawa pralki',
            'base_price' => 250,
            'instant_booking' => false,
            'status' => 'active',
        ]);

        // Setup klient
        $this->customer = User::factory()->customer()->create([
            'name' => 'Anna Nowak',
            'email' => 'anna.nowak@example.com',
        ]);
    }

    /**
     * Krok 1: Przeglądanie dostępnych usług w mieście
     * 
     * Customer powinien być w stanie wyświetlić listę usług w wybranym mieście
     */
    public function test_customer_can_browse_services_by_location(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/services?location=' . $this->warsaw->slug);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'base_price',
                    'instant_booking',
                    'provider' => [
                        'id',
                        'name',
                        'rating_average',
                        'rating_count',
                    ],
                ],
            ],
        ]);

        $services = $response->json('data');
        $this->assertCount(2, $services);
        $this->assertTrue(
            collect($services)->pluck('id')->contains($this->instantService->id)
        );
    }

    /**
     * Krok 2: Wyszukiwanie usług po kategorii
     * 
     * Customer powinien móc filtrować usługi po kategorii
     */
    public function test_customer_can_filter_services_by_category(): void
    {
        // Dodajemy usługę do istniejące kategorii Elektryka
        Service::factory()->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->warsaw->id,
            'category_id' => $this->electrical->id,
            'title' => 'Wymiana gniazdek',
            'base_price' => 180,
            'instant_booking' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/services?location=' . $this->warsaw->slug . '&category=' . $this->plumbing->slug);

        $response->assertStatus(200);
        $services = $response->json('data');
        
        // Powinny być tylko hydrauliczne usługi
        foreach ($services as $service) {
            $this->assertEquals($this->plumbing->id, $service['category_id']);
        }
    }

    /**
     * Krok 3: Wyświetlenie szczegółów dostawcy
     * 
     * Customer powinien móc wyświetlić usługi dostawcy i jego ocenę
     */
    public function test_customer_can_view_provider_details(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/providers/' . $this->provider->id . '/services');

        $response->assertStatus(200);
        $services = $response->json('data');
        
        $this->assertCount(2, $services);
        foreach ($services as $service) {
            $this->assertEquals($this->provider->id, $service['provider_id']);
            $this->assertNotEmpty($service['title']);
        }
    }

    /**
     * Krok 4a: Rezerwacja usługi - Instant Booking
     * 
     * Customer rezerwuje usługę z instant booking
     * Status powinien być natychmiast "confirmed"
     */
    public function test_customer_can_book_instant_service(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', [
                'service_id' => $this->instantService->id,
                'provider_id' => $this->provider->id,
                'booking_date' => now()->addDays(3)->format('Y-m-d'),
                'start_time' => '10:00',
                'customer_notes' => 'Proszę przyjechać ok 10:00',
                'service_address' => '123 Main St',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status',
                'customer' => ['id', 'name'],
                'provider' => ['id', 'name'],
                'service' => ['id', 'title', 'base_price'],
                'booking_date',
                'start_time',
            ],
        ]);

        $booking = $response->json('data');
        $this->assertEquals(BookingStatus::CONFIRMED->value, $booking['status']);
        $this->assertEquals($this->customer->id, $booking['customer']['id']);
        $this->assertEquals($this->provider->id, $booking['provider']['id']);

        // Weryfikacja w bazie
        $this->assertDatabaseHas('bookings', [
            'id' => $booking['id'],
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);
    }

    /**
     * Krok 4b: Rezerwacja usługi - bez instant booking
     * 
     * Customer rezerwuje usługę bez instant booking
     * Status powinien być "confirmed"
     */
    public function test_customer_can_request_quote(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', [
                'service_id' => $this->requestService->id,
                'booking_date' => now()->addDays(5)->format('Y-m-d'),
                'start_time' => '14:00',
                'service_address' => '123 Main St, Warszawa',
                'provider_id' => $this->provider->id,
                'customer_notes' => 'Pralka przestała wirować, możliwe problemy z silnikiem',
            ]);

        $response->assertStatus(201);
        $booking = $response->json('data');
        
        $this->assertEquals(BookingStatus::CONFIRMED->value, $booking['status']);
        
        $this->assertDatabaseHas('bookings', [
            'id' => $booking['id'],
            'status' => BookingStatus::CONFIRMED->value,
        ]);
    }

    /**
     * Krok 5: Śledzenie statusu rezerwacji
     * 
     * Customer powinien móc zobaczyć wszystkie swoje rezerwacje z aktualnym statusem
     */
    public function test_customer_can_track_booking_status(): void
    {
        // Tworzymy kilka rezerwacji
        $booking1 = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);

        $booking2 = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->requestService->id,
            'status' => BookingStatus::COMPLETED->value,
        ]);

        Booking::factory()->create([
            'customer_id' => User::factory()->customer()->create()->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);

        // Pobranie rezerwacji klienta
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/bookings');

        $response->assertStatus(200);
        $bookings = $response->json('data');

        // Powinny być przynajmniej rezerwacje tego klienta
        $this->assertGreaterThanOrEqual(2, count($bookings));
        
        $ids = collect($bookings)->pluck('id');
        $this->assertTrue($ids->contains($booking1->id));
        $this->assertTrue($ids->contains($booking2->id));

        // Weryfikacja statusów
        $statuses = collect($bookings)->pluck('status');
        $this->assertTrue($statuses->contains(BookingStatus::CONFIRMED->value));
        $this->assertTrue($statuses->contains(BookingStatus::COMPLETED->value));
    }

    /**
     * Krok 5: Wyświetlenie szczegółów konkretnej rezerwacji
     * 
     * Customer powinien móc zobaczyć pełne detale rezerwacji
     */
    public function test_customer_can_view_booking_details(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
            'booking_date' => now()->addDays(3),
            'start_time' => '10:00',
            'customer_notes' => 'Szybka wymiana',
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/bookings/' . $booking->id);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status',
                'customer' => ['id', 'name', 'phone'],
                'provider' => ['id', 'name', 'phone'],
                'service' => ['id', 'title', 'base_price'],
                'booking_date',
                'start_time',
                'end_time',
                'customer_notes',
                'created_at',
                'updated_at',
            ],
        ]);

        $data = $response->json('data');
        $this->assertEquals($booking->id, $data['id']);
        $this->assertEquals(BookingStatus::CONFIRMED->value, $data['status']);
    }

    /**
     * Krok 5: Anulowanie rezerwacji
     * 
     * Customer powinien móc anulować rezerwację (przed pewnym czasem)
     */
    public function test_customer_can_cancel_booking(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
            'booking_date' => now()->addDays(3),
        ]);

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings/' . $booking->id . '/cancel', [
                'reason' => 'Zmieniłem plany',
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals(BookingStatus::CANCELLED->value, $data['status']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::CANCELLED->value,
        ]);
    }

    /**
     * Bląd: Customer nie może rezerwować usługi innego customera
     */
    public function test_customer_cannot_view_other_customers_bookings(): void
    {
        $otherCustomer = User::factory()->customer()->create();
        
        $booking = Booking::factory()->create([
            'customer_id' => $otherCustomer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/bookings/' . $booking->id);

        $response->assertStatus(403);
    }

    /**
     * Bląd: Customer nie może rezerwować bez wymaganych pól
     */
    public function test_customer_cannot_book_without_required_fields(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', [
                'service_id' => $this->instantService->id,
                // brak scheduled_date i scheduled_time
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['booking_date', 'start_time']);
    }

    /**
     * Bląd: Nie można rezerwować na datę w przeszłości
     */
    public function test_customer_cannot_book_in_the_past(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', [
                'service_id' => $this->instantService->id,
                'booking_date' => now()->subDays(1)->format('Y-m-d'),
                'start_time' => '10:00',
                'service_address' => '123 Main St',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['booking_date']);
    }

    /**
     * Bląd: Unauthenticated user nie może rezerwować
     */
    public function test_unauthenticated_user_cannot_book(): void
    {
        $response = $this->postJson('/api/v1/bookings', [
            'service_id' => $this->instantService->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '10:00',
            'service_address' => '123 Main St',
        ]);

        $response->assertStatus(401);
    }
}
