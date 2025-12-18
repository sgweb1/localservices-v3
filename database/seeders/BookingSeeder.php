<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder rezerwacji (zaadaptowany z LocalServices)
 */
class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::role('customer')->get();
        $providers = User::role('provider')->get();
        $services = Service::active()->get();

        if ($customers->isEmpty() || $providers->isEmpty() || $services->isEmpty()) {
            $this->command->warn('⚠ Brak danych. Uruchom UserSeeder i ServiceSeeder.');
            return;
        }

        $this->command->info('🔄 Tworzenie bookings...');
        $created = $this->createBookings($customers, $providers, $services);
        
        $this->command->info('🔄 Tworzenie booking requests...');
        $createdReq = $this->createRequests($customers, $providers, $services);

        $this->command->info("✅ Bookings: {$created}, Requests: {$createdReq}");
    }

    private function createBookings($customers, $providers, $services): int
    {
        $templates = [
            ['status' => 'confirmed', 'days' => 5],
            ['status' => 'confirmed', 'days' => 3],
            ['status' => 'completed', 'days' => -5],
            ['status' => 'completed', 'days' => -10],
            ['status' => 'cancelled', 'days' => 2],
        ];

        $created = 0;
        foreach ($templates as $t) {
            $service = $services->random();
            $price = $service->base_price ?? 200;
            
            Booking::create([
                'customer_id' => $customers->random()->id,
                'provider_id' => $providers->random()->id,
                'service_id' => $service->id,
                'booking_date' => now()->addDays($t['days']),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'duration_minutes' => 120,
                'service_address' => 'ul. Testowa ' . rand(1, 100),
                'latitude' => 52.23,
                'longitude' => 21.01,
                'distance_km' => 10,
                'service_price' => $price,
                'travel_fee' => 20,
                'platform_fee' => $price * 0.1,
                'total_price' => $price + 20 + ($price * 0.1),
                'currency' => 'PLN',
                'payment_status' => $t['status'] === 'completed' ? 'paid' : 'pending',
                'status' => $t['status'],
                'confirmed_at' => now()->subDay(),
                'completed_at' => $t['status'] === 'completed' ? now()->addDays($t['days'])->addHours(2) : null,
            ]);
            $created++;
        }
        return $created;
    }

    private function createRequests($customers, $providers, $services): int
    {
        $templates = [
            ['status' => 'pending', 'desc' => 'Naprawa instalacji'],
            ['status' => 'quoted', 'desc' => 'Remont łazienki', 'price' => 300],
            ['status' => 'accepted', 'desc' => 'Montaż klimatyzacji', 'price' => 400],
        ];

        $created = 0;
        foreach ($templates as $t) {
            $data = [
                'customer_id' => $customers->random()->id,
                'provider_id' => $providers->random()->id,
                'service_id' => $services->random()->id,
                'description' => $t['desc'],
                'service_address' => 'ul. Testowa ' . rand(1, 100),
                'latitude' => 52.23,
                'longitude' => 21.01,
                'preferred_date' => now()->addDays(7),
                'preferred_time' => '10:00',
                'budget_min' => 150,
                'budget_max' => 500,
                'status' => $t['status'],
            ];

            if (isset($t['price'])) {
                $data['quoted_price'] = $t['price'];
                $data['quote_details'] = 'Wycena podstawowa';
                $data['quote_valid_until'] = now()->addDays(7);
                $data['quoted_at'] = now()->subDay();
            }

            if ($t['status'] === 'accepted') {
                $data['accepted_at'] = now()->subHours(12);
            }

            BookingRequest::create($data);
            $created++;
        }
        return $created;
    }
}
