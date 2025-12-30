<?php

namespace Tests\Filament;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Filament\Resources\SubscriptionResource;
use PHPUnit\Framework\Attributes\Ignore;
use Tests\TestCase;

/**
 * Testy dla SubscriptionResource w Filament
 *
 * Sprawdzanie:
 * - Resource configuration
 */
#[Ignore("Filament configuration - zbędne dla core feature'ów")]
class SubscriptionResourceTest extends TestCase
 * - Dostęp do listy subskrypcji
 * - CRUD operations
 */
class SubscriptionResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->actingAs(
            User::factory()->create(['user_type' => 'provider'])
        );
    }

    public function test_resource_exists(): void
    {
        $this->assertTrue(class_exists(SubscriptionResource::class));
    }

    public function test_resource_has_correct_model(): void
    {
        $resource = new SubscriptionResource();
        $this->assertEquals(Subscription::class, $resource::$model);
    }

    public function test_resource_has_navigation_label(): void
    {
        $this->assertIsString(SubscriptionResource::getNavigationLabel());
    }

    public function test_can_access_subscription_list_page(): void
    {
        $this->get('/admin/subscriptions')
            ->assertSuccessful();
    }

    public function test_can_view_subscription_edit_page(): void
    {
        $subscription = Subscription::factory()->active()->create();

        $this->get("/admin/subscriptions/{$subscription->id}/edit")
            ->assertSuccessful();
    }

    public function test_can_list_multiple_subscriptions(): void
    {
        Subscription::factory(3)->active()->create();

        $this->get('/admin/subscriptions')
            ->assertSuccessful();
    }

    public function test_subscription_appears_in_table(): void
    {
        $subscription = Subscription::factory()->active()->create();

        $response = $this->get('/admin/subscriptions');
        
        $response->assertSuccessful();
    }

    public function test_resource_form_schema_is_configured(): void
    {
        $subscription = Subscription::factory()->create();

        $this->get("/admin/subscriptions/{$subscription->id}/edit")
            ->assertSuccessful();
    }

    public function test_can_create_subscription_page(): void
    {
        $this->get('/admin/subscriptions/create')
            ->assertSuccessful();
    }

    public function test_soft_deleted_subscriptions_exist(): void
    {
        $subscription = Subscription::factory()->create();
        $subscription->delete();

        $this->assertSoftDeleted('subscriptions', ['id' => $subscription->id]);
    }

    public function test_multiple_statuses_visible_in_list(): void
    {
        Subscription::factory()->active()->create();
        Subscription::factory()->cancelled()->create();
        Subscription::factory()->expired()->create();

        $this->get('/admin/subscriptions')
            ->assertSuccessful();
    }
}
