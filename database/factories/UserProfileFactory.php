<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->numerify('+48 ### ### ###'),
            'phone_country_code' => '+48',
            'bio' => fake()->paragraph(5), // Długi bio (>50 znaków)
            'city' => fake()->randomElement(['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk']),
            'address' => fake()->streetAddress(),
            'latitude' => fake()->latitude(49, 55),
            'longitude' => fake()->longitude(14, 24),
            'preferred_language' => 'pl',
            'timezone' => 'Europe/Warsaw',
            'languages' => ['pl'],
            'profile_completion_percentage' => fake()->numberBetween(0, 100),
            'is_profile_public' => true,
        ];
    }

    /**
     * Profil niepełny (0% completeness)
     */
    public function empty(): static
    {
        return $this->state(fn (array $attributes) => [
            'first_name' => null,
            'last_name' => null,
            'phone' => null,
            'bio' => null,
            'address' => null,
            'latitude' => null,
            'longitude' => null,
            'profile_completion_percentage' => 0,
        ]);
    }

    /**
     * Profil kompletny (100% completeness)
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->numerify('+48 ### ### ###'),
            'bio' => fake()->paragraph(10), // Długi bio
            'address' => fake()->streetAddress(),
            'latitude' => fake()->latitude(49, 55),
            'longitude' => fake()->longitude(14, 24),
            'avatar_url' => 'avatars/1/1/avatar_1_1234567890_abc.jpg',
            'profile_completion_percentage' => 100,
        ]);
    }
}
