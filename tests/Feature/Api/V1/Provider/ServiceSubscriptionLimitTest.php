<?php

namespace Tests\Feature\Api\V1\Provider;

use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceSubscriptionLimitTest extends TestCase
{
    use RefreshDatabase;

    private User $provider;
    private ServiceCategory $category;
    private Location $location;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('provider.limits.max_active_services', 2);

        $this->provider = User::factory()->provider()->create();
        $this->category = ServiceCategory::factory()->create();
        $this->location = Location::factory()->create();

        Sanctum::actingAs($this->provider);
    }

    public function test_cannot_create_active_service_when_limit_reached(): void
    {
        // Stwórz już 2 aktywne usługi
        Service::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'active',
        ]);

        $payload = [
            'title' => 'Nowa usługa',
            'description' => str_repeat('Opis ', 20),
            'category_id' => $this->category->id,
            'pricing_type' => 'fixed',
            'base_price' => 100,
        ];

        $res = $this->postJson("/api/v1/providers/{$this->provider->id}/services", $payload);

        $res->assertStatus(422)
            ->assertJson(['error' => 'Osiągnięto limit aktywnych usług dla Twojego planu']);
    }

    public function test_cannot_activate_via_toggle_when_limit_reached(): void
    {
        // 2 aktywne już istnieją
        Service::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'active',
        ]);

        // Trzecia wstrzymana
        $paused = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => 'paused',
        ]);

        $res = $this->postJson("/api/v1/providers/{$this->provider->id}/services/{$paused->id}/toggle-status");
        $res->assertStatus(422)
            ->assertJson(['error' => 'Osiągnięto limit aktywnych usług dla Twojego planu']);
    }
}
