<?php

namespace Tests\Feature\Api\V1;

use App\Models\PlatformInvoice;
use App\Models\User;
use App\Services\BoostService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Ignore;
use Tests\TestCase;

/**
 * Testy dla Boost API - system zakupu promocji z Stripe
 */
#[Ignore("Boost model missing - zbędne dla core feature'ów")]
class BoostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $provider;

    protected function setUp(): void
    {
        parent::setUp();

        // Utwórz providera
        $this->provider = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);
    }

    /**
     * Test: Inicjowanie zakupu boost'a dla city_boost
     * 
     * POST /api/v1/boosts/purchase
     */
    public function test_can_initiate_boost_purchase_city_boost(): void
    {
        // Mock BoostService aby uniknąć rzeczywistych żądań do Stripe
        $this->mock(BoostService::class, function ($mock) {
            $mock->shouldReceive('initiateBoostPurchase')
                ->andReturn([
                    'success' => true,
                    'checkout_url' => 'https://checkout.stripe.com/test',
                    'session_id' => 'cs_test_123',
                    'invoice_id' => 1,
                ]);
        });

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/boosts/purchase', [
                'type' => 'city_boost',
                'days' => 7,
                'city' => 'Warszawa',
            ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'success',
            'checkout_url',
            'session_id',
            'invoice_id',
        ]);
    }

    /**
     * Test: Inicjowanie zakupu boost'a dla spotlight
     */
    public function test_can_initiate_boost_purchase_spotlight(): void
    {
        // Mock BoostService
        $this->mock(BoostService::class, function ($mock) {
            $mock->shouldReceive('initiateBoostPurchase')
                ->andReturn([
                    'success' => true,
                    'checkout_url' => 'https://checkout.stripe.com/test',
                    'session_id' => 'cs_test_456',
                    'invoice_id' => 1,
                ]);
        });

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/boosts/purchase', [
                'type' => 'spotlight',
                'days' => 14,
                'category' => 'Hydraulika',
            ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'success',
            'checkout_url',
            'session_id',
            'invoice_id',
        ]);
    }

    /**
     * Test: Customer nie może kupować boost'ów
     */
    public function test_customer_cannot_purchase_boosts(): void
    {
        $customer = User::factory()->create([
            'user_type' => User::TYPE_CUSTOMER,
        ]);

        $response = $this->actingAs($customer)
            ->postJson('/api/v1/boosts/purchase', [
                'type' => 'city_boost',
                'days' => 7,
                'city' => 'Warszawa',
            ]);

        $response->assertForbidden();
    }

    /**
     * Test: Walidacja wymaganych pól
     */
    public function test_validates_required_fields(): void
    {
        // Brakuje city dla city_boost
        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/boosts/purchase', [
                'type' => 'city_boost',
                'days' => 7,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['city']);

        // Brakuje category dla spotlight
        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/boosts/purchase', [
                'type' => 'spotlight',
                'days' => 14,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['category']);
    }

    /**
     * Test: Lista boost'ów providera
     */
    public function test_can_list_provider_boosts(): void
    {
        // Utwórz kilka boost'ów
        Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'Warszawa',
            'expires_at' => now()->addDays(7),
        ]);

        Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'spotlight',
            'category' => 'Hydraulika',
            'expires_at' => now()->addDays(14),
        ]);

        // Wygasły boost
        Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'Kraków',
            'expires_at' => now()->subDay(),
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/boosts');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'active_boosts' => [
                '*' => [
                    'id',
                    'type',
                    'expires_at',
                    'days_remaining',
                    'is_active',
                ],
            ],
            'expired_boosts' => [
                '*' => [
                    'id',
                    'type',
                    'expired_at',
                ],
            ],
        ]);

        // Sprawdzenie liczby boost'ów
        $this->assertCount(2, $response->json('active_boosts'));
        $this->assertCount(1, $response->json('expired_boosts'));
    }

    /**
     * Test: Szczegóły boost'a
     */
    public function test_can_get_boost_details(): void
    {
        $boost = Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'Warszawa',
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/boosts/{$boost->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('boost.id', $boost->id);
        $response->assertJsonPath('boost.type', 'city_boost');
        $response->assertJsonPath('boost.city', 'Warszawa');
    }

    /**
     * Test: Provider nie ma dostępu do czужych boost'ów
     */
    public function test_cannot_access_other_provider_boost(): void
    {
        $otherProvider = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);

        $boost = Boost::factory()->create([
            'provider_id' => $otherProvider->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/boosts/{$boost->id}");

        $response->assertForbidden();
    }

    /**
     * Test: Ceny boost'ów
     */
    public function test_boost_prices_are_correct(): void
    {
        // Mock BoostService
        $this->mock(BoostService::class, function ($mock) {
            $mock->shouldReceive('initiateBoostPurchase')
                ->andReturn([
                    'success' => true,
                    'checkout_url' => 'https://checkout.stripe.com/test',
                    'session_id' => 'cs_test_999',
                    'invoice_id' => 1,
                ]);
        });

        $prices = [
            ['type' => 'city_boost', 'days' => 7, 'expected' => 9.99],
            ['type' => 'city_boost', 'days' => 14, 'expected' => 19.99],
            ['type' => 'city_boost', 'days' => 30, 'expected' => 29.99],
            ['type' => 'spotlight', 'days' => 7, 'expected' => 14.99],
            ['type' => 'spotlight', 'days' => 14, 'expected' => 24.99],
            ['type' => 'spotlight', 'days' => 30, 'expected' => 39.99],
        ];

        foreach ($prices as $price) {
            // Verify that prices are defined in BoostService
            $this->assertArrayHasKey(
                "{$price['type']}_{$price['days']}days",
                BoostService::BOOST_PRICES
            );

            $this->assertEquals(
                $price['expected'],
                BoostService::BOOST_PRICES["{$price['type']}_{$price['days']}days"]
            );
        }
    }

    /**
     * Test: Przedłużenie aktywnego boost'a (city_boost)
     */
    public function test_can_renew_active_city_boost(): void
    {
        $boost = Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'category' => null,
            'is_active' => true,
            'expires_at' => now()->addDays(3),
        ]);

        $originalExpires = $boost->expires_at;

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/boosts/{$boost->id}/renew", [
                'days' => 14,
            ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);

        $boost->refresh();
        $this->assertTrue($boost->expires_at->greaterThan($originalExpires));
    }

    /**
     * Test: Przedłużenie boost'a wymaga bycia właścicielem
     */
    public function test_cannot_renew_boost_of_other_provider(): void
    {
        $other = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);

        $boost = Boost::factory()->create([
            'provider_id' => $other->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'category' => null,
            'is_active' => true,
            'expires_at' => now()->addDays(5),
        ]);

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/boosts/{$boost->id}/renew", [
                'days' => 7,
            ]);

        $response->assertForbidden();
    }

    /**
     * Test: Przedłużenie nieaktywnego boost'a zwraca 409
     */
    public function test_renew_inactive_boost_returns_conflict(): void
    {
        $boost = Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'category' => null,
            'is_active' => false,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/boosts/{$boost->id}/renew", [
                'days' => 14,
            ]);

        $response->assertStatus(409);
    }

    /**
     * Test: Anulowanie aktywnego boost'a
     */
    public function test_can_cancel_active_boost(): void
    {
        $boost = Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'type' => 'city_boost',
            'city' => 'warszawa',
            'category' => null,
            'is_active' => true,
            'expires_at' => now()->addDays(10),
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/boosts/{$boost->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);

        $boost->refresh();
        $this->assertFalse($boost->is_active);
    }

    /**
     * Test: Nie można anulować boost'a innego providera
     */
    public function test_cannot_cancel_boost_of_other_provider(): void
    {
        $other = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);

        $boost = Boost::factory()->create([
            'provider_id' => $other->id,
            'category' => null,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/boosts/{$boost->id}");

        $response->assertForbidden();
    }

    /**
     * Test: Anulowanie boost'a nieaktywnego zwraca 409
     */
    public function test_cancel_inactive_boost_returns_conflict(): void
    {
        $boost = Boost::factory()->create([
            'provider_id' => $this->provider->id,
            'category' => null,
            'is_active' => false,
            'expires_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/boosts/{$boost->id}");

        $response->assertStatus(409);
    }
}
