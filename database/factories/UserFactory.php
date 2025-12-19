<?php

namespace Database\Factories;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'name' => 'Jan Kowalski',
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'user_type' => UserType::Provider->value,
            'phone' => fake()->numerify('+48 ### ### ###'),
            'bio' => fake()->paragraph(3),
            'city' => fake()->randomElement(['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk']),
            'address' => fake()->streetAddress(),
            'latitude' => fake()->latitude(49, 55),
            'longitude' => fake()->longitude(14, 24),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user is a customer.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => UserType::Customer->value,
        ]);
    }

    /**
     * Indicate that the user is a provider.
     */
    public function provider(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => UserType::Provider->value,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
