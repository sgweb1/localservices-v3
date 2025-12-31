<?php

namespace Tests\Unit;

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
        // Arrange: Tworzymy providera i rezerwacje
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        
        // 10 pending
        \App\Models\Booking::factory()->count(10)->create([
            'provider_id' => $provider->id,
            'status' => 'pending',
        ]);
        
        // 5 confirmed
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'status' => 'confirmed',
        ]);
        
        // 5 cancelled
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'status' => 'cancelled',
        ]);

        // Act: Pobieramy cancelled z per_page=15
        $response = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?status=cancelled&per_page=15&page=1');

        // Assert
        $response->assertOk();
        $response->assertJsonCount(5, 'data'); // Wszystkie 5 cancelled na 1 stronie
        $response->assertJsonPath('pagination.total', 5);
        $response->assertJsonPath('pagination.current_page', 1);
        $response->assertJsonPath('pagination.last_page', 1);
    }

    /**
     * Test: Counts pokazują wszystkie rezerwacje niezależnie od aktualnej strony
     * 
     * Scenariusz:
     * - Mamy 30 rezerwacji: 15 pending, 10 confirmed, 5 cancelled
     * - Pobieramy stronę 1 (bez filtra status, per_page=15)
     * - Oczekujemy: counts pokazują pending:15, confirmed:10, cancelled:5
     */
    public function test_counts_show_all_bookings_not_just_current_page(): void
    {
        // Arrange
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        
        \App\Models\Booking::factory()->count(15)->create([
            'provider_id' => $provider->id,
            'status' => 'pending',
        ]);
        
        \App\Models\Booking::factory()->count(10)->create([
            'provider_id' => $provider->id,
            'status' => 'confirmed',
        ]);
        
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'status' => 'cancelled',
        ]);

        // Act: Pobieramy stronę 1 bez filtra
        $response = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?per_page=15&page=1');

        // Assert: Counts pokazują wszystkie statusy
        $response->assertOk();
        $response->assertJsonPath('counts.total', 30);
        $response->assertJsonPath('counts.pending', 15);
        $response->assertJsonPath('counts.confirmed', 10);
        $response->assertJsonPath('counts.cancelled', 5);
    }

    /**
     * Test: Filtrowanie uwzględnia hiddenFilter
     * 
     * Scenariusz:
     * - Mamy 10 cancelled rezerwacji: 5 widocznych, 5 ukrytych
     * - Filtrujemy po cancelled + visible
     * - Oczekujemy: 5 wyników (tylko widoczne cancelled)
     */
    public function test_filters_respect_hidden_filter(): void
    {
        // Arrange
        $provider = \App\Models\User::factory()->create([
            'user_type' => \App\Enums\UserType::Provider,
        ]);
        
        // 5 cancelled visible
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'status' => 'cancelled',
            'hidden_by_provider' => false,
        ]);
        
        // 5 cancelled hidden
        \App\Models\Booking::factory()->count(5)->create([
            'provider_id' => $provider->id,
            'status' => 'cancelled',
            'hidden_by_provider' => true,
        ]);

        // Act: Pobieramy cancelled visible
        $response = $this->actingAs($provider)
            ->getJson('/api/v1/provider/bookings?status=cancelled&hidden=visible');

        // Assert: Tylko 5 widocznych
        $response->assertOk();
        $response->assertJsonCount(5, 'data');
        $response->assertJsonPath('pagination.total', 5);
        
        // Counts też powinny uwzględniać hiddenFilter
        $response->assertJsonPath('counts.cancelled', 5); // tylko widoczne
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
        
        \App\Models\Booking::factory()->count(25)->create([
            'provider_id' => $provider->id,
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
        $responsePage1->assertJsonPath('pagination.last_page', 3);
        $responsePage1->assertJsonPath('pagination.total', 25);
        
        $responsePage3->assertOk();
        $responsePage3->assertJsonCount(5, 'data'); // ostatnia strona
        $responsePage3->assertJsonPath('pagination.current_page', 3);
    }
}
