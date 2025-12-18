<?php

namespace Database\Seeders;

use App\Models\CustomerProfile;
use App\Models\ProviderProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 5 Customers z różnymi poziomami kompletności profilu
        $this->createCustomer('Jan Kowalski', 'customer1@example.com', 0);    // 0% completeness
        $this->createCustomer('Anna Nowak', 'customer2@example.com', 25);      // 25% completeness
        $this->createCustomer('Piotr Wiśniewski', 'customer3@example.com', 50); // 50% completeness
        $this->createCustomer('Maria Wójcik', 'customer4@example.com', 75);    // 75% completeness
        $this->createCustomer('Krzysztof Kamiński', 'customer5@example.com', 100); // 100% completeness

        // 10 Providers marketplace z różnymi specjalizacjami
        $this->createProvider('Marek Hydraulik', 'hydraulik1@example.com', 4, 85, 'Warszawa');
        $this->createProvider('Andrzej Nowak - Elektryk', 'elektryk1@example.com', 5, 92, 'Kraków');
        $this->createProvider('Sprzątanie Express', 'sprzatanie1@example.com', 3, 68, 'Wrocław');
        $this->createProvider('Anna Korepetycje', 'korepetycje1@example.com', 2, 55, 'Poznań');
        $this->createProvider('Opieka Senior Care', 'opieka1@example.com', 5, 95, 'Gdańsk');
        $this->createProvider('Ogród Expert', 'ogrod1@example.com', 3, 72, 'Warszawa');
        $this->createProvider('Remont Budex', 'budowlane1@example.com', 4, 80, 'Łódź');
        $this->createProvider('IT Solutions Pro', 'it1@example.com', 2, 60, 'Katowice');
        $this->createProvider('Hydraulika 24/7', 'hydraulik2@example.com', 3, 70, 'Szczecin');
        $this->createProvider('Czysto i Szybko', 'sprzatanie2@example.com', 2, 45, 'Lublin');
    }

    /**
     * Utwórz admina z pełnymi uprawnieniami
     */
    private function createAdmin(): void
    {
        $admin = User::factory()->customer()->create([
            'name' => 'Admin System',
            'email' => 'admin@localservices.test',
            'password' => bcrypt('password'),
            'is_admin' => true,
            'profile_completion' => 100,
        ]);

        UserProfile::factory()->create(['user_id' => $admin->id]);
        CustomerProfile::factory()->create(['user_id' => $admin->id]);

        // Przypisanie ról administracyjnych
        $admin->assignRole(['admin', 'super_admin']);

        $this->command->info("✅ Admin utworzony: {$admin->email}");
    }

    /**

        // Przypisanie roli customer
        $user->assignRole('customer');
     * Utwórz customera z określonym poziomem kompletności
     */
    private function createCustomer(string $name, string $email, int $completeness): void
    {
        $user = User::factory()->customer()->create([
            'name' => $name,
            'email' => $email,
        ]);

        // Profil z określonym poziomem kompletności
        if ($completeness === 0) {
            UserProfile::factory()->empty()->create(['user_id' => $user->id]);
        } elseif ($completeness === 100) {
            UserProfile::factory()->complete()->create(['user_id' => $user->id]);
        } else {
            UserProfile::factory()->create([
                'user_id' => $user->id,
                'profile_completion_percentage' => $completeness,
            ]);
        }

        CustomerProfile::factory()->create(['user_id' => $user->id]);
    }

    /**
     * Utwórz providera z określonym verification level i trust score
     */
    private function createProvider(string $businessName, string $email, int $verificationLevel, int $trustScore, string $city = 'Warszawa'): void
    {
        $user = User::factory()->provider()->create([
            'name' => $businessName,
            'email' => $email,
            'city' => $city,
        ]);

        UserProfile::factory()->create(['user_id' => $user->id]);

        ProviderProfile::factory()->create([
            'user_id' => $user->id,
            'business_name' => $businessName,
            'verification_level' => $verificationLevel,
            'trust_score' => $trustScore,
            'id_verified' => $verificationLevel >= 2,
            'background_check_passed' => $verificationLevel >= 3,
        ]);

        // Przypisanie ról: provider może też być customerem!
        $user->assignRole(['customer', 'provider']);
    }
}
