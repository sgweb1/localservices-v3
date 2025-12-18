<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

/**
 * Seeder planów subskrypcji
 */
class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'description' => 'Idealny dla początkujących providerów',
                'price_monthly' => 29.99,
                'price_yearly' => 299.99,
                'max_services' => 3,
                'max_bookings_per_month' => 20,
                'featured_listing' => false,
                'priority_support' => false,
                'analytics_dashboard' => false,
                'features' => ['Profil providera', 'Do 3 usług', 'Podstawowa chat'],
                'display_order' => 1,
            ],
            [
                'name' => 'Professional',
                'description' => 'Dla aktywnych providerów szukających wzrostu',
                'price_monthly' => 79.99,
                'price_yearly' => 799.99,
                'max_services' => 10,
                'max_bookings_per_month' => null, // unlimited
                'featured_listing' => true,
                'priority_support' => true,
                'analytics_dashboard' => true,
                'features' => ['Profil providera', 'Do 10 usług', 'Featured na głównej', 'Priorytetowe wsparcie', 'Podstawowa analityka', 'Certyfikaty i portfolio'],
                'display_order' => 2,
            ],
            [
                'name' => 'Premium',
                'description' => 'Dla profesjonalnych firm z pełnym dostępem',
                'price_monthly' => 199.99,
                'price_yearly' => 1999.99,
                'max_services' => 50,
                'max_bookings_per_month' => null, // unlimited
                'featured_listing' => true,
                'priority_support' => true,
                'analytics_dashboard' => true,
                'features' => ['Profil providera', 'Unlimited usług', 'Premium featured placement', '24/7 wsparcie', 'Zaawansowana analityka', 'API dostęp', 'Booking automatio', 'Custom branding'],
                'display_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }

        $this->command->info('Plany: ' . SubscriptionPlan::count() . ' utworzono');
    }
}
