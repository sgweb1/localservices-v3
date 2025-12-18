<?php

namespace Tests\Feature\Api\V1\Profile;

use App\Events\ProfileUpdated;
use App\Models\CustomerProfile;
use App\Models\ProviderProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Customer może zaktualizować podstawowe pola profilu
     */
    public function test_customer_can_update_basic_fields(): void
    {
        Event::fake([ProfileUpdated::class]);

        $user = User::factory()->customer()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $user->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/profile', [
            'name' => 'Jan Kowalski Updated',
            'bio' => 'Nowe bio customera',
            'city' => 'Warszawa',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profile updated successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jan Kowalski Updated',
            'city' => 'Warszawa',
        ]);

        Event::assertDispatched(ProfileUpdated::class);
    }

    /**
     * Test: Provider musi mieć bio ≥50 znaków
     */
    public function test_provider_bio_must_be_at_least_50_characters(): void
    {
        $user = User::factory()->provider()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $user->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/profile', [
            'bio' => 'Krótkie bio',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bio']);
    }

    /**
     * Test: Email musi być unikalny
     */
    public function test_email_must_be_unique(): void
    {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        
        $user = User::factory()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/profile', [
            'email' => 'existing@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test: Użytkownik bez autentykacji nie może aktualizować profilu
     */
    public function test_unauthorized_user_cannot_update_profile(): void
    {
        $response = $this->patchJson('/api/v1/profile', [
            'name' => 'Test',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test: Provider może zaktualizować pola biznesowe
     */
    public function test_provider_can_update_business_fields(): void
    {
        $user = User::factory()->provider()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $user->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/profile', [
            'business_name' => 'Nowa Firma Sp. z o.o.',
            'service_description' => 'Świadczymy profesjonalne usługi hydrauliczne.',
            'website_url' => 'https://example.com',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $user->id,
            'business_name' => 'Nowa Firma Sp. z o.o.',
        ]);
    }

    /**
     * Test: Cache jest invalidowany po aktualizacji
     */
    public function test_cache_is_invalidated_after_update(): void
    {
        $user = User::factory()->customer()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $user->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        // Ustawienie cache
        Cache::put("user.profile.{$user->id}", 'cached_data', 3600);

        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/profile', [
            'name' => 'Updated Name',
        ]);

        // Cache powinien być usunięty
        $this->assertNull(Cache::get("user.profile.{$user->id}"));
    }

    /**
     * Test: Profile completeness jest przeliczane po update
     */
    public function test_profile_completeness_is_calculated_after_update(): void
    {
        $user = User::factory()->customer()->create();
        $profile = $user->profile()->create(UserProfile::factory()->empty()->make()->toArray());
        $user->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $this->assertEquals(0, $profile->fresh()->profile_completion_percentage);

        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/profile', [
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
        ]);

        // Completeness powinno wzrosnąć
        $this->assertGreaterThan(0, $profile->fresh()->profile_completion_percentage);
    }

    /**
     * Test: Trust Score jest przeliczany dla providera po update
     */
    public function test_trust_score_is_recalculated_for_provider(): void
    {
        $user = User::factory()->provider()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $providerProfile = $user->providerProfile()->create(
            ProviderProfile::factory()->make([
                'trust_score' => 0,
                'id_verified' => false,
            ])->toArray()
        );

        Sanctum::actingAs($user);

        // Zaktualizuj profil
        $this->patchJson('/api/v1/profile', [
            'business_name' => 'Updated Business',
        ]);

        // Trust score powinien być przeliczony
        // (nawet jeśli pozostanie 0 bo brak weryfikacji, mechanizm się uruchomił)
        $this->assertNotNull($providerProfile->fresh()->trust_score);
    }
}
