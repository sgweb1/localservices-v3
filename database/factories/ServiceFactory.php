<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory dla modelu Service
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    /**
     * Defini the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->words(3, true);
        
        return [
            'uuid' => Str::uuid(),
            'provider_id' => User::factory(),
            'location_id' => Location::factory(),
            'category_id' => \App\Models\ServiceCategory::factory(),
            'title' => ucfirst($title),
            'slug' => Str::slug($title . '-' . fake()->randomNumber(5)),
            'description' => fake()->paragraphs(3, true),
            'what_included' => fake()->paragraph(),
            'pricing_type' => fake()->randomElement(['hourly', 'fixed', 'quote']),
            'base_price' => fake()->randomFloat(2, 50, 500),
            'price_range_low' => null,
            'price_range_high' => null,
            'price_currency' => 'PLN',
            'pricing_unit' => 'godzina',
            'instant_booking' => fake()->boolean(30),
            'accepts_quote_requests' => true,
            'min_notice_hours' => 24,
            'max_advance_days' => 90,
            'duration_minutes' => fake()->randomElement([60, 90, 120, 180]),
            'service_locations' => null,
            'latitude' => fake()->latitude(49, 55),
            'longitude' => fake()->longitude(14, 24),
            'max_distance_km' => 20,
            'willing_to_travel' => true,
            'travel_fee_per_km' => fake()->randomFloat(2, 0, 5),
            'requirements' => null,
            'tools_provided' => null,
            'cancellation_policy' => fake()->sentence(),
            'rating_average' => 0.00,
            'reviews_count' => 0,
            'bookings_count' => 0,
            'views_count' => 0,
            'last_booked_at' => null,
            'status' => 'active',
            'is_featured' => false,
            'is_promoted' => false,
            'promoted_until' => null,
            'rejection_reason' => null,
            'moderated_by' => null,
            'moderated_at' => null,
            'meta_title' => null,
            'meta_description' => null,
            'published_at' => now(),
        ];
    }

    /**
     * Usługa z natychmiastową rezerwacją
     */
    public function instantBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'instant_booking' => true,
        ]);
    }

    /**
     * Usługa wyceniana wg godzin
     */
    public function hourly(): static
    {
        return $this->state(fn (array $attributes) => [
            'pricing_type' => 'hourly',
            'base_price' => fake()->randomFloat(2, 50, 200),
            'pricing_unit' => 'godzina',
        ]);
    }

    /**
     * Usługa z ceną stałą
     */
    public function fixed(): static
    {
        return $this->state(fn (array $attributes) => [
            'pricing_type' => 'fixed',
            'base_price' => fake()->randomFloat(2, 100, 1000),
            'pricing_unit' => 'usługa',
        ]);
    }

    /**
     * Usługa wymagająca wyceny
     */
    public function quote(): static
    {
        return $this->state(fn (array $attributes) => [
            'pricing_type' => 'quote',
            'base_price' => null,
        ]);
    }

    /**
     * Usługa w statusie aktywna
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'published_at' => now(),
        ]);
    }

    /**
     * Usługa w statusie draft
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Usługa promowana
     */
    public function promoted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_promoted' => true,
            'promoted_until' => now()->addDays(30),
        ]);
    }
}
