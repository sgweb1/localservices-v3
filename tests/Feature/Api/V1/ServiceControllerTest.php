<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserType;
use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServicePhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Test Suite for Provider ServiceController
 * 
 * Pokrycie:
 * - Authentication & Authorization
 * - CRUD operations (indexSelf, showSelf, storeSelf, updateSelf, destroySelf)
 * - Status toggle (toggleSelf)
 * - Gallery management (uploadPhoto, deletePhoto, reorderPhotos, setPrimaryPhoto)
 * 
 * @group services
 * @group provider
 * @group api
 */
class ServiceControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    protected User $provider;
    protected User $customer;
    protected ServiceCategory $category;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        // Create provider
        $this->provider = User::factory()->create([
            'user_type' => UserType::Provider,
            'email' => 'provider@test.com',
        ]);
        ProviderProfile::factory()->create(['user_id' => $this->provider->id]);

        // Create customer
        $this->customer = User::factory()->create([
            'user_type' => UserType::Customer,
            'email' => 'customer@test.com',
        ]);

        // Create test data
        $this->category = ServiceCategory::factory()->create(['name' => 'Sprzątanie']);
        $this->location = Location::factory()->create(['city' => 'Warszawa']);
    }

    /**
     * Test: Unauthenticated user cannot access provider services
     */
    public function test_unauthenticated_user_cannot_access_services(): void
    {
        $response = $this->getJson('/api/v1/provider/services');
        $response->assertStatus(401);
    }

    /**
     * Test: Customer cannot access provider services endpoints
     */
    public function test_customer_cannot_access_provider_services(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/provider/services');

        // Should return 403 or empty list (depending on implementation)
        $this->assertTrue(
            $response->status() === 403 || 
            ($response->status() === 200 && empty($response->json('data')))
        );
    }

    /**
     * Test: Provider can list their services
     */
    public function test_provider_can_list_their_services(): void
    {
        Service::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        // Create services for other provider (should not appear)
        $otherProvider = User::factory()->create(['user_type' => UserType::Provider]);
        Service::factory()->count(2)->create([
            'provider_id' => $otherProvider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/services');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'base_price', 'status'],
                ],
            ]);
    }

    /**
     * Test: Provider can view single service
     */
    public function test_provider_can_view_single_service(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'title' => 'Test Service',
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/provider/services/{$service->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $service->id)
            ->assertJsonPath('data.title', 'Test Service');
    }

    /**
     * Test: Provider cannot view other provider's service
     */
    public function test_provider_cannot_view_other_provider_service(): void
    {
        $otherProvider = User::factory()->create(['user_type' => UserType::Provider]);
        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/provider/services/{$service->id}");

        $response->assertNotFound();
    }

    /**
     * Test: Provider can create service
     */
    public function test_provider_can_create_service(): void
    {
        $data = [
            'title' => 'Professional Cleaning Service',
            'description' => 'High-quality cleaning service for homes and offices. We provide all necessary equipment and cleaning supplies.',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'pricing_type' => 'hourly',
            'base_price' => 50.00,
            'duration_minutes' => 120,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/services', $data);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Professional Cleaning Service')
            ->assertJsonPath('data.base_price', 50.00)
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('services', [
            'provider_id' => $this->provider->id,
            'title' => 'Professional Cleaning Service',
            'base_price' => 50.00,
        ]);
    }

    /**
     * Test: Service creation requires minimum field lengths
     */
    public function test_service_creation_validates_field_lengths(): void
    {
        $data = [
            'title' => 'Test', // Too short (min 5)
            'description' => 'Short', // Too short (min 50)
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'pricing_type' => 'hourly',
            'base_price' => 50.00,
        ];

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/services', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description']);
    }

    /**
     * Test: Provider can update their service
     */
    public function test_provider_can_update_service(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'title' => 'Original Title',
            'base_price' => 50.00,
        ]);

        $updateData = [
            'title' => 'Updated Service Title',
            'base_price' => 75.00,
        ];

        $response = $this->actingAs($this->provider)
            ->patchJson("/api/v1/provider/services/{$service->id}", $updateData);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Service Title')
            ->assertJsonPath('data.base_price', 75.00);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'title' => 'Updated Service Title',
            'base_price' => 75.00,
        ]);
    }

    /**
     * Test: Provider cannot update other provider's service
     */
    public function test_provider_cannot_update_other_provider_service(): void
    {
        $otherProvider = User::factory()->create(['user_type' => UserType::Provider]);
        $service = Service::factory()->create([
            'provider_id' => $otherProvider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->patchJson("/api/v1/provider/services/{$service->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertNotFound();
    }

    /**
     * Test: Provider can delete their service
     */
    public function test_provider_can_delete_service(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/provider/services/{$service->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('services', [
            'id' => $service->id,
        ]);
    }

    /**
     * Test: Provider can toggle service status
     */
    public function test_provider_can_toggle_service_status(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'active',
        ]);

        // Toggle to paused
        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/services/{$service->id}/toggle-status");

        $response->assertOk()
            ->assertJsonPath('data.status', 'paused');

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'paused',
        ]);

        // Toggle back to active
        $response2 = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/services/{$service->id}/toggle-status");

        $response2->assertOk()
            ->assertJsonPath('data.status', 'active');
    }

    /**
     * Test: Provider can upload service photo
     */
    public function test_provider_can_upload_service_photo(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $file = UploadedFile::fake()->image('service-photo.jpg', 800, 600);

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/providers/{$this->provider->id}/services/{$service->id}/photos", [
                'photo' => $file,
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'url', 'is_primary'],
            ]);

        $this->assertDatabaseHas('service_photos', [
            'service_id' => $service->id,
        ]);
    }

    /**
     * Test: Provider can delete service photo
     */
    public function test_provider_can_delete_service_photo(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $photo = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'url' => 'services/test-photo.jpg',
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/providers/{$this->provider->id}/services/{$service->id}/photos/{$photo->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('service_photos', [
            'id' => $photo->id,
        ]);
    }

    /**
     * Test: Provider can reorder service photos
     */
    public function test_provider_can_reorder_service_photos(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $photo1 = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'display_order' => 1,
        ]);
        $photo2 = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'display_order' => 2,
        ]);
        $photo3 = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'display_order' => 3,
        ]);

        // Reorder: photo3 first, photo1 second, photo2 third
        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/providers/{$this->provider->id}/services/{$service->id}/photos/reorder", [
                'photo_ids' => [$photo3->id, $photo1->id, $photo2->id],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('service_photos', [
            'id' => $photo3->id,
            'display_order' => 1,
        ]);
        $this->assertDatabaseHas('service_photos', [
            'id' => $photo1->id,
            'display_order' => 2,
        ]);
        $this->assertDatabaseHas('service_photos', [
            'id' => $photo2->id,
            'display_order' => 3,
        ]);
    }

    /**
     * Test: Provider can set primary photo
     */
    public function test_provider_can_set_primary_photo(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        $photo1 = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'is_primary' => true,
        ]);
        $photo2 = ServicePhoto::factory()->create([
            'service_id' => $service->id,
            'is_primary' => false,
        ]);

        // Set photo2 as primary
        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/providers/{$this->provider->id}/services/{$service->id}/photos/{$photo2->id}/primary");

        $response->assertOk();

        // Verify only photo2 is primary
        $this->assertDatabaseHas('service_photos', [
            'id' => $photo2->id,
            'is_primary' => true,
        ]);
        $this->assertDatabaseHas('service_photos', [
            'id' => $photo1->id,
            'is_primary' => false,
        ]);
    }

    /**
     * Test: Only authenticated provider can access their services
     */
    public function test_only_authenticated_provider_can_access_services(): void
    {
        $service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ]);

        // Without authentication
        $response1 = $this->getJson("/api/v1/provider/services/{$service->id}");
        $response1->assertStatus(401);

        // With authentication
        $response2 = $this->actingAs($this->provider)
            ->getJson("/api/v1/provider/services/{$service->id}");
        $response2->assertOk();
    }

    /**
     * Test: Service validation for pricing types
     */
    public function test_service_validates_pricing_type_requirements(): void
    {
        // Hourly/Fixed requires base_price
        $data = [
            'title' => 'Test Service Title Here',
            'description' => 'This is a test service description that is long enough to pass validation requirements.',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'pricing_type' => 'hourly',
            // Missing base_price
        ];

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/services', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['base_price']);
    }
}
