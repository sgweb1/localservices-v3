<?php

namespace Tests\Feature\Api\V1\Booking;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SelfBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_cannot_book_himself(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $service = Service::factory()->create([
            'provider_id' => $provider->id,
            'base_price' => 100,
        ]);

        Sanctum::actingAs($provider);

        $response = $this->postJson('/api/v1/bookings', [
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '10:00',
            'service_address' => 'ul. Testowa 1, Warszawa',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['provider_id'])
            ->assertJson([
                'message' => 'Nie możesz rezerwować własnych usług',
                'errors' => [
                    'provider_id' => ['Nie możesz rezerwować własnych usług'],
                ],
            ]);
    }

    public function test_provider_can_book_another_provider(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $otherProvider = User::factory()->provider()->create();
        $otherProvider->profile()->create(UserProfile::factory()->make()->toArray());
        $otherProvider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
            'base_price' => 150,
        ]);

        Sanctum::actingAs($provider);

        $response = $this->postJson('/api/v1/bookings', [
            'provider_id' => $otherProvider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '14:00',
            'service_address' => 'ul. Krakowska 10, Kraków',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Rezerwacja utworzona',
            ]);

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $provider->id,
            'provider_id' => $otherProvider->id,
            'service_id' => $service->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_customer_can_book_provider(): void
    {
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());
        $customer->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $service = Service::factory()->create([
            'provider_id' => $provider->id,
            'base_price' => 200,
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/bookings', [
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '09:00',
            'service_address' => 'ul. Wrocławska 5, Wrocław',
            'customer_notes' => 'Proszę o kontakt telefoniczny',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'customer_notes' => 'Proszę o kontakt telefoniczny',
        ]);
    }

    public function test_unauthenticated_user_cannot_create_booking(): void
    {
        $provider = User::factory()->provider()->create();
        $service = Service::factory()->create(['provider_id' => $provider->id]);

        $response = $this->postJson('/api/v1/bookings', [
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '10:00',
            'service_address' => 'ul. Testowa 1',
        ]);

        $response->assertStatus(401);
    }
}
