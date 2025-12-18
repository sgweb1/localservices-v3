<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProviderProfile>
 */
class ProviderProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessTypes = [
            'Hydraulik 24/7',
            'Elektryk Profesjonalny',
            'Sprzątanie Premium',
            'Korepetycje Matematyka',
            'Opieka Seniora',
        ];

        return [
            'user_id' => User::factory()->provider(),
            'business_name' => fake()->randomElement($businessTypes),
            'service_description' => fake()->paragraph(4),
            'website_url' => fake()->optional()->url(),
            'social_media' => [
                'facebook' => fake()->optional()->url(),
                'instagram' => fake()->optional()->url(),
            ],
            'subdomain' => null,
            'trust_score' => fake()->numberBetween(0, 100),
            'verification_level' => fake()->numberBetween(1, 5),
            'id_verified' => fake()->boolean(50),
            'background_check_passed' => fake()->boolean(30),
        ];
    }

    /**
     * Provider z pełną weryfikacją (Level 5)
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'trust_score' => fake()->numberBetween(70, 100),
            'verification_level' => 5,
            'id_verified' => true,
            'background_check_passed' => true,
        ]);
    }

    /**
     * Provider nieweryfikowany (Level 1)
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'trust_score' => fake()->numberBetween(0, 30),
            'verification_level' => 1,
            'id_verified' => false,
            'background_check_passed' => false,
        ]);
    }
}
