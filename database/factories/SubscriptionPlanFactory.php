<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    public function definition(): array
    {
        $name = fake()->randomElement(['Basic', 'Standard', 'Pro', 'Elite']);

        return [
            'name' => $name,
            'slug' => strtolower($name) . '-' . uniqid(),
            'description' => fake()->sentence(),
            'price_monthly' => fake()->randomElement([49.99, 79.99, 129.99, 249.99]),
            'price_yearly' => fake()->randomElement([499.99, 799.99, 1299.99, 2499.99]),
            'max_services' => fake()->numberBetween(5, 20),
            'max_bookings_per_month' => null,
            'featured_listing' => fake()->boolean(),
            'priority_support' => fake()->boolean(),
            'analytics_dashboard' => fake()->boolean(),
            'features' => ['test'],
            'is_active' => true,
            'display_order' => 0,
        ];
    }

    /**
     * Plan aktywny
     */
    public function active(): static
    {
        return $this->state([
            'is_active' => true,
        ]);
    }

    /**
     * Plan nieaktywny
     */
    public function inactive(): static
    {
        return $this->state([
            'is_active' => false,
        ]);
    }
}
