<?php

namespace Tests\Feature\Media;

use App\Models\Media;
use App\Models\User;
use App\Services\Media\MediaServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaServiceTest extends TestCase
{
    use RefreshDatabase;

    protected MediaServiceInterface $mediaService;

    protected function setUp(): void
    {
        parent::setUp();
        
        Storage::fake('public');
        $this->mediaService = app(MediaServiceInterface::class);
    }

    /**
     * Test uploadu avatara przez MediaService
     */
    public function test_upload_avatar_creates_media_record(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);

        $media = $this->mediaService->uploadAvatar($user, $file);

        // Sprawdź rekord Media
        $this->assertInstanceOf(Media::class, $media);
        $this->assertEquals('avatar', $media->collection);
        $this->assertEquals($user->id, $media->mediable_id);
        $this->assertEquals(User::class, $media->mediable_type);
        $this->assertNotNull($media->uuid);

        // Sprawdź plik
        Storage::disk('public')->assertExists($media->path);

        // Sprawdź update w users.avatar
        $this->assertEquals($media->path, $user->fresh()->avatar);
    }

    /**
     * Test uploadu przez trait HasMedia
     */
    public function test_user_can_add_media_via_trait(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $media = $user->addMedia($file, 'avatar');

        $this->assertInstanceOf(Media::class, $media);
        $this->assertDatabaseHas('media', [
            'mediable_id' => $user->id,
            'mediable_type' => User::class,
            'collection' => 'avatar',
        ]);
    }

    /**
     * Test getAvatarUrl helper
     */
    public function test_get_avatar_url_helper(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $user->addMedia($file, 'avatar');

        $url = $user->getAvatarUrl();
        $this->assertNotNull($url);
        $this->assertStringContainsString('avatars', $url);
    }

    /**
     * Test sharding w ścieżkach
     */
    public function test_avatar_uses_sharded_path(): void
    {
        $user = User::factory()->create(['id' => 123456]);
        $file = UploadedFile::fake()->image('avatar.jpg');

        $media = $this->mediaService->uploadAvatar($user, $file);

        // Shard dla 123456 = 456
        $this->assertStringContainsString('avatars/456/123456', $media->path);
    }

    /**
     * Test automatycznego usuwania mediów przez Observer
     */
    public function test_deleting_user_soft_deletes_media(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');
        
        $media = $user->addMedia($file, 'avatar');
        $mediaId = $media->id;

        // Soft delete użytkownika
        $user->delete();

        // Media powinno być soft-deleted
        $this->assertSoftDeleted('media', ['id' => $mediaId]);
        
        // Plik nadal istnieje (zostanie usunięty po 30 dniach)
        Storage::disk('public')->assertExists($media->path);
    }

    /**
     * Test force deleting usuwa pliki
     */
    public function test_force_deleting_user_removes_files(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');
        
        $media = $user->addMedia($file, 'avatar');
        $path = $media->path;

        // Force delete
        $user->forceDelete();

        // Media usunięte z bazy
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        
        // Katalog użytkownika nie istnieje (został usunięty)
        $shard = $user->id % 1000;
        $userDir = "avatars/{$shard}/{$user->id}";
        $this->assertFalse(Storage::disk('public')->exists($userDir));
    }

    /**
     * Test przywracania (restore) użytkownika
     */
    public function test_restoring_user_restores_media(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');
        
        $media = $user->addMedia($file, 'avatar');
        $mediaId = $media->id;

        // Soft delete i restore
        $user->delete();
        $user->restore();

        // Media przywrócone
        $this->assertDatabaseHas('media', [
            'id' => $mediaId,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test hasMedia helper
     */
    public function test_has_media_check(): void
    {
        $user = User::factory()->create();
        
        $this->assertFalse($user->hasMedia('avatar'));

        $file = UploadedFile::fake()->image('avatar.jpg');
        $user->addMedia($file, 'avatar');

        $this->assertTrue($user->hasMedia('avatar'));
        $this->assertEquals(1, $user->mediaCount('avatar'));
    }
}
