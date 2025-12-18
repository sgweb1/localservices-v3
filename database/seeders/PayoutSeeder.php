<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder wypłat dla providerów
 */
class PayoutSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = User::role('provider')->get();
        $payoutCounter = 1;

        foreach ($providers as $provider) {
            // Pobierz wszystkie completed bookings dla tego providera
            $allCompletedBookings = $provider->bookingsAsProvider()
                ->where('status', 'completed')
                ->get();

            if ($allCompletedBookings->isEmpty()) {
                continue;
            }

            // 60% providerów z completed bookings ma wypłatę
            if (rand(1, 100) <= 60) {
                // 1-3 wypłaty w historii
                $payoutsCount = rand(1, 3);
                $bookingsPerPayout = max(1, intdiv($allCompletedBookings->count(), $payoutsCount));

                for ($i = 0; $i < $payoutsCount; $i++) {
                    $isCompleted = $i < $payoutsCount - 1; // Ostatnia może być pending
                    $daysAgo = $i * 30 + rand(1, 10);

                    // Pobierz bookings dla tej wypłaty
                    $completedBookings = $allCompletedBookings
                        ->skip($i * $bookingsPerPayout)
                        ->take($bookingsPerPayout);

                    $totalAmount = 0;
                    foreach ($completedBookings as $booking) {
                        if ($booking->service) {
                            $totalAmount += $booking->service->base_price ?? 0;
                        }
                    }

                    if ($totalAmount === 0) {
                        continue;
                    }

                    $platformFee = $totalAmount * 0.10; // 10% prowizji
                    $netAmount = $totalAmount - $platformFee;

                    $payoutNumber = 'PAYOUT-' . date('Y') . '-' . str_pad($payoutCounter, 5, '0', STR_PAD_LEFT);
                    $payoutCounter++;

                    $requestedAt = now()->subDays($daysAgo);

                    Payout::create([
                        'user_id' => $provider->id,
                        'payout_number' => $payoutNumber,
                        'status' => $isCompleted ? 'completed' : 'pending',
                        'payout_method' => fake()->randomElement(['bank_transfer', 'paypal']),
                        'amount' => $totalAmount,
                        'currency' => 'PLN',
                        'platform_fee' => $platformFee,
                        'net_amount' => $netAmount,
                        'description' => 'Wypłata za ' . $completedBookings->count() . ' usług',
                        'requested_at' => $requestedAt,
                        'approved_at' => $isCompleted ? $requestedAt->addHours(2) : null,
                        'processed_at' => $isCompleted ? $requestedAt->addHours(24) : null,
                        'transaction_id' => $isCompleted ? 'bank_' . fake()->bothify('##############') : null,
                        'payment_count' => $completedBookings->count(),
                        'payment_ids' => $completedBookings->pluck('id')->toArray(),
                    ]);
                }
            }
        }

        $this->command->info('Wypłaty: ' . Payout::count() . ' utworzono');
    }
}
