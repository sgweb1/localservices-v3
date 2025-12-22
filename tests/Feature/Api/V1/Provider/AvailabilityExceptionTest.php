<?php

namespace Tests\Feature\Api\V1\Provider;

use App\Models\AvailabilityException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testy systemu bloków dostępności (urlopy, święta, choroba)
 * 
 * Pokrycie:
 * - Pobieranie listy bloków
 * - Dodawanie nowych bloków
 * - Walidacja dat (end_date >= start_date)
 * - Usuwanie bloków
 * - Izolacja danych między providerami
 */
class AvailabilityExceptionTest extends TestCase
{
    use RefreshDatabase;

    private User $provider;

    protected function setUp(): void
    {
        parent::setUp();

        $this->provider = User::factory()->provider()->create([
            'name' => 'Test Provider',
            'email' => 'provider@test.com',
        ]);
    }

    /**
     * Test: Provider może pobrać listę swoich bloków
     */
    public function test_provider_can_fetch_their_exceptions(): void
    {
        Sanctum::actingAs($this->provider);

        // Utwórz bloki dla tego providera
        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2025-12-23',
            'end_date' => '2025-12-30',
            'reason' => 'Urlop',
            'description' => 'Święta Bożego Narodzenia',
            'is_approved' => true,
        ]);

        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-01-15',
            'end_date' => '2026-01-15',
            'reason' => 'Choroba',
            'description' => null,
            'is_approved' => true,
        ]);

        $response = $this->getJson('/api/v1/provider/calendar/exceptions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'provider_id',
                        'start_date',
                        'end_date',
                        'reason',
                        'description',
                        'is_approved',
                        'created_at',
                        'updated_at',
                    ]
                ]
            ])
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.reason', 'Urlop')
            ->assertJsonPath('data.1.reason', 'Choroba');
    }

    /**
     * Test: Provider może dodać blok urlopu
     */
    public function test_provider_can_create_vacation_block(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2025-12-25',
            'end_date' => '2026-01-05',
            'reason' => 'Urlop',
            'description' => 'Wyjazd świąteczny',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Blok dostępności został dodany',
                'data' => [
                    'provider_id' => $this->provider->id,
                    'start_date' => '2025-12-25',
                    'end_date' => '2026-01-05',
                    'reason' => 'Urlop',
                    'description' => 'Wyjazd świąteczny',
                    'is_approved' => true,
                ],
            ]);

        $this->assertDatabaseHas('availability_exceptions', [
            'provider_id' => $this->provider->id,
            'start_date' => '2025-12-25',
            'end_date' => '2026-01-05',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);
    }

    /**
     * Test: Można dodać blok jednego dnia
     */
    public function test_can_create_single_day_block(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2025-12-24',
            'end_date' => '2025-12-24',
            'reason' => 'Święta',
            'description' => 'Wigilia',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('availability_exceptions', [
            'provider_id' => $this->provider->id,
            'start_date' => '2025-12-24',
            'end_date' => '2025-12-24',
        ]);
    }

    /**
     * Test: Domyślna wartość reason to "Urlop"
     */
    public function test_default_reason_is_urlop(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            // Brak reason
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.reason', 'Urlop');
    }

    /**
     * Test: Walidacja - start_date jest wymagane
     */
    public function test_start_date_is_required(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'end_date' => '2026-01-05',
            'reason' => 'Urlop',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test: Walidacja - end_date musi być >= start_date
     */
    public function test_end_date_must_be_after_or_equal_start_date(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-01-10',
            'end_date' => '2026-01-05', // Wcześniejsza data
            'reason' => 'Urlop',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test: Description może być puste
     */
    public function test_description_is_optional(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-10',
            'reason' => 'Urlop',
            // Brak description
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('availability_exceptions', [
            'provider_id' => $this->provider->id,
            'start_date' => '2026-03-01',
            'description' => null,
        ]);
    }

    /**
     * Test: Provider może usunąć swój blok
     */
    public function test_provider_can_delete_their_exception(): void
    {
        Sanctum::actingAs($this->provider);

        $exception = AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-04-01',
            'end_date' => '2026-04-07',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);

        $response = $this->deleteJson("/api/v1/provider/calendar/exceptions/{$exception->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Blok dostępności został usunięty',
            ]);

        $this->assertDatabaseMissing('availability_exceptions', [
            'id' => $exception->id,
        ]);
    }

    /**
     * Test: Provider nie może usunąć bloku innego providera
     */
    public function test_provider_cannot_delete_another_providers_exception(): void
    {
        $otherProvider = User::factory()->provider()->create();

        $exception = AvailabilityException::create([
            'provider_id' => $otherProvider->id,
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-10',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);

        Sanctum::actingAs($this->provider);

        $response = $this->deleteJson("/api/v1/provider/calendar/exceptions/{$exception->id}");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Blok nie został znaleziony',
            ]);

        $this->assertDatabaseHas('availability_exceptions', [
            'id' => $exception->id,
        ]);
    }

    /**
     * Test: Lista bloków jest posortowana po start_date
     */
    public function test_exceptions_are_sorted_by_start_date(): void
    {
        Sanctum::actingAs($this->provider);

        // Utwórz w kolejności odwrotnej
        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-05',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);

        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-05',
            'reason' => 'Święta',
            'is_approved' => true,
        ]);

        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            'reason' => 'Choroba',
            'is_approved' => true,
        ]);

        $response = $this->getJson('/api/v1/provider/calendar/exceptions');

        $response->assertStatus(200);

        $data = $response->json('data');
        
        $this->assertEquals('2026-01-01', $data[0]['start_date']);
        $this->assertEquals('2026-02-01', $data[1]['start_date']);
        $this->assertEquals('2026-03-01', $data[2]['start_date']);
    }

    /**
     * Test: Provider widzi tylko swoje bloki, nie innych providerów
     */
    public function test_provider_sees_only_their_own_exceptions(): void
    {
        $otherProvider = User::factory()->provider()->create();

        // Blok tego providera
        AvailabilityException::create([
            'provider_id' => $this->provider->id,
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-10',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);

        // Blok innego providera
        AvailabilityException::create([
            'provider_id' => $otherProvider->id,
            'start_date' => '2026-06-05',
            'end_date' => '2026-06-15',
            'reason' => 'Urlop',
            'is_approved' => true,
        ]);

        Sanctum::actingAs($this->provider);

        $response = $this->getJson('/api/v1/provider/calendar/exceptions');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.provider_id', $this->provider->id);
    }

    /**
     * Test: Blok automatycznie dostaje is_approved = true
     */
    public function test_exception_is_auto_approved(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-14',
            'reason' => 'Urlop',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_approved', true);
    }

    /**
     * Test: Można dodać wiele bloków dla tego samego providera
     */
    public function test_provider_can_have_multiple_blocks(): void
    {
        Sanctum::actingAs($this->provider);

        // Pierwszy blok
        $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-07',
            'reason' => 'Urlop',
        ])->assertStatus(201);

        // Drugi blok (różne daty)
        $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-20',
            'reason' => 'Szkolenie',
        ])->assertStatus(201);

        $response = $this->getJson('/api/v1/provider/calendar/exceptions');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test: Reason może mieć maksymalnie 255 znaków
     */
    public function test_reason_max_length_is_255(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-05',
            'reason' => str_repeat('A', 256), // 256 znaków
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test: Description może mieć maksymalnie 1000 znaków
     */
    public function test_description_max_length_is_1000(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/calendar/exceptions', [
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-05',
            'reason' => 'Urlop',
            'description' => str_repeat('B', 1001), // 1001 znaków
        ]);

        $response->assertStatus(422);
    }
}
