<?php

namespace Tests\Feature\Api\V1\Profile;

use App\Enums\UserType;
use App\Models\CustomerProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UpgradeToProviderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Utwórz role przed testami
        Role::create(['name' => 'customer', 'guard_name' => 'web']);
        Role::create(['name' => 'provider', 'guard_name' => 'web']);
    }

    public function test_customer_can_upgrade_to_provider(): void
    {
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());
        $customer->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/profile/upgrade-to-provider', [
            'business_name' => 'Jan Kowalski Hydraulika',
            'service_description' => str_repeat('Profesjonalne usługi hydrauliczne. ', 3),
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Gratulacje! Jesteś teraz providerem. Możesz dodać pierwsze usługi.',
            ]);

        $customer->refresh();

        $this->assertTrue($customer->isProvider());
        $this->assertEquals(UserType::Provider, $customer->user_type);
        $this->assertTrue($customer->hasRole('provider'));

        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $customer->id,
            'business_name' => 'Jan Kowalski Hydraulika',
        ]);
    }

    public function test_provider_cannot_upgrade_again(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());

        Sanctum::actingAs($provider);

        $response = $this->postJson('/api/v1/profile/upgrade-to-provider', [
            'business_name' => 'Test',
            'service_description' => str_repeat('Opis wystarczająco długi. ', 3),
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Jesteś już providerem',
            ]);
    }

    public function test_upgrade_requires_mandatory_fields(): void
    {
        $customer = User::factory()->customer()->create();

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/profile/upgrade-to-provider', [
            'service_description' => 'Za krótki opis',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['business_name', 'service_description']);
    }
}
