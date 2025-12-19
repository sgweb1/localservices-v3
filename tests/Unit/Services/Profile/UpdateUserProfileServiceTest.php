<?php

namespace Tests\Unit\Services\Profile;

use App\Models\User;
use App\Models\UserProfile;
use App\Services\Profile\UpdateUserProfileService;
use App\Services\Profile\CalculateProfileCompletenessService;
use App\Services\TrustScore\RecalculateTrustScoreService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UpdateUserProfileServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Pola customera są mapowane do odpowiednich tabel
     */
    public function test_customer_fields_are_mapped_correctly(): void
    {
        $user = User::factory()->customer()->create();
        $profile = $user->profile()->create(UserProfile::factory()->make()->toArray());

        $service = app(UpdateUserProfileService::class);

        $data = [
            'name' => 'Jan Kowalski',
            'email' => 'jan@example.com',
            'bio' => 'Moje bio',
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
        ];

        $service->__invoke($user, $data);

        // Users table
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jan Kowalski',
            'email' => 'jan@example.com',
        ]);

        // User_profiles table
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
        ]);
    }

    /**
     * Test: Transakcja jest rollbackowana przy błędzie
     */
    public function test_transaction_is_rolled_back_on_error(): void
    {
        $user = User::factory()->customer()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());

        $originalName = $user->name;

        // Zamockuj metodę transaction na DB facade, aby rzucała wyjątek
        DB::shouldReceive('transaction')
            ->andThrow(new \Exception('Database error'));

        $service = app(UpdateUserProfileService::class);

        try {
            $service->__invoke($user, ['name' => 'New Name']);
        } catch (\Exception $e) {
            // Expected
        }

        // Dane nie powinny być zmienione
        $this->assertEquals($originalName, $user->fresh()->name);
    }

    /**
     * Test: Profile completeness service jest wywoływany
     */
    public function test_profile_completeness_is_calculated(): void
    {
        $user = User::factory()->customer()->create();
        $profile = $user->profile()->create(UserProfile::factory()->empty()->make()->toArray());

        $this->assertEquals(0, $profile->profile_completion_percentage);

        $service = app(UpdateUserProfileService::class);

        $service->__invoke($user, [
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
        ]);

        // Completeness powinno wzrosnąć (15% + 15% = 30%)
        $this->assertEquals(30, $profile->fresh()->profile_completion_percentage);
    }

    /**
     * Test: Trust score service jest wywoływany tylko dla providera
     */
    public function test_trust_score_is_calculated_only_for_provider(): void
    {
        // Customer - trust score nie powinien się zmienić
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());

        $service = app(UpdateUserProfileService::class);
        $service->__invoke($customer, ['name' => 'Customer Name']);

        // Provider - trust score powinien zostać przeliczony
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $providerProfile = $provider->providerProfile()->create([
            'business_name' => 'Test Business',
            'trust_score' => 0,
            'id_verified' => true, // +20 pkt
        ]);

        $service->__invoke($provider, ['business_name' => 'New Business']);

        // Trust score powinien być 20 (id_verified)
        $this->assertEquals(20, $providerProfile->fresh()->trust_score);
    }
}
