<?php

namespace Tests\Feature\Api\V1\Provider;

use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServicePhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testy galerii zdjęć usługi (upload, delete, reorder, primary)
 * @group api
 * @group services
 */
class ServiceGalleryTest extends TestCase
{
    use RefreshDatabase;

    private User $provider;
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->provider = User::factory()->provider()->create();
        $category = ServiceCategory::factory()->create();
        $location = Location::factory()->create();

        $this->service = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $category->id,
            'location_id' => $location->id,
        ]);

        Sanctum::actingAs($this->provider);
    }

    public function test_upload_creates_photo_and_sets_primary_when_first(): void
    {
        $file = UploadedFile::fake()->image('photo1.jpg', 1200, 800);

        $res = $this->postJson("/api/v1/providers/{$this->provider->id}/services/{$this->service->id}/photos", [
            'photo' => $file,
            'alt_text' => 'Ładna fotka',
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('photo.is_primary', true)
            ->assertJsonPath('photo.alt_text', 'Ładna fotka');

        $this->assertDatabaseHas('service_photos', [
            'service_id' => $this->service->id,
            'is_primary' => true,
            'position' => 1,
        ]);
    }

    public function test_upload_second_photo_is_not_primary_and_has_incremented_position(): void
    {
        // Pierwsze zdjęcie
        ServicePhoto::factory()->create([
            'service_id' => $this->service->id,
            'image_path' => 'services/'.$this->service->id.'/p1.jpg',
            'is_primary' => true,
            'position' => 1,
        ]);

        $file2 = UploadedFile::fake()->image('photo2.jpg');
        $res2 = $this->postJson("/api/v1/providers/{$this->provider->id}/services/{$this->service->id}/photos", [
            'photo' => $file2,
        ]);

        $res2->assertStatus(201)
            ->assertJsonPath('photo.is_primary', false)
            ->assertJsonPath('photo.position', 2);
    }

    public function test_set_primary_changes_primary_flag(): void
    {
        $p1 = ServicePhoto::factory()->create([
            'service_id' => $this->service->id,
            'image_path' => 'services/'.$this->service->id.'/p1.jpg',
            'is_primary' => true,
            'position' => 1,
        ]);
        $p2 = ServicePhoto::factory()->create([
            'service_id' => $this->service->id,
            'image_path' => 'services/'.$this->service->id.'/p2.jpg',
            'is_primary' => false,
            'position' => 2,
        ]);

        $res = $this->postJson("/api/v1/providers/{$this->provider->id}/services/{$this->service->id}/photos/{$p2->id}/primary");
        $res->assertOk();

        $this->assertDatabaseHas('service_photos', ['id' => $p1->id, 'is_primary' => false]);
        $this->assertDatabaseHas('service_photos', ['id' => $p2->id, 'is_primary' => true]);
    }

    public function test_reorder_updates_positions(): void
    {
        $p1 = ServicePhoto::factory()->create(['service_id' => $this->service->id, 'image_path' => 'a.jpg', 'position' => 1]);
        $p2 = ServicePhoto::factory()->create(['service_id' => $this->service->id, 'image_path' => 'b.jpg', 'position' => 2]);
        $p3 = ServicePhoto::factory()->create(['service_id' => $this->service->id, 'image_path' => 'c.jpg', 'position' => 3]);

        $res = $this->postJson("/api/v1/providers/{$this->provider->id}/services/{$this->service->id}/photos/reorder", [
            'ordered_ids' => [$p3->id, $p1->id, $p2->id],
        ]);
        $res->assertOk();

        $this->assertDatabaseHas('service_photos', ['id' => $p3->id, 'position' => 1]);
        $this->assertDatabaseHas('service_photos', ['id' => $p1->id, 'position' => 2]);
        $this->assertDatabaseHas('service_photos', ['id' => $p2->id, 'position' => 3]);
    }

    public function test_delete_removes_photo_and_reassigns_primary_when_needed(): void
    {
        $p1 = ServicePhoto::factory()->create(['service_id' => $this->service->id, 'image_path' => 'a.jpg', 'position' => 1, 'is_primary' => true]);
        $p2 = ServicePhoto::factory()->create(['service_id' => $this->service->id, 'image_path' => 'b.jpg', 'position' => 2, 'is_primary' => false]);

        $res = $this->deleteJson("/api/v1/providers/{$this->provider->id}/services/{$this->service->id}/photos/{$p1->id}");
        $res->assertOk();

        $this->assertSoftDeleted('service_photos', ['id' => $p1->id]);
        $this->assertDatabaseHas('service_photos', ['id' => $p2->id, 'is_primary' => true]);
    }
}
