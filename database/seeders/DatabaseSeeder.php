<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            ServiceCategorySeeder::class,
            LocationSeeder::class,
            UserSeeder::class,
            ServiceSeeder::class,
            AvailabilitySeeder::class,
            BookingSeeder::class,
            ReviewSeeder::class,
            ChatSeeder::class,
            VerificationSeeder::class,
            CertificationSeeder::class,
            PortfolioSeeder::class,
            PortfolioCommentSeeder::class,
            SubscriptionPlanSeeder::class,
            SubscriptionSeeder::class,
            PaymentSeeder::class,
            InvoiceSeeder::class,
            AnalyticsSeeder::class,
        ]);
    }
}
