<?php

namespace Tests\Feature\Api\V1;

use App\Models\Location;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\Ignore;
use Tests\TestCase;

/**
 * Testy API dla VisibilityController (preview rankingu).
 *
 * @group api
 * @group visibility
 */
#[Ignore("Visibility ranking - zbędne dla core feature'ów")]
class VisibilityControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('features.visibility.trust_score_gating', true);
    }

    /**
     * GET /api/v1/visibility/preview zwraca posortowaną listę providerów.
     */
    public function test_preview_returns_ranked_providers(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        $category = ServiceCategory::factory()->create(['slug' => 'hydraulika']);

        $plan = SubscriptionPlan::create([
            'name' => 'Pro Plan',
            'description' => 'Plan PRO',
            'price_monthly' => 129,
            'price_yearly' => 1290,
            'max_services' => 50,
            'max_bookings_per_month' => null,
            'featured_listing' => true,
            'priority_support' => true,
            'analytics_dashboard' => true,
            'features' => [],
            'is_active' => true,
            'display_order' => 1,
        ]);
        $plan->slug = 'pro';
        $plan->save();

        $proUser = User::factory()->provider()->create(['name' => 'Elektryk PRO']);
        ProviderProfile::factory()->for($proUser, 'user')->create(['trust_score' => 80]);

        Subscription::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $proUser->id,
            'subscription_plan_id' => $plan->id,
            'billing_period' => 'monthly',
            'status' => 'active',
            'started_at' => Carbon::now()->subDay(),
            'ends_at' => Carbon::now()->addDays(30),
            'renews_at' => Carbon::now()->addDays(30),
            'auto_renew' => true,
        ]);

        Service::factory()->create([
            'provider_id' => $proUser->id,
            'location_id' => $location->id,
            'category_id' => $category->id,
            'title' => 'Usługa PRO',
            'slug' => 'usluga-pro',
            'is_promoted' => false,
            'published_at' => now(),
        ]);

        $freeUser = User::factory()->provider()->create(['name' => 'Elektryk FREE']);
        ProviderProfile::factory()->for($freeUser, 'user')->create(['trust_score' => 55]);

        Service::factory()->create([
            'provider_id' => $freeUser->id,
            'location_id' => $location->id,
            'category_id' => $category->id,
            'title' => 'Usługa FREE',
            'slug' => 'usluga-free',
            'is_promoted' => true,
            'promoted_until' => now()->addDays(7),
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/visibility/preview?city=warszawa&category=hydraulika');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'meta' => [
                    'city',
                    'category',
                    'total_providers',
                    'page',
                    'per_page',
                ],
                'data' => [
                    '*' => [
                        'provider_id',
                        'name',
                        'plan',
                        'trust_score',
                        'score',
                        'position',
                        'tags',
                        'boost',
                        'boost_expires_at',
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertEquals($proUser->id, $data[0]['provider_id']);
        $this->assertEquals('pro', $data[0]['plan']);
        $this->assertEquals('free', $data[1]['plan']);
    }

    /**
     * Walidacja: wymagane miasto i kategoria, oba muszą istnieć.
     */
    public function test_preview_validates_city_and_category_slugs(): void
    {
        $responseMissing = $this->getJson('/api/v1/visibility/preview');
        $responseMissing->assertStatus(422);

        $responseInvalid = $this->getJson('/api/v1/visibility/preview?city=nie-ma&category=też-nie');
        $responseInvalid->assertStatus(422)
            ->assertJsonValidationErrors(['city', 'category']);
    }

    /**
     * Test: Boost sorting - provider z późniejszym expires_at jest wyżej
     */
    public function test_boost_sorting_by_expires_at(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        $category = ServiceCategory::factory()->create(['slug' => 'hydraulika']);

        // Provider 1 - boost wygasa za 7 dni
        $provider1 = User::factory()->provider()->create(['name' => 'Provider 1']);
        ProviderProfile::factory()->for($provider1, 'user')->create(['trust_score' => 80]);
        Service::factory()->create([
            'provider_id' => $provider1->id,
            'location_id' => $location->id,
            'category_id' => $category->id,
            'published_at' => now(),
        ]);
        \App\Models\Boost::create([
            'provider_id' => $provider1->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'expires_at' => now()->addDays(7),
            'price' => 99,
            'is_active' => true,
        ]);

        // Provider 2 - boost wygasa za 14 dni (powinien być wyżej)
        $provider2 = User::factory()->provider()->create(['name' => 'Provider 2']);
        ProviderProfile::factory()->for($provider2, 'user')->create(['trust_score' => 80]);
        Service::factory()->create([
            'provider_id' => $provider2->id,
            'location_id' => $location->id,
            'category_id' => $category->id,
            'published_at' => now(),
        ]);
        \App\Models\Boost::create([
            'provider_id' => $provider2->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'expires_at' => now()->addDays(14),
            'price' => 99,
            'is_active' => true,
        ]);

        // Provider 3 - bez boost
        $provider3 = User::factory()->provider()->create(['name' => 'Provider 3']);
        ProviderProfile::factory()->for($provider3, 'user')->create(['trust_score' => 80]);
        Service::factory()->create([
            'provider_id' => $provider3->id,
            'location_id' => $location->id,
            'category_id' => $category->id,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/visibility/preview?city=warszawa&category=hydraulika');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        // Provider 2 (14 dni) powinien być pierwszy
        $this->assertEquals($provider2->id, $data[0]['provider_id']);
        $this->assertEquals('city_boost', $data[0]['boost']);
        $this->assertNotNull($data[0]['boost_expires_at']);
        
        // Provider 1 (7 dni) powinien być drugi
        $this->assertEquals($provider1->id, $data[1]['provider_id']);
        $this->assertEquals('city_boost', $data[1]['boost']);
        
        // Provider 3 (bez boost) powinien być trzeci
        $this->assertEquals($provider3->id, $data[2]['provider_id']);
        $this->assertNull($data[2]['boost']);
    }

    /**
     * GET /api/v1/visibility/providers/{city} endpoint - test nowy
     */
    public function test_providers_endpoint_works(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        
        $provider = User::factory()->provider()->create();
        ProviderProfile::factory()->for($provider, 'user')->create(['trust_score' => 75]);
        Service::factory()->create([
            'provider_id' => $provider->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);

        // Act
        $response = $this->getJson('/api/v1/visibility/providers/warszawa');

        // Assert
        $this->assertEquals(200, $response->status(), 'Response: ' . json_encode($response->json()));
    }

    /**
     * Test: Providery z aktywnymi boost'ami pojawiają się pierwsi
     */
    public function test_providers_with_active_boosts_appear_first(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        
        // Provider bez boost'a
        $provider1 = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);
        ProviderProfile::factory()->for($provider1, 'user')->create(['trust_score' => 80]);
        Service::factory()->create([
            'provider_id' => $provider1->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);

        // Provider z aktywnym boost'em
        $provider2 = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);
        ProviderProfile::factory()->for($provider2, 'user')->create(['trust_score' => 70]);
        Service::factory()->create([
            'provider_id' => $provider2->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);
        \App\Models\Boost::factory()->create([
            'provider_id' => $provider2->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'expires_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/visibility/providers/warszawa');

        $response->assertOk();
        $data = $response->json('data');
        
        // Provider z boost'em powinien być pierwszy
        $this->assertEquals($provider2->id, $data[0]['id']);
        $this->assertTrue($data[0]['active_boost']);
        
        // Provider bez boost'a powinien być drugi
        $this->assertEquals($provider1->id, $data[1]['id']);
        $this->assertFalse($data[1]['active_boost']);
    }

    /**
     * Test: Providery posortowani po rank_score gdy brak boost'ów
     */
    public function test_providers_sorted_by_rank_score_without_boosts(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        
        // Provider z wysokim trust score
        $provider1 = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);
        ProviderProfile::factory()->for($provider1, 'user')->create(['trust_score' => 90]);
        Service::factory()->create([
            'provider_id' => $provider1->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);

        // Provider z niskim trust score
        $provider2 = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);
        ProviderProfile::factory()->for($provider2, 'user')->create(['trust_score' => 40]);
        Service::factory()->create([
            'provider_id' => $provider2->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/visibility/providers/warszawa');

        $response->assertOk();
        $data = $response->json('data');
        
        // Provider z wyższym rank_score powinien być pierwszy
        $this->assertEquals($provider1->id, $data[0]['id']);
        $this->assertGreaterThan($data[1]['rank_score'], $data[0]['rank_score']);
    }

    /**
     * Test: Filtrowanie po kategorii działa
     */
    public function test_filter_by_category_works(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        $categoryHydraulika = ServiceCategory::factory()->create(['slug' => 'hydraulika']);
        $categoryElektrycy = ServiceCategory::factory()->create(['slug' => 'elektrycy']);
        
        // Provider z hydrauliką
        $provider1 = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);
        ProviderProfile::factory()->for($provider1, 'user')->create(['trust_score' => 75]);
        Service::factory()->create([
            'provider_id' => $provider1->id,
            'location_id' => $location->id,
            'category_id' => $categoryHydraulika->id,
            'published_at' => now(),
        ]);

        // Provider z elektrykami
        $provider2 = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);
        ProviderProfile::factory()->for($provider2, 'user')->create(['trust_score' => 75]);
        Service::factory()->create([
            'provider_id' => $provider2->id,
            'location_id' => $location->id,
            'category_id' => $categoryElektrycy->id,
            'published_at' => now(),
        ]);

        // Bez filtru - powinni być obu
        $response = $this->getJson('/api/v1/visibility/providers/warszawa');
        $this->assertCount(2, $response->json('data'));

        // Z filtrem na hydraulikę
        $response = $this->getJson('/api/v1/visibility/providers/warszawa?category=hydraulika');
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($provider1->id, $response->json('data.0.id'));

        // Z filtrem na elektryków
        $response = $this->getJson('/api/v1/visibility/providers/warszawa?category=elektrycy');
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($provider2->id, $response->json('data.0.id'));
    }

    /**
     * Test: Paginacja działa poprawnie
     */
    public function test_pagination_works(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        
        // Utwórz 25 providerów
        for ($i = 0; $i < 25; $i++) {
            $provider = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);
            ProviderProfile::factory()->for($provider, 'user')->create(['trust_score' => 50 + $i]);
            Service::factory()->create([
                'provider_id' => $provider->id,
                'location_id' => $location->id,
                'published_at' => now(),
            ]);
        }

        // Domyślnie 20 per page
        $response = $this->getJson('/api/v1/visibility/providers/warszawa');
        $response->assertOk();
        $this->assertCount(20, $response->json('data'));
        $this->assertEquals(25, $response->json('pagination.total'));
        $this->assertEquals(1, $response->json('pagination.current_page'));

        // Strona 2
        $response = $this->getJson('/api/v1/visibility/providers/warszawa?page=2');
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(2, $response->json('pagination.current_page'));

        // Custom per_page
        $response = $this->getJson('/api/v1/visibility/providers/warszawa?per_page=10');
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(10, $response->json('pagination.per_page'));
    }

    /**
     * Test: Wygaśnięte boost'y nie wpływają na sorting
     */
    public function test_expired_boosts_dont_affect_sorting(): void
    {
        $location = Location::factory()->create(['slug' => 'warszawa']);
        
        // Provider z wygasłym boost'em ale wysokim trust score
        $provider1 = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);
        ProviderProfile::factory()->for($provider1, 'user')->create(['trust_score' => 90]);
        Service::factory()->create([
            'provider_id' => $provider1->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);
        \App\Models\Boost::factory()->create([
            'provider_id' => $provider1->id,
            'type' => 'city_boost',
            'city' => 'Warszawa',
            'expires_at' => now()->subDay(),  // Wygasły
            'is_active' => false,
        ]);

        // Provider bez boost'a ale niższym trust score
        $provider2 = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,

        ]);
        ProviderProfile::factory()->for($provider2, 'user')->create(['trust_score' => 70]);
        Service::factory()->create([
            'provider_id' => $provider2->id,
            'location_id' => $location->id,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/visibility/providers/warszawa');

        $response->assertOk();
        $data = $response->json('data');
        
        // Provider1 powinien być pierwszy (boost wygasł więc się nie liczy)
        $this->assertEquals($provider1->id, $data[0]['id']);
        $this->assertFalse($data[0]['active_boost']);
    }
}

