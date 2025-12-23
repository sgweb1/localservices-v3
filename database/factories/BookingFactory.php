<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory do tworzenia testowych rezerwacji
 *
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $bookingDate = fake()->dateTimeBetween('-30 days', '+30 days');
        $startTime = fake()->time();
        $duration = fake()->randomElement([60, 90, 120, 180, 240]);

        // Calculate end time
        $start = \Carbon\Carbon::parse($startTime);
        $endTime = $start->copy()->addMinutes($duration)->format('H:i:s');

        $servicePrice = fake()->randomFloat(2, 100, 500);
        $travelFee = fake()->randomFloat(2, 0, 50);
        $platformFee = 0; // Brak prowizji - model subskrypcyjny
        $totalPrice = $servicePrice + $travelFee + $platformFee;

        return [
            'uuid' => Str::uuid(),
            'booking_number' => 'BK-'.date('Y').'-'.str_pad(fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'customer_id' => User::factory(),
            'provider_id' => User::factory(),
            'service_id' => Service::factory(),
            'booking_date' => $bookingDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration_minutes' => $duration,
            'service_address' => fake()->streetAddress() . ', ' . fake()->city(),
            'latitude' => fake()->latitude(49, 54),
            'longitude' => fake()->longitude(14, 24),
            'distance_km' => fake()->randomFloat(2, 1, 50),
            'service_price' => $servicePrice,
            'travel_fee' => $travelFee,
            'platform_fee' => $platformFee,
            'total_price' => $totalPrice,
            'currency' => 'PLN',
            'payment_status' => 'pending',
            'payment_method' => fake()->randomElement(['cash', 'card', 'transfer', 'online']),
            'paid_at' => null,
            'payment_reference' => null,
            'status' => 'confirmed', // Instant booking - confirmed od razu
            'cancelled_by' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'cancellation_fee' => null,
            'customer_notes' => fake()->optional()->sentence(),
            'provider_notes' => null,
            'admin_notes' => null,
            'special_requirements' => null,
            'confirmed_at' => now(),
            'started_at' => null,
            'completed_at' => null,
            'customer_reviewed' => false,
            'provider_reviewed' => false,
        ];
    }

    /**
     * Stan: rezerwacja zakończona
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'confirmed_at' => now()->subDays(rand(8, 14)),
            'started_at' => now()->subDays(rand(2, 7)),
            'completed_at' => now()->subDays(rand(1, 7)),
            'payment_status' => 'paid',
            'paid_at' => now()->subDays(rand(2, 7)),
        ]);
    }

    /**
     * Stan: rezerwacja anulowana
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now()->subDays(rand(1, 3)),
            'cancellation_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Stan: rezerwacja w trakcie realizacji
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'started_at' => now()->subHours(rand(1, 3)),
        ]);
    }
}
