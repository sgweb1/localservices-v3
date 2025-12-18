<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Database\Seeder;

/**
 * Seeder płatności / transakcji
 */
class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subscriptions = Subscription::active()->get();

        // Płatności za subskrypcje TYLKO
        foreach ($subscriptions as $subscription) {
            // 1-3 płatności historyczne + 1 aktualna
            $paymentsCount = rand(1, 3);
            for ($i = 0; $i <= $paymentsCount; $i++) {
                $isPaid = $i < $paymentsCount; // Ostatnia może być pending
                $daysAgo = $i * 30 + rand(1, 5);

                Payment::create([
                    'user_id' => $subscription->user_id,
                    'subscription_id' => $subscription->id,
                    'booking_id' => null, // NO booking payments
                    'payment_method' => fake()->randomElement(['credit_card', 'bank_transfer', 'stripe']),
                    'payment_type' => 'subscription',
                    'amount' => $subscription->billing_period === 'monthly'
                        ? $subscription->plan->price_monthly
                        : $subscription->plan->price_yearly,
                    'currency' => 'PLN',
                    'status' => $isPaid ? 'completed' : 'pending',
                    'transaction_id' => $isPaid ? 'txn_' . fake()->bothify('############') : null,
                    'reference' => 'SUB-' . $subscription->id . '-' . ($paymentsCount - $i),
                    'metadata' => [
                        'subscription_id' => $subscription->id,
                        'plan_name' => $subscription->plan->name,
                    ],
                    'completed_at' => $isPaid ? now()->subDays($daysAgo) : null,
                ]);
            }
        }

        $this->command->info('Płatności: ' . Payment::count() . ' utworzono');
    }
}
