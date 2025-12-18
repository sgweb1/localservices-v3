<?php

namespace Tests\Unit\Services\Profile;

use App\Models\UserProfile;
use App\Services\Profile\CalculateProfileCompletenessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalculateProfileCompletenessServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Pusty profil = 0%
     */
    public function test_empty_profile_has_zero_completeness(): void
    {
        $profile = UserProfile::factory()->empty()->create();

        $service = new CalculateProfileCompletenessService();
        $score = $service->__invoke($profile);

        $this->assertEquals(0, $score);
        $this->assertEquals(0, $profile->fresh()->profile_completion_percentage);
    }

    /**
     * Test: Kompletny profil = 100%
     */
    public function test_complete_profile_has_100_percent(): void
    {
        $profile = UserProfile::factory()->create([
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
            'phone' => '+48 123 456 789',
            'bio' => str_repeat('Test bio content. ', 10), // >50 znaków
            'address' => 'ul. Testowa 1, Warszawa',
            'latitude' => 52.2297,
            'longitude' => 21.0122,
            'avatar_url' => 'avatars/1/1/avatar.jpg',
        ]);

        $service = new CalculateProfileCompletenessService();
        $score = $service->__invoke($profile);

        $this->assertEquals(100, $score);
    }

    /**
     * Test: Bio <50 znaków nie liczy się do score
     */
    public function test_short_bio_does_not_count(): void
    {
        $profile = UserProfile::factory()->create([
            'first_name' => 'Jan',      // +15%
            'last_name' => 'Kowalski',  // +15%
            'phone' => '+48 123 456 789', // +15%
            'bio' => 'Krótkie bio',     // 0% (za krótkie)
            'address' => 'ul. Testowa', // +15%
            'latitude' => 52.2297,      // +10%
            'longitude' => 21.0122,
            'avatar_url' => 'avatar.jpg', // +10%
        ]);

        $service = new CalculateProfileCompletenessService();
        $score = $service->__invoke($profile);

        // 15+15+15+15+10+10 = 80% (bez bio)
        $this->assertEquals(80, $score);
    }

    /**
     * Test: Każde pole ma poprawną wagę
     */
    public function test_each_field_has_correct_weight(): void
    {
        $service = new CalculateProfileCompletenessService();

        // Tylko first_name: 15%
        $profile = UserProfile::factory()->empty()->create(['first_name' => 'Jan']);
        $this->assertEquals(15, $service->__invoke($profile));

        // Tylko last_name: 15%
        $profile = UserProfile::factory()->empty()->create(['last_name' => 'Kowalski']);
        $this->assertEquals(15, $service->__invoke($profile));

        // Tylko phone: 15%
        $profile = UserProfile::factory()->empty()->create(['phone' => '+48 123']);
        $this->assertEquals(15, $service->__invoke($profile));

        // Tylko bio ≥50: 20%
        $profile = UserProfile::factory()->empty()->create(['bio' => str_repeat('x', 50)]);
        $this->assertEquals(20, $service->__invoke($profile));

        // Tylko address: 15%
        $profile = UserProfile::factory()->empty()->create(['address' => 'ul. Test']);
        $this->assertEquals(15, $service->__invoke($profile));

        // Tylko GPS: 10%
        $profile = UserProfile::factory()->empty()->create(['latitude' => 52.2, 'longitude' => 21.0]);
        $this->assertEquals(10, $service->__invoke($profile));

        // Tylko avatar: 10%
        $profile = UserProfile::factory()->empty()->create(['avatar_url' => 'avatar.jpg']);
        $this->assertEquals(10, $service->__invoke($profile));
    }

    /**
     * Test: Score jest zapisywany do bazy
     */
    public function test_score_is_saved_to_database(): void
    {
        $profile = UserProfile::factory()->create([
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
            'profile_completion_percentage' => 0,
        ]);

        $service = new CalculateProfileCompletenessService();
        $service->__invoke($profile);

        $this->assertDatabaseHas('user_profiles', [
            'id' => $profile->id,
            'profile_completion_percentage' => 30, // 15% + 15%
        ]);
    }
}
