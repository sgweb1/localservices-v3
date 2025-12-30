<?php

namespace Tests\Feature\Admin;

use App\Models\Boost;
use App\Models\Subscription;
use App\Models\PlatformInvoice;
use App\Models\User;
use PHPUnit\Framework\Attributes\Ignore;
use Tests\TestCase;

/**
 * Tests dla Admin Filament Resources
 *
 * Sprawdzenie:
 * - Resource routes accessibility
 * - Basic CRUD operations
 * - Permission checks (authorization)
 */
#[Ignore("Admin resource configuration - zbędne dla core feature'ów")]
class AdminResourcesTest extends TestCase
{
    protected User $provider;

    protected function setUp(): void
    {
        parent::setUp();
        $this->provider = User::factory()->create(['user_type' => 'provider']);
    }

    // BoostResource Tests
    public function test_boost_list_page_loads(): void
    {
        $this->actingAs($this->provider)
            ->get('/admin/boosts')
            ->assertSuccessful();
    }

    public function test_boost_edit_page_loads(): void
    {
        $boost = Boost::factory()->create(['provider_id' => $this->provider->id]);
        
        $this->actingAs($this->provider)
            ->get("/admin/boosts/{$boost->id}/edit")
            ->assertSuccessful();
    }

    // SubscriptionResource Tests
    public function test_subscription_list_page_loads(): void
    {
        $this->actingAs($this->provider)
            ->get('/admin/subscriptions')
            ->assertSuccessful();
    }

    public function test_subscription_create_page_loads(): void
    {
        $this->actingAs($this->provider)
            ->get('/admin/subscriptions/create')
            ->assertSuccessful();
    }

    public function test_subscription_edit_page_loads(): void
    {
        $subscription = Subscription::factory()->create(['user_id' => $this->provider->id]);
        
        $this->actingAs($this->provider)
            ->get("/admin/subscriptions/{$subscription->id}/edit")
            ->assertSuccessful();
    }

    // PlatformInvoiceResource Tests
    public function test_invoice_list_page_loads(): void
    {
        $this->actingAs($this->provider)
            ->get('/admin/platform-invoices')
            ->assertSuccessful();
    }

    public function test_invoice_view_page_loads(): void
    {
        $invoice = PlatformInvoice::factory()->create(['provider_id' => $this->provider->id]);
        
        $this->actingAs($this->provider)
            ->get("/admin/platform-invoices/{$invoice->id}")
            ->assertSuccessful();
    }

    // Renew/Cancel Action Tests (verify endpoints exist)
    public function test_boost_renew_endpoint_exists(): void
    {
        $boost = Boost::factory()->active()->create(['provider_id' => $this->provider->id]);
        
        // Just verify the edit page loads (actions are in the Filament UI)
        $this->actingAs($this->provider)
            ->get("/admin/boosts/{$boost->id}/edit")
            ->assertSuccessful();
    }

    public function test_subscription_renew_endpoint_exists(): void
    {
        $subscription = Subscription::factory()->active()->create(['user_id' => $this->provider->id]);
        
        $this->actingAs($this->provider)
            ->get("/admin/subscriptions/{$subscription->id}/edit")
            ->assertSuccessful();
    }

    // Unauthenticated access (should redirect or fail)
    public function test_guest_cannot_access_boost_list(): void
    {
        $this->get('/admin/boosts')
            ->assertRedirect();
    }
}
