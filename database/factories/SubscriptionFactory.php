<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        $billingPeriod = fake()->randomElement(['monthly', 'yearly']);
        $startedAt = now()->subDays(fake()->numberBetween(1, 30));
        $endsAt = $billingPeriod === 'monthly'
            ? $startedAt->copy()->addMonth()
            : $startedAt->copy()->addYear();

        return [
            'user_id' => User::factory()->create(['user_type' => 'provider'])->id,
            'subscription_plan_id' => SubscriptionPlan::factory()->create()->id,
            'billing_period' => $billingPeriod,
            'status' => 'active',
            'started_at' => $startedAt,
            'ends_at' => $endsAt,
            'renews_at' => $endsAt->copy()->subDays(7),
            'cancelled_at' => null,
            'auto_renew' => true,
        ];
    }

    /**
     * Subskrypcja aktywna
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'active',
                'ends_at' => now()->addDays(30),
                'cancelled_at' => null,
            ];
        });
    }

    /**
     * Subskrypcja anulowana
     */
    public function cancelled(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'auto_renew' => false,
            ];
        });
    }

    /**
     * Subskrypcja wygasła
     */
    public function expired(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'expired',
                'ends_at' => now()->subDay(),
            ];
        });
    }
}
