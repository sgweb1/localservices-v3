<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test filtrowania rezerwacji po statusie
 * 
 * ZMIANA (2025-12-31): Testy dla nowej funkcjonalności filtrowania po statusie na backendzie
 * 
 * Sprawdzamy czy:
 * - Backend filtruje rezerwacje przed paginacją
 * - Counts pokazują wszystkie rezerwacje (nie tylko z aktualnej strony)
 * - Paginacja działa poprawnie z filtrem status
 */
class BookingsFilterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Backend filtruje rezerwacje po statusie przed paginacją
     * 
     * Scenariusz:
     * - Mamy 20 rezerwacji: 10 pending, 5 confirmed, 5 cancelled
     * - Ustawiamy per_page=15
     * - Filtrujemy po cancelled
     * - Oczekujemy: 5 wyników na 1 stronie (nie 0!)
     */
    public function test_filters_bookings_by_status_before_pagination(): void
    {
        // Arrange: Tworzymy providera z profilem
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        \App\Models\ProviderProfile::factory()->create([
            'user_id' => $provider->id,
        ]);
        
        // Customer do rezerwacji
        $customer = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Customer,
        ]);
        \App\Models\CustomerProfile::factory()->create([
            'user_id' => $customer->id,
        ]);
        
        // 10 pending
        \App\Models\Booking::factory()->count(10)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);
        
        // 5 confirmed
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'confirmed',
        ]);
        
        // 5 cancelled
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'cancelled',
        ]);

        // Act: Pobieramy cancelled z per_page=15
        $response = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?status=cancelled&per_page=15&page=1');

        // Assert
        $response->assertOk();
        $response->assertJsonCount(5, 'data'); // Wszystkie 5 cancelled na 1 stronie
        $response->assertJsonPath('meta.total', 5);
        $response->assertJsonPath('meta.current_page', 1);
        $response->assertJsonPath('meta.last_page', 1);
    }

    /**
     * Test: Endpoint zwraca wszystkie rezerwacje (bez filtrowania na froncie)
     * 
     * Scenariusz:
     * - Mamy 30 rezerwacji: 15 pending, 10 confirmed, 5 cancelled
     * - Pobieramy stronę 1 (bez filtra status, per_page=15)
     * - Oczekujemy: 15 rezerwacji na 1. stronie (bo per_page=15), total=30
     *
     * UWAGA: Endpoint /api/v1/provider/bookings NIE zwraca counts - 
     * to jest prosta lista z paginacją. Counts są tylko w ProviderBookingController.
     */
    public function test_counts_show_all_bookings_not_just_current_page(): void
    {
        // Arrange
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        \App\Models\ProviderProfile::factory()->create([
            'user_id' => $provider->id,
        ]);
        
        $customer = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Customer,
        ]);
        \App\Models\CustomerProfile::factory()->create([
            'user_id' => $customer->id,
        ]);
        
        \App\Models\Booking::factory()->count(15)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);
        
        \App\Models\Booking::factory()->count(10)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'confirmed',
        ]);
        
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'cancelled',
        ]);

        // Act: Pobieramy stronę 1 bez filtra
        $response = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?per_page=15&page=1');

        // Assert: Meta pokazuje total=30
        $response->assertOk();
        $response->assertJsonPath('meta.total', 30);
        $response->assertJsonPath('meta.per_page', 15);
        $response->assertJsonPath('meta.last_page', 2); // 30 / 15 = 2 strony
    }

    /**
     * Test: Filtrowanie uwzględnia hiddenFilter
     * 
     * Scenariusz:
     * - Mamy 10 rezerwacji: 5 widocznych, 5 ukrytych
     * - Filtr hidden=visible pokazuje tylko widoczne (5)
     * - Filtr hidden=hidden pokazuje tylko ukryte (5)
     * - Filtr hidden=all pokazuje wszystkie (10)
     */
    public function test_hidden_filter_works(): void
    {
        // Arrange
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        \App\Models\ProviderProfile::factory()->create([
            'user_id' => $provider->id,
        ]);
        
        $customer = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Customer,
        ]);
        \App\Models\CustomerProfile::factory()->create([
            'user_id' => $customer->id,
        ]);
        
        // Rezerwacje widoczne
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'hidden_by_provider' => false,
        ]);
        
        // Rezerwacje ukryte
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'hidden_by_provider' => true,
        ]);

        // Act & Assert: Tylko widoczne
        $responseVisible = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?hidden=visible&per_page=20');
        
        $responseVisible->assertOk();
        $responseVisible->assertJsonCount(5, 'data');
        $responseVisible->assertJsonPath('meta.total', 5);

        // Tylko ukryte
        $responseHidden = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?hidden=hidden&per_page=20');
        
        $responseHidden->assertOk();
        $responseHidden->assertJsonCount(5, 'data');
        $responseHidden->assertJsonPath('meta.total', 5);

        // Wszystkie
        $responseAll = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?hidden=all&per_page=20');
        
        $responseAll->assertOk();
        $responseAll->assertJsonCount(10, 'data');
        $responseAll->assertJsonPath('meta.total', 10);
    }

    /**
     * Test: Paginacja działa poprawnie z filtrem status
     * 
     * Scenariusz:
     * - Mamy 25 cancelled rezerwacji
     * - per_page=10
     * - Oczekujemy: 3 strony (10, 10, 5)
     */
    public function test_pagination_works_with_status_filter(): void
    {
        // Arrange
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        \App\Models\ProviderProfile::factory()->create([
            'user_id' => $provider->id,
        ]);
        
        $customer = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Customer,
        ]);
        \App\Models\CustomerProfile::factory()->create([
            'user_id' => $customer->id,
        ]);
        
        \App\Models\Booking::factory()->count(25)->create([
            'provider_id' => $provider->id,
            'customer_id' => $customer->id,
            'status' => 'cancelled',
        ]);

        // Act: Strona 1
        $responsePage1 = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?status=cancelled&per_page=10&page=1');
        
        // Strona 3
        $responsePage3 = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?status=cancelled&per_page=10&page=3');

        // Assert
        $responsePage1->assertOk();
        $responsePage1->assertJsonCount(10, 'data');
        $responsePage1->assertJsonPath('meta.last_page', 3);
        $responsePage1->assertJsonPath('meta.total', 25);

        $responsePage3->assertOk();
        $responsePage3->assertJsonCount(5, 'data'); // ostatnia strona
        $responsePage3->assertJsonPath('meta.current_page', 3);    }
}