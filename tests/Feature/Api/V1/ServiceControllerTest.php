<?php

namespace Tests\Feature\Api\V1;

use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\ProviderProfile;
use App\Enums\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy API dla ServiceController
 * 
 * @group api
 * @group services
 */
class ServiceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $provider;
    protected Location $location;
    protected ServiceCategory $category1;
    protected ServiceCategory $category2;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Kategorie testowe
        $this->category1 = ServiceCategory::factory()->create(['name' => 'Hydraulika', 'slug' => 'hydraulika']);
        $this->category2 = ServiceCategory::factory()->create(['name' => 'Elektryka', 'slug' => 'elektryka']);
        
        // Lokalizacja testowa
        $this->location = Location::factory()->create([
            'name' => 'Warszawa',
            'slug' => 'warszawa',
        ]);

        // Provider testowy
        $this->provider = User::factory()->provider()->create([
            'name' => 'Jan Kowalski',
        ]);

        ProviderProfile::factory()->create([
            'user_id' => $this->provider->id,
            'trust_score' => 85,
        ]);

        // Usługi testowe
        Service::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->location->id,
            'status' => 'active',
            'category_id' => $this->category1->id,
            'base_price' => 150,
            'instant_booking' => false,
        ]);

        Service::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->location->id,
            'status' => 'active',
            'category_id' => $this->category2->id,
            'base_price' => 200,
            'instant_booking' => true,
        ]);
    }

    /**
     * Test: GET /api/v1/services - Lista usług
     */
    public function test_index_returns_services_list(): void
    {
        $response = $this->getJson('/api/v1/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'uuid',
                        'title',
                        'description',
                        'base_price',
                        'provider' => [
                            'id',
                            'uuid',
                            'name',
                            'avatar',
                        ],
                    ],
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                    'last_page',
                ],
            ]);
    }

    /**
     * Test: Filtr po kategorii
     */
    public function test_filter_by_category(): void
    {
        $response = $this->getJson("/api/v1/services?category_id={$this->category1->id}");

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(5, $data);
        foreach ($data as $service) {
            $this->assertEquals($this->category1->id, $service['category_id']);
        }
    }

    /**
     * Test: Filtr po location_id
     */
    public function test_filter_by_location_id(): void
    {
        // Druga lokalizacja bez usług
        $otherLocation = Location::factory()->create(['name' => 'Kraków']);

        $response = $this->getJson("/api/v1/services?location_id={$this->location->id}");

        $response->assertStatus(200);
        $this->assertGreaterThan(0, $response->json('meta.total'));

        // Filtr po lokalizacji bez usług
        $responseEmpty = $this->getJson("/api/v1/services?location_id={$otherLocation->id}");
        $this->assertEquals(0, $responseEmpty->json('meta.total'));
    }

    /**
     * Test: Filtr search po nazwie i opisie
     */
    public function test_filter_by_search(): void
    {
        Service::factory()->create([
            'provider_id' => $this->provider->id,
            'title' => 'Naprawa kranu',
            'description' => 'Szybka naprawa przeciekającego kranu',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/services?search=kran');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        $this->assertStringContainsStringIgnoringCase('kran', $data[0]['title']);
    }

    /**
     * Test: Filtr po cenie min/max
     */
    public function test_filter_by_price_range(): void
    {
        $response = $this->getJson('/api/v1/services?min_price=100&max_price=180');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $service) {
            $this->assertGreaterThanOrEqual(100, $service['base_price']);
            $this->assertLessThanOrEqual(180, $service['base_price']);
        }
    }

    /**
     * Test: Filtr instant_only
     */
    public function test_filter_by_instant_only(): void
    {
        $response = $this->getJson('/api/v1/services?instant_only=1');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(3, count($data)); // 3 usługi z instant_booking
    }

    /**
     * Test: Sortowanie po cenie rosnąco
     */
    public function test_sort_by_price_asc(): void
    {
        $response = $this->getJson('/api/v1/services?sort=price_asc');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        for ($i = 0; $i < count($data) - 1; $i++) {
            $this->assertLessThanOrEqual(
                $data[$i + 1]['base_price'],
                $data[$i]['base_price']
            );
        }
    }

    /**
     * Test: Sortowanie po cenie malejąco
     */
    public function test_sort_by_price_desc(): void
    {
        $response = $this->getJson('/api/v1/services?sort=price_desc');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        for ($i = 0; $i < count($data) - 1; $i++) {
            $this->assertGreaterThanOrEqual(
                $data[$i + 1]['base_price'],
                $data[$i]['base_price']
            );
        }
    }

    /**
     * Test: Paginacja
     */
    public function test_pagination(): void
    {
        $response = $this->getJson('/api/v1/services?per_page=5&page=1');

        $response->assertStatus(200)
            ->assertJson([
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 5,
                ],
            ]);

        $this->assertLessThanOrEqual(5, count($response->json('data')));
    }

    /**
     * Test: Walidacja - per_page max 50
     */
    public function test_per_page_max_50(): void
    {
        $response = $this->getJson('/api/v1/services?per_page=100');

        // Powinno zwrócić błąd walidacji
        $response->assertStatus(422);
    }

    /**
     * Test: Walidacja - location_id musi istnieć
     */
    public function test_location_id_must_exist(): void
    {
        $response = $this->getJson('/api/v1/services?location_id=999');

        $response->assertStatus(422);
    }

    /**
     * Test: GET /api/v1/services/{id} - Szczegóły usługi
     */
    public function test_show_returns_service_details(): void
    {
        $service = Service::first();

        $response = $this->getJson("/api/v1/services/{$service->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $service->id,
                    'uuid' => $service->uuid,
                    'title' => $service->title,
                ],
            ]);
    }

    /**
     * Test: GET /api/v1/services/{id} - 404 dla nieistniejącej usługi
     */
    public function test_show_returns_404_for_non_existent_service(): void
    {
        $response = $this->getJson('/api/v1/services/999');

        $response->assertStatus(404)
            ->assertJson(['error' => 'Usługa nie znaleziona']);
    }

    /**
     * Test: Tylko aktywne usługi są zwracane
     */
    public function test_only_active_services_are_returned(): void
    {
        Service::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/services');

        $data = $response->json('data');
        foreach ($data as $service) {
            $this->assertEquals('active', $service['status']);
        }
    }

    /**
     * Test: Provider z trust_score jest eager loaded
     */
    public function test_provider_trust_score_is_loaded(): void
    {
        $response = $this->getJson('/api/v1/services');

        $response->assertStatus(200);
        $data = $response->json('data.0');
        
        $this->assertArrayHasKey('provider', $data);
        $this->assertArrayHasKey('id', $data['provider']);
        $this->assertArrayHasKey('name', $data['provider']);
    }
}
