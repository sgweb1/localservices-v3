<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory dla modelu Location
 *
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->city();
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'latitude' => $this->faker->latitude(49, 55),  // Polska: 49-55°N
            'longitude' => $this->faker->longitude(14, 24), // Polska: 14-24°E
            'region' => $this->faker->randomElement([
                'mazowieckie',
                'małopolskie',
                'dolnośląskie',
                'wielkopolskie',
                'pomorskie',
                'łódzkie',
                'śląskie',
                'zachodniopomorskie',
            ]),
            'population' => $this->faker->numberBetween(50000, 2000000),
            'is_major_city' => $this->faker->boolean(30), // 30% szans na major city
        ];
    }

    /**
     * State: major city
     */
    public function majorCity(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_major_city' => true,
            'population' => $this->faker->numberBetween(300000, 2000000),
        ]);
    }

    /**
     * State: small city
     */
    public function smallCity(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_major_city' => false,
            'population' => $this->faker->numberBetween(10000, 100000),
        ]);
    }
}
