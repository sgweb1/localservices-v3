<?php

namespace Tests\Feature\Api\V1\Provider;

use App\Models\Service;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Test Suite for Provider ServiceController
 * 
 * Covers:
 * - Service CRUD operations (Create, Read, Update, Delete)
 * - Authorization and authentication
 * - Validation rules for all fields
 * - Photo upload and management
 * - Status toggling
 * - Provider-specific access control
 * 
 * @group provider
 * @group services
 */
class ServiceControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var User Provider user for testing
     */
    protected User $provider;

    /**
     * @var ServiceCategory Test category
     */
    protected ServiceCategory $category;

    /**
     * @var Location Test location
     */
    protected Location $location;

    /**
     * Setup method run before each test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create test provider
        $this->provider = User::factory()->provider()->create([
            'email' => 'provider@test.com',
        ]);

        // Create test category and location
        $this->category = ServiceCategory::factory()->create(['name' => 'Sprzątanie']);
        $this->location = Location::factory()->create(['name' => 'Warszawa']);

        // Fake storage for photo uploads
        Storage::fake('public');
    }

    /**
     * Test: Unauthorized user cannot access provider services
     * 
     * @test
     */
    public function unauthenticated_user_cannot_access_provider_services(): void
    {
        $response = $this->getJson('/api/v1/provider/services');

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    /**
     * Test: Non-provider user cannot access provider endpoints
     * 
     * @test
     */
    public function non_provider_cannot_access_provider_services(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);

        $response = $this->getJson('/api/v1/provider/services');

        $response->assertStatus(403);
    }

    /**
     * Test: Provider can view their own services list
     * 
     * @test
     */
    public function provider_can_view_their_services(): void
    {
        Sanctum::actingAs($this->provider);

        // Create 3 services for this provider
        Service::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
        ]);

        // Create 2 services for another provider (should not be visible)
        $otherProvider = User::factory()->create(['role' => 'provider']);
        Service::factory()->count(2)->create([
            'provider_id' => $otherProvider->id,
        ]);

        $response = $this->getJson('/api/v1/provider/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'slug',
                        'description',
                        'pricing_type',
                        'base_price',
                        'status',
                        'category',
                        'location',
                        'photos',
                    ]
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(3, 'data'); // Only own services
    }

    /**
     * Test: Provider can view single service details
     * 
     * @test
     */
    public function provider_can_view_single_service(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'title' => 'Professional Cleaning Service',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson("/api/v1/provider/services/{$service->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $service->id,
                    'title' => 'Professional Cleaning Service',
                ]
            ]);
    }

    /**
     * Test: Provider cannot view another provider's service
     * 
     * @test
     */
    public function provider_cannot_view_other_provider_service(): void
    {
        Sanctum::actingAs($this->provider);

        $otherProvider = User::factory()->create(['role' => 'provider']);
        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
        ]);

        $response = $this->getJson("/api/v1/provider/services/{$service->id}");

        $response->assertStatus(404);
    }

    /**
     * Test: Provider can create new service with valid data
     * 
     * @test
     */
    public function provider_can_create_service_with_valid_data(): void
    {
        Sanctum::actingAs($this->provider);

        $serviceData = [
            'title' => 'New Professional Cleaning',
            'description' => 'High-quality cleaning service for homes and offices. We use eco-friendly products and professional equipment.',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'pricing_type' => 'hourly',
            'base_price' => 50.00,
            'pricing_unit' => 'hour',
            'instant_booking' => true,
            'accepts_quote_requests' => true,
            'min_notice_hours' => 24,
            'max_advance_days' => 90,
            'duration_minutes' => 120,
            'willing_to_travel' => true,
            'max_distance_km' => 25,
            'travel_fee_per_km' => 2.5,
            'what_included' => 'All cleaning materials, equipment, and transportation',
            'requirements' => ['Access to water', 'Parking space'],
            'tools_provided' => ['Vacuum cleaner', 'Mop', 'Eco-friendly detergents'],
            'cancellation_policy' => 'Full refund if cancelled 24 hours before service',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/provider/services', $serviceData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'slug',
                    'description',
                    'pricing_type',
                    'base_price',
                ]
            ]);

        // Verify database
        $this->assertDatabaseHas('services', [
            'title' => 'New Professional Cleaning',
            'provider_id' => $this->provider->id,
            'pricing_type' => 'hourly',
            'base_price' => 50.00,
        ]);
    }

    /**
     * Test: Service creation fails with invalid data
     * 
     * @test
     */
    public function service_creation_fails_with_invalid_data(): void
    {
        Sanctum::actingAs($this->provider);

        $invalidData = [
            'title' => 'Ab', // Too short (min 5)
            'description' => 'Too short', // Too short (min 50)
            // Missing required fields
        ];

        $response = $this->postJson('/api/v1/provider/services', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description', 'category_id']);
    }

    /**
     * Test: Title validation rules
     * 
     * @test
     */
    public function title_must_be_between_5_and_100_characters(): void
    {
        Sanctum::actingAs($this->provider);

        // Too short
        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Test',
            'description' => str_repeat('Valid description with enough characters. ', 3),
            'category_id' => $this->category->id,
        ]);
        $response->assertJsonValidationErrors(['title']);

        // Too long
        $response = $this->postJson('/api/v1/provider/services', [
            'title' => str_repeat('a', 101),
            'description' => str_repeat('Valid description with enough characters. ', 3),
            'category_id' => $this->category->id,
        ]);
        $response->assertJsonValidationErrors(['title']);
    }

    /**
     * Test: Description validation rules
     * 
     * @test
     */
    public function description_must_be_at_least_50_characters(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Valid Title Here',
            'description' => 'Too short',
            'category_id' => $this->category->id,
        ]);

        $response->assertJsonValidationErrors(['description']);
    }

    /**
     * Test: Pricing validation for hourly/fixed pricing
     * 
     * @test
     */
    public function hourly_or_fixed_pricing_requires_base_price(): void
    {
        Sanctum::actingAs($this->provider);

        $serviceData = [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description with enough characters. ', 3),
            'category_id' => $this->category->id,
            'pricing_type' => 'hourly',
            // Missing base_price
        ];

        $response = $this->postJson('/api/v1/provider/services', $serviceData);

        $response->assertJsonValidationErrors(['base_price']);
    }

    /**
     * Test: Quote pricing requires price range
     * 
     * @test
     */
    public function quote_pricing_requires_price_range(): void
    {
        Sanctum::actingAs($this->provider);

        $serviceData = [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description with enough characters. ', 3),
            'category_id' => $this->category->id,
            'pricing_type' => 'quote',
            // Missing price_range_low and price_range_high
        ];

        $response = $this->postJson('/api/v1/provider/services', $serviceData);

        $response->assertJsonValidationErrors(['price_range_low', 'price_range_high']);
    }

    /**
     * Test: Provider can update their own service
     * 
     * @test
     */
    public function provider_can_update_their_service(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'title' => 'Updated Service Title',
            'description' => str_repeat('Updated description with more details about the service. ', 3),
            'base_price' => 75.00,
        ];

        $response = $this->putJson("/api/v1/provider/services/{$service->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $service->id,
                    'title' => 'Updated Service Title',
                ]
            ]);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'title' => 'Updated Service Title',
            'base_price' => 75.00,
        ]);
    }

    /**
     * Test: Provider cannot update another provider's service
     * 
     * @test
     */
    public function provider_cannot_update_other_provider_service(): void
    {
        Sanctum::actingAs($this->provider);

        $otherProvider = User::factory()->create(['role' => 'provider']);
        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
        ]);

        $response = $this->putJson("/api/v1/provider/services/{$service->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test: Provider can delete their own service
     * 
     * @test
     */
    public function provider_can_delete_their_service(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
        ]);

        $response = $this->deleteJson("/api/v1/provider/services/{$service->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Usługa została usunięta']);

        $this->assertDatabaseMissing('services', [
            'id' => $service->id,
        ]);
    }

    /**
     * Test: Provider cannot delete another provider's service
     * 
     * @test
     */
    public function provider_cannot_delete_other_provider_service(): void
    {
        Sanctum::actingAs($this->provider);

        $otherProvider = User::factory()->create(['role' => 'provider']);
        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
        ]);

        $response = $this->deleteJson("/api/v1/provider/services/{$service->id}");

        $response->assertStatus(404);

        // Service should still exist
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
        ]);
    }

    /**
     * Test: Provider can toggle service status
     * 
     * @test
     */
    public function provider_can_toggle_service_status(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => 'active',
        ]);

        // Toggle to paused
        $response = $this->postJson("/api/v1/provider/services/{$service->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'paused',
                ]
            ]);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'paused',
        ]);

        // Toggle back to active
        $response = $this->postJson("/api/v1/provider/services/{$service->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'active',
                ]
            ]);
    }

    /**
     * Test: Service photos upload and management
     * 
     * @test
     */
    public function provider_can_upload_service_photos(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
        ]);

        $photo1 = UploadedFile::fake()->image('service1.jpg', 800, 600);
        $photo2 = UploadedFile::fake()->image('service2.jpg', 800, 600);

        $response = $this->postJson("/api/v1/provider/services/{$service->id}/photos", [
            'photos' => [$photo1, $photo2],
            'alt_texts' => ['Professional cleaning equipment', 'Clean office space'],
            'primary_index' => 0,
        ]);

        $response->assertStatus(200);

        // Verify photos stored
        Storage::disk('public')->assertExists("services/{$service->id}/" . $photo1->hashName());
        Storage::disk('public')->assertExists("services/{$service->id}/" . $photo2->hashName());

        // Verify database
        $this->assertDatabaseCount('service_photos', 2);
        $this->assertDatabaseHas('service_photos', [
            'service_id' => $service->id,
            'is_primary' => true,
        ]);
    }

    /**
     * Test: Primary photo management
     * 
     * @test
     */
    public function only_one_photo_can_be_primary(): void
    {
        Sanctum::actingAs($this->provider);

        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
        ]);

        $photo1 = UploadedFile::fake()->image('photo1.jpg');
        $photo2 = UploadedFile::fake()->image('photo2.jpg');

        // Upload with first as primary
        $this->postJson("/api/v1/provider/services/{$service->id}/photos", [
            'photos' => [$photo1, $photo2],
            'primary_index' => 0,
        ]);

        // Count primary photos
        $primaryCount = $service->photos()->where('is_primary', true)->count();
        $this->assertEquals(1, $primaryCount);
    }

    /**
     * Test: Arrays validation (requirements, tools)
     * 
     * @test
     */
    public function requirements_and_tools_must_be_arrays(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
            'requirements' => 'not an array', // Invalid
            'tools_provided' => 123, // Invalid
        ]);

        $response->assertJsonValidationErrors(['requirements', 'tools_provided']);
    }

    /**
     * Test: Cancellation policy is required
     * 
     * @test
     */
    public function cancellation_policy_is_required(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
            // Missing cancellation_policy
        ]);

        $response->assertJsonValidationErrors(['cancellation_policy']);
    }

    /**
     * Test: SEO fields validation (meta_title, meta_description)
     * 
     * @test
     */
    public function seo_fields_have_character_limits(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
            'meta_title' => str_repeat('a', 61), // Max 60
            'meta_description' => str_repeat('b', 161), // Max 160
        ]);

        $response->assertJsonValidationErrors(['meta_title', 'meta_description']);
    }

    /**
     * Test: Travel settings validation
     * 
     * @test
     */
    public function travel_distance_and_fee_validated_when_willing_to_travel(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Test Service',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
            'willing_to_travel' => true,
            'max_distance_km' => -5, // Invalid: negative
            'travel_fee_per_km' => 'not a number', // Invalid: not numeric
        ]);

        $response->assertJsonValidationErrors(['max_distance_km', 'travel_fee_per_km']);
    }

    /**
     * Test: Bulk operations on services
     * 
     * @test
     */
    public function provider_can_perform_bulk_status_change(): void
    {
        Sanctum::actingAs($this->provider);

        $services = Service::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'status' => 'active',
        ]);

        $serviceIds = $services->pluck('id')->toArray();

        $response = $this->postJson('/api/v1/provider/services/bulk/status', [
            'service_ids' => $serviceIds,
            'status' => 'paused',
        ]);

        $response->assertStatus(200);

        foreach ($serviceIds as $id) {
            $this->assertDatabaseHas('services', [
                'id' => $id,
                'status' => 'paused',
            ]);
        }
    }

    /**
     * Test: Service slug generation
     * 
     * @test
     */
    public function service_slug_is_generated_automatically(): void
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'Professional House Cleaning',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('services', [
            'title' => 'Professional House Cleaning',
            'slug' => 'professional-house-cleaning',
        ]);
    }

    /**
     * Test: Duplicate slug handling
     * 
     * @test
     */
    public function duplicate_slugs_are_made_unique(): void
    {
        Sanctum::actingAs($this->provider);

        // Create first service
        $this->postJson('/api/v1/provider/services', [
            'title' => 'House Cleaning',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
        ]);

        // Create second service with same title
        $response = $this->postJson('/api/v1/provider/services', [
            'title' => 'House Cleaning',
            'description' => str_repeat('Valid description. ', 10),
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(201);

        // Should have different slugs
        $services = Service::where('provider_id', $this->provider->id)->get();
        $slugs = $services->pluck('slug')->toArray();
        
        $this->assertCount(2, array_unique($slugs));
    }
}
