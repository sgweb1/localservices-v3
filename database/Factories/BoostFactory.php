<?php

namespace Database\Factories;

use App\Models\Boost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoostFactory extends Factory
{
    protected $model = Boost::class;

    public function definition(): array
    {
        return [
            'provider_id' => User::factory(),
            'type' => $this->faker->randomElement(['city_boost', 'profile_boost']),
            'city' => $this->faker->city(),
            'is_active' => true,
            'expires_at' => now()->addDays(7),
            'price' => $this->faker->randomFloat(2, 9.99, 99.99),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'expires_at' => now()->subDay(),
        ]);
    }
}
