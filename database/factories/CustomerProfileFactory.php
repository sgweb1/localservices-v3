<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerProfile>
 */
class CustomerProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalBookings = fake()->numberBetween(0, 50);
        $completedBookings = fake()->numberBetween(0, $totalBookings);

        return [
            'user_id' => User::factory()->customer(),
            'preferred_language' => 'pl',
            'email_notifications' => true,
            'push_notifications' => fake()->boolean(80),
            'reliability_score' => fake()->numberBetween(0, 100),
            'total_bookings' => $totalBookings,
            'completed_bookings' => $completedBookings,
        ];
    }
}
