<?php

namespace Tests\Feature\Api\V1\Provider;

use App\Models\Availability;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testy zarządzania kalendarzem providera
 * 
 * Pokrycie:
 * - Pobieranie kalendarza z slotami i rezerwacjami
 * - Dodawanie slotów dostępności
 * - Edycja slotów
 * - Usuwanie slotów
 * - Walidacja konfliktów czasowych
 */
class CalendarManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $provider;
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->provider = User::factory()->provider()->create([
            'name' => 'Test Provider',
            'email' => 'provider@test.com',
        ]);

        $this->service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'duration_minutes' => 60,
        ]);
    }

    /**
     * Test: Provider może pobrać swój kalendarz
     */
    public function test_provider_can_fetch_calendar(): void
    {
        Sanctum::actingAs($this->provider);

        // Utwórz slot dostępności
        Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 1, // Poniedziałek
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        $response = $this->getJson('/api/v1/provider/calendar');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'slots' => [
                    '*' => [
                        'id',
                        'day_of_week',
                        'day_name',
                        'start_time',
                        'end_time',
                        'max_bookings',
                        'is_available',
                    ]
                ],
                'bookings',
                'date_range' => ['start', 'end'],
            ])
            ->assertJsonPath('slots.0.day_name', 'Poniedziałek')
            ->assertJsonPath('slots.0.start_time', '09:00')
            ->assertJsonPath('slots.0.end_time', '17:00');
    }

    /**
     * Test: Provider może dodać nowy slot dostępności
     */
    public function test_provider_can_create_availability_slot(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/slots', [
            'day_of_week' => 2, // Wtorek
            'start_time' => '10:00',
            'end_time' => '18:00',
            'max_bookings' => 5,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Slot dostępności został dodany',
                'slot' => [
                    'day_of_week' => 2,
                    'day_name' => 'Wtorek',
                    'start_time' => '10:00',
                    'end_time' => '18:00',
                    'max_bookings' => 5,
                ],
            ]);

        $this->assertDatabaseHas('availabilities', [
            'provider_id' => $this->provider->id,
            'day_of_week' => 2,
            'start_time' => '10:00',
            'end_time' => '18:00',
        ]);
    }

    /**
     * Test: Walidacja - end_time musi być po start_time
     */
    public function test_slot_creation_validates_time_order(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/slots', [
            'day_of_week' => 1,
            'start_time' => '18:00',
            'end_time' => '10:00', // Błędna kolejność
            'max_bookings' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_time']);
    }

    /**
     * Test: Wykrycie konfliktu czasowego przy dodawaniu slotu
     */
    public function test_slot_creation_detects_time_conflicts(): void
    {
        Sanctum::actingAs($this->provider);

        // Istniejący slot: 09:00 - 17:00
        Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        // Próba dodania nakładającego się slotu: 15:00 - 19:00
        $response = $this->postJson('/api/v1/provider/calendar/slots', [
            'day_of_week' => 1,
            'start_time' => '15:00',
            'end_time' => '19:00',
            'max_bookings' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Konflikt czasowy - slot nachodzi na istniejącą dostępność',
            ]);
    }

    /**
     * Test: Provider może edytować swój slot
     */
    public function test_provider_can_update_availability_slot(): void
    {
        Sanctum::actingAs($this->provider);

        $slot = Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 3,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        $response = $this->putJson("/api/v1/provider/calendar/slots/{$slot->id}", [
            'start_time' => '08:00',
            'end_time' => '16:00',
            'max_bookings' => 15,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Slot został zaktualizowany',
                'slot' => [
                    'start_time' => '08:00',
                    'end_time' => '16:00',
                    'max_bookings' => 15,
                ],
            ]);

        $this->assertDatabaseHas('availabilities', [
            'id' => $slot->id,
            'start_time' => '08:00',
            'end_time' => '16:00',
            'max_bookings' => 15,
        ]);
    }

    /**
     * Test: Provider może wyłączyć slot (is_available = false)
     */
    public function test_provider_can_disable_slot(): void
    {
        Sanctum::actingAs($this->provider);

        $slot = Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 4,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        $response = $this->putJson("/api/v1/provider/calendar/slots/{$slot->id}", [
            'is_available' => false,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('availabilities', [
            'id' => $slot->id,
            'is_available' => false,
        ]);
    }

    /**
     * Test: Provider może usunąć pusty slot
     */
    public function test_provider_can_delete_empty_slot(): void
    {
        Sanctum::actingAs($this->provider);

        $slot = Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 5,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        $response = $this->deleteJson("/api/v1/provider/calendar/slots/{$slot->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Slot został usunięty',
            ]);

        $this->assertDatabaseMissing('availabilities', [
            'id' => $slot->id,
        ]);
    }

    /**
     * Test: Nie można usunąć slotu z aktywnymi rezerwacjami
     */
    public function test_cannot_delete_slot_with_active_bookings(): void
    {
        Sanctum::actingAs($this->provider);

        $slot = Availability::create([
            'provider_id' => $this->provider->id,
            'day_of_week' => 1, // Poniedziałek
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        // Utwórz rezerwację w następny poniedziałek
        $nextMonday = now()->next('Monday');
        $customer = User::factory()->customer()->create();

        Booking::create([
            'provider_id' => $this->provider->id,
            'customer_id' => $customer->id,
            'service_id' => $this->service->id,
            'booking_date' => $nextMonday->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'confirmed',
            'duration_minutes' => 60,
            'service_address' => 'Test Address 123',
        ]);

        $response = $this->deleteJson("/api/v1/provider/calendar/slots/{$slot->id}");

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Nie można usunąć slotu z aktywnymi rezerwacjami',
            ]);

        $this->assertDatabaseHas('availabilities', [
            'id' => $slot->id,
        ]);
    }

    /**
     * Test: Provider nie może edytować slotu innego providera
     */
    public function test_provider_cannot_edit_another_providers_slot(): void
    {
        $otherProvider = User::factory()->provider()->create();
        
        $slot = Availability::create([
            'provider_id' => $otherProvider->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'max_bookings' => 10,
            'is_available' => true,
        ]);

        Sanctum::actingAs($this->provider);

        $response = $this->putJson("/api/v1/provider/calendar/slots/{$slot->id}", [
            'max_bookings' => 20,
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test: Kalendarz pokazuje rezerwacje z najbliższych 2 tygodni
     */
    public function test_calendar_shows_bookings_from_next_two_weeks(): void
    {
        Sanctum::actingAs($this->provider);

        $customer = User::factory()->customer()->create();

        // Rezerwacja za tydzień (powinna być widoczna)
        Booking::create([
            'provider_id' => $this->provider->id,
            'customer_id' => $customer->id,
            'service_id' => $this->service->id,
            'booking_date' => now()->addWeek()->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'confirmed',
            'duration_minutes' => 60,
            'service_address' => 'Test Address 123',
        ]);

        // Rezerwacja za miesiąc (nie powinna być widoczna)
        Booking::create([
            'provider_id' => $this->provider->id,
            'customer_id' => $customer->id,
            'service_id' => $this->service->id,
            'booking_date' => now()->addMonth()->format('Y-m-d'),
            'start_time' => '12:00',
            'end_time' => '13:00',
            'status' => 'confirmed',
            'duration_minutes' => 60,
            'service_address' => 'Test Address 456',
        ]);

        $response = $this->getJson('/api/v1/provider/calendar');

        $response->assertStatus(200);
        
        $bookings = $response->json('bookings');
        
        $this->assertCount(1, $bookings);
        $this->assertEquals('10:00', $bookings[0]['start_time']);
    }

    /**
     * Test: Kalendarz nie pokazuje ukrytych rezerwacji (hidden_by_provider)
     */
    public function test_calendar_filters_hidden_bookings(): void
    {
        Sanctum::actingAs($this->provider);

        $customer = User::factory()->customer()->create();

        // Widoczna rezerwacja
        Booking::create([
            'provider_id' => $this->provider->id,
            'customer_id' => $customer->id,
            'service_id' => $this->service->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'confirmed',
            'duration_minutes' => 60,
            'hidden_by_provider' => false,
            'service_address' => 'Test Address 123',
        ]);

        // Ukryta rezerwacja
        Booking::create([
            'provider_id' => $this->provider->id,
            'customer_id' => $customer->id,
            'service_id' => $this->service->id,
            'booking_date' => now()->addDays(4)->format('Y-m-d'),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'status' => 'confirmed',
            'duration_minutes' => 60,
            'hidden_by_provider' => true,
            'service_address' => 'Test Address 456',
        ]);

        $response = $this->getJson('/api/v1/provider/calendar');

        $response->assertStatus(200);
        
        $bookings = $response->json('bookings');
        
        $this->assertCount(1, $bookings);
        $this->assertEquals('10:00', $bookings[0]['start_time']);
    }
}
