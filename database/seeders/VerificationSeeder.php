<?php

namespace Database\Seeders;

use App\Models\Verification;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder weryfikacji dla użytkowników
 */
class VerificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = User::role('provider')->get();
        $adminUser = User::role('admin')->first() ?? User::first();

        foreach ($providers as $provider) {
            // Każdy provider ma weryfikację tożsamości
            Verification::create([
                'user_id' => $provider->id,
                'type' => 'identity',
                'value' => fake()->bothify('##-###-##-##'),
                'metadata' => [
                    'document_type' => 'identity_card',
                    'country' => 'PL',
                    'expiry_year' => fake()->numberBetween(2024, 2030),
                ],
                'document_path' => 'verifications/identity/' . fake()->bothify('###.pdf'),
                'status' => 'verified',
                'verified_at' => now()->subDays(rand(30, 180)),
                'verified_by' => $adminUser->id,
                'expires_at' => now()->addYears(2),
            ]);

            // 70% ma weryfikację numeru telefonu
            if (rand(1, 100) <= 70) {
                Verification::create([
                    'user_id' => $provider->id,
                    'type' => 'phone',
                    'value' => $provider->phone ?? '+48' . fake()->numerify('##########'),
                    'metadata' => [
                        'country_code' => '+48',
                        'verified_via_sms' => true,
                    ],
                    'status' => 'verified',
                    'verified_at' => now()->subDays(rand(10, 90)),
                    'verified_by' => $adminUser->id,
                    'expires_at' => null,
                ]);
            }

            // 40% ma weryfikację e-mail
            if (rand(1, 100) <= 40) {
                Verification::create([
                    'user_id' => $provider->id,
                    'type' => 'email',
                    'value' => $provider->email,
                    'metadata' => [
                        'verified_via_email_link' => true,
                    ],
                    'status' => 'verified',
                    'verified_at' => now()->subDays(rand(1, 30)),
                    'verified_by' => $adminUser->id,
                    'expires_at' => null,
                ]);
            }

            // 30% ma weryfikację konta bankowego
            if (rand(1, 100) <= 30) {
                $status = rand(1, 100) <= 80 ? 'verified' : 'pending';
                Verification::create([
                    'user_id' => $provider->id,
                    'type' => 'bank_account',
                    'value' => fake()->bothify('## #### #### #### ####'),
                    'metadata' => [
                        'bank_name' => fake()->randomElement(['PKO BP', 'ING', 'mBank', 'Santander', 'Alior']),
                        'account_holder' => $provider->name,
                    ],
                    'document_path' => $status === 'verified' ? 'verifications/bank/' . fake()->bothify('###.pdf') : null,
                    'status' => $status,
                    'verified_at' => $status === 'verified' ? now()->subDays(rand(10, 60)) : null,
                    'verified_by' => $status === 'verified' ? $adminUser->id : null,
                    'expires_at' => null,
                ]);
            }
        }

        $this->command->info('Weryfikacje: ' . Verification::count() . ' utworzono');
    }
}
