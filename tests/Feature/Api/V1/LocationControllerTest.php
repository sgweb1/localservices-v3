<?php

namespace Tests\Feature\Api\V1;

use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy API dla LocationController
 * 
 * @group api
 * @group locations
 */
class LocationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed test locations
        Location::factory()->create([
            'name' => 'Warszawa',
            'slug' => 'warszawa',
            'latitude' => 52.2297,
            'longitude' => 21.0122,
            'is_major_city' => true,
        ]);

        Location::factory()->create([
            'name' => 'Kraków',
            'slug' => 'krakow',
            'latitude' => 50.0647,
            'longitude' => 19.9450,
            'is_major_city' => true,
        ]);

        Location::factory()->create([
            'name' => 'Zamość',
            'slug' => 'zamosc',
            'latitude' => 50.7231,
            'longitude' => 23.2520,
            'is_major_city' => false,
        ]);
    }

    /**
     * Test: GET /api/v1/locations - Lista wszystkich lokalizacji
     */
    public function test_index_returns_all_locations(): void
    {
        $response = $this->getJson('/api/v1/locations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'latitude',
                        'longitude',
                        'is_major_city',
                    ],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test: Lokalizacje są sortowane: major cities first, potem alfabetycznie
     */
    public function test_index_sorts_by_major_city_then_name(): void
    {
        $response = $this->getJson('/api/v1/locations');

        $data = $response->json('data');
        
        // Pierwsze dwa to major cities
        $this->assertTrue($data[0]['is_major_city']);
        $this->assertTrue($data[1]['is_major_city']);
        
        // Trzecia to minor city
        $this->assertFalse($data[2]['is_major_city']);
        $this->assertEquals('Zamość', $data[2]['name']);
    }

    /**
     * Test: GET /api/v1/locations/major-cities - Tylko główne miasta
     */
    public function test_major_cities_returns_only_major_cities(): void
    {
        $response = $this->getJson('/api/v1/locations/major-cities');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $data = $response->json('data');
        foreach ($data as $location) {
            $this->assertTrue($location['is_major_city']);
        }
    }

    /**
     * Test: GET /api/v1/locations/{id} - Szczegóły lokalizacji
     */
    public function test_show_returns_location_by_id(): void
    {
        $location = Location::where('name', 'Warszawa')->first();

        $response = $this->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $location->id,
                    'name' => 'Warszawa',
                    'slug' => 'warszawa',
                    'is_major_city' => true,
                ],
            ]);
    }

    /**
     * Test: GET /api/v1/locations/{id} - 404 dla nieistniejącej lokalizacji
     */
    public function test_show_returns_404_for_non_existent_location(): void
    {
        $response = $this->getJson('/api/v1/locations/999');

        $response->assertStatus(404)
            ->assertJson(['error' => 'Lokalizacja nie znaleziona']);
    }

    /**
     * Test: GET /api/v1/locations/by-slug/{slug} - Lokalizacja po slug
     */
    public function test_by_slug_returns_location(): void
    {
        $response = $this->getJson('/api/v1/locations/by-slug/krakow');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Kraków',
                    'slug' => 'krakow',
                ],
            ]);
    }

    /**
     * Test: GET /api/v1/locations/by-slug/{slug} - 404 dla nieistniejącego slug
     */
    public function test_by_slug_returns_404_for_non_existent_slug(): void
    {
        $response = $this->getJson('/api/v1/locations/by-slug/nieistniejace-miasto');

        $response->assertStatus(404)
            ->assertJson(['error' => 'Lokalizacja nie znaleziona']);
    }

    /**
     * Test: Endpoint zwraca tylko wybrane pola (nie wszystkie)
     */
    public function test_index_returns_only_selected_fields(): void
    {
        $response = $this->getJson('/api/v1/locations');

        $data = $response->json('data.0');
        
        // Powinno być: id, name, slug, latitude, longitude, is_major_city
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('slug', $data);
        $this->assertArrayHasKey('latitude', $data);
        $this->assertArrayHasKey('longitude', $data);
        $this->assertArrayHasKey('is_major_city', $data);
        
        // Nie powinno być: created_at, updated_at, region, population
        $this->assertArrayNotHasKey('created_at', $data);
        $this->assertArrayNotHasKey('updated_at', $data);
    }
}
