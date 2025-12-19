<?php

namespace Tests\Feature\Api\V1\Profile;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AvatarUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /**
     * Test: User może uploadować avatar
     */
    public function test_user_can_upload_avatar(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200)->size(1024); // 1MB

        $response = $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Avatar uploaded successfully',
            ]);

        // Sprawdź czy plik został zapisany w storage
        $this->assertNotNull($user->fresh()->avatar);
        Storage::disk('public')->assertExists($user->fresh()->avatar);
    }

    /**
     * Test: Stary avatar jest usuwany przy nowym uploadzie
     */
    public function test_old_avatar_is_deleted_on_new_upload(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        // Utwórz stary avatar (jako plik, nie katalog)
        $oldFile = UploadedFile::fake()->image('old_avatar.jpg');
        Storage::disk('public')->putFileAs('avatars/0/1', $oldFile, 'old_avatar.jpg');
        $user->update(['avatar' => 'avatars/0/1/old_avatar.jpg']);

        Sanctum::actingAs($user);

        // Upload nowego
        $newFile = UploadedFile::fake()->image('new_avatar.jpg');
        $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $newFile,
        ]);

        // Stary powinien być usunięty
        Storage::disk('public')->assertMissing('avatars/0/1/old_avatar.jpg');
    }

    /**
     * Test: Avatar musi być obrazem
     */
    public function test_avatar_must_be_image(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    /**
     * Test: Avatar nie może być większy niż 2MB
     */
    public function test_avatar_cannot_exceed_2mb(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->image('large_avatar.jpg')->size(3072); // 3MB

        $response = $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test: Sharded path jest generowana poprawnie
     */
    public function test_avatar_is_stored_in_sharded_path(): void
    {
        $user = User::factory()->create(['id' => 123]);
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->image('avatar.jpg');

        $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $file,
        ]);

        $avatarPath = $user->fresh()->avatar;
        
        // Shard powinien być 123 % 100 = 23
        $this->assertStringContainsString('avatars/23/123', $avatarPath);
    }

    /**
     * Test: Rate limiting działa (10 uploadów/minutę)
     */
    public function test_avatar_upload_has_rate_limiting(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        // 10 uploadów powinno przejść
        for ($i = 0; $i < 10; $i++) {
            $file = UploadedFile::fake()->image("avatar{$i}.jpg");
            $response = $this->postJson('/api/v1/profile/avatar', [
                'avatar' => $file,
            ]);
            $response->assertStatus(200);
        }

        // 11. upload powinien być zablokowany
        $file = UploadedFile::fake()->image('avatar11.jpg');
        $response = $this->postJson('/api/v1/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(429); // Too Many Requests
    }
}
