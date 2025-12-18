<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder subskrypcji dla providerów
 */
class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = User::role('provider')->get();
        $plans = SubscriptionPlan::all();

        foreach ($providers as $provider) {
            // 85% providerów ma aktywną subskrypcję
            if (rand(1, 100) <= 85) {
                $plan = $plans->random();
                $billingPeriod = rand(1, 100) <= 70 ? 'monthly' : 'yearly';
                $durationMonths = $billingPeriod === 'monthly' ? 1 : 12;

                $startedAt = now()->subMonths(rand(1, 12));
                $endsAt = $startedAt->copy()->addMonths($durationMonths);
                $renewsAt = $endsAt->copy();

                Subscription::create([
                    'user_id' => $provider->id,
                    'subscription_plan_id' => $plan->id,
                    'billing_period' => $billingPeriod,
                    'status' => rand(1, 100) <= 85 ? 'active' : 'paused',
                    'started_at' => $startedAt,
                    'ends_at' => $endsAt,
                    'renews_at' => $renewsAt,
                    'cancelled_at' => null,
                    'paused_at' => rand(1, 100) <= 10 ? now()->subDays(rand(1, 30)) : null,
                    'auto_renew' => 1,
                ]);
            }
        }

        $this->command->info('Subskrypcje: ' . Subscription::count() . ' utworzono');
    }
}
