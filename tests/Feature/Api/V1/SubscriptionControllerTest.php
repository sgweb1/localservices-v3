<?php

namespace Tests\Feature\Api\V1;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy dla Subscription API - zarządzanie subskrypcjami
 */
class SubscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $provider;
    protected SubscriptionPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        // Utwórz providera
        $this->provider = User::factory()->create([
            'user_type' => User::TYPE_PROVIDER,
        ]);

        // Utwórz plan subskrypcji
        $this->plan = SubscriptionPlan::factory()->create([
            'name' => 'Pro Plan',
            'slug' => 'pro',
            'is_active' => true,
            'price_monthly' => 79.99,
            'price_yearly' => 699.99,
        ]);
    }

    /**
     * Test: Lista aktywnych subskrypcji providera
     */
    public function test_can_list_active_subscriptions(): void
    {
        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'ends_at' => now()->addDays(30),
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/subscriptions');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'active_subscriptions');
        $response->assertJsonPath('active_subscriptions.0.plan_name', 'Pro Plan');
    }

    /**
     * Test: Szczegóły konkretnej subskrypcji
     */
    public function test_can_get_subscription_details(): void
    {
        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $this->plan->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('subscription.plan.name', $this->plan->name);
        $response->assertJsonPath('subscription.status', 'active');
    }

    /**
     * Test: Nie można zobaczyć subskrypcji innego providera
     */
    public function test_cannot_access_other_provider_subscription(): void
    {
        $other = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);

        $subscription = Subscription::factory()->create([
            'user_id' => $other->id,
            'subscription_plan_id' => $this->plan->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertForbidden();
    }

    /**
     * Test: Przedłużenie aktywnej subskrypcji
     */
    public function test_can_renew_active_subscription(): void
    {
        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'billing_period' => 'monthly',
            'ends_at' => now()->addDays(5),
        ]);

        $originalEnds = $subscription->ends_at;

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/subscriptions/{$subscription->id}/renew", [
                'billing_period' => 'yearly',
            ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);

        $subscription->refresh();
        $this->assertGreaterThan($originalEnds, $subscription->ends_at);
        $this->assertEquals('yearly', $subscription->billing_period);
    }

    /**
     * Test: Przedłużenie wymaga bycia właścicielem
     */
    public function test_cannot_renew_subscription_of_other_provider(): void
    {
        $other = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);

        $subscription = Subscription::factory()->create([
            'user_id' => $other->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'ends_at' => now()->addDays(10),
        ]);

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/subscriptions/{$subscription->id}/renew", [
                'billing_period' => 'monthly',
            ]);

        $response->assertForbidden();
    }

    /**
     * Test: Przedłużenie anulowanej subskrypcji zwraca 409
     */
    public function test_renew_cancelled_subscription_returns_conflict(): void
    {
        $cancelledPlan = SubscriptionPlan::factory()->create(['slug' => 'cancelled-plan-' . uniqid()]);

        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $cancelledPlan->id,
            'status' => 'cancelled',
            'ends_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->provider)
            ->putJson("/api/v1/subscriptions/{$subscription->id}/renew", [
                'billing_period' => 'monthly',
            ]);

        $response->assertStatus(409);
    }

    /**
     * Test: Anulowanie aktywnej subskrypcji
     */
    public function test_can_cancel_active_subscription(): void
    {
        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'ends_at' => now()->addDays(20),
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertOk();
        $response->assertJsonPath('success', true);

        $subscription->refresh();
        $this->assertEquals('cancelled', $subscription->status);
        $this->assertNotNull($subscription->cancelled_at);
    }

    /**
     * Test: Nie można anulować subskrypcji innego providera
     */
    public function test_cannot_cancel_subscription_of_other_provider(): void
    {
        $other = User::factory()->create(['user_type' => User::TYPE_PROVIDER]);

        $subscription = Subscription::factory()->create([
            'user_id' => $other->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertForbidden();
    }

    /**
     * Test: Anulowanie już anulowanej subskrypcji zwraca 409
     */
    public function test_cancel_already_cancelled_subscription_returns_conflict(): void
    {
        $cancelledPlan = SubscriptionPlan::factory()->create(['slug' => 'cancelled-plan2-' . uniqid()]);

        $subscription = Subscription::factory()->create([
            'user_id' => $this->provider->id,
            'subscription_plan_id' => $cancelledPlan->id,
            'status' => 'cancelled',
            'cancelled_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertStatus(409);
    }
}
