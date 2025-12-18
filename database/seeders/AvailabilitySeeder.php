<?php

namespace Database\Seeders;

use App\Models\Availability;
use App\Models\AvailabilityException;
use App\Models\Location;
use App\Models\ServiceArea;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder dostępności providerów
 */
class AvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $providers = User::role('provider')->get();
        $locations = Location::all();

        if ($providers->isEmpty()) {
            $this->command->warn('⚠ Brak providerów.');
            return;
        }

        $this->command->info('🔄 Tworzenie dostępności...');
        $availabilities = 0;
        $areas = 0;

        foreach ($providers as $provider) {
            // Godziny pracy (pon-piątek 9-17, sobota 9-13)
            $schedule = [
                ['day' => 1, 'start' => '09:00', 'end' => '17:00'], // Poniedziałek
                ['day' => 2, 'start' => '09:00', 'end' => '17:00'], // Wtorek
                ['day' => 3, 'start' => '09:00', 'end' => '17:00'], // Środa
                ['day' => 4, 'start' => '09:00', 'end' => '17:00'], // Czwartek
                ['day' => 5, 'start' => '09:00', 'end' => '17:00'], // Piątek
                ['day' => 6, 'start' => '09:00', 'end' => '13:00'], // Sobota
            ];

            foreach ($schedule as $slot) {
                Availability::create([
                    'provider_id' => $provider->id,
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'max_bookings' => rand(3, 8),
                    'break_time_start' => '12:00',
                    'break_time_end' => '13:00',
                    'is_available' => true,
                ]);
                $availabilities++;
            }

            // Obszary serwisu (1-2 miasta)
            $locationsToUse = $locations->random(min(2, $locations->count()));
            foreach ($locationsToUse as $location) {
                // Losowe współrzędne blisko miasta
                $baseLat = 52.2297; // Warszawa
                $baseLng = 21.0122;

                ServiceArea::create([
                    'provider_id' => $provider->id,
                    'location_id' => $location->id,
                    'name' => $location->name . ' - ' . rand(1, 5) . ' km',
                    'latitude' => $baseLat + (rand(-20, 20) / 1000),
                    'longitude' => $baseLng + (rand(-20, 20) / 1000),
                    'radius_km' => rand(5, 25),
                    'travel_fee_per_km' => rand(2, 5),
                    'min_travel_fee' => rand(15, 40),
                    'is_active' => true,
                ]);
                $areas++;
            }

            // 20% providerów ma wyjątek dostępności (urlop)
            if (rand(1, 100) <= 20) {
                AvailabilityException::create([
                    'provider_id' => $provider->id,
                    'start_date' => now()->addDays(rand(10, 30)),
                    'end_date' => now()->addDays(rand(35, 50)),
                    'reason' => ['vacation', 'sick_leave', 'maintenance'][rand(0, 2)],
                    'description' => 'Planowana niedostępność',
                    'is_approved' => true,
                    'approved_at' => now(),
                ]);
            }
        }

        $this->command->info("✅ Dostępności: {$availabilities} utworzono");
        $this->command->info("✅ Obszary serwisu: {$areas} utworzono");
    }
}
