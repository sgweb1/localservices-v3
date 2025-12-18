<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeder dla ról i uprawnień w systemie LocalServices.
 *
 * System ról:
 * - customer: Każdy użytkownik domyślnie (może rezerwować usługi)
 * - provider: Użytkownik z ProviderProfile (może świadczyć usługi)
 * - admin: Administrator platformy
 * - super_admin: Super administrator (pełny dostęp)
 * - ops_manager: Manager operacyjny
 * - finance: Dział finansowy
 * - support: Wsparcie techniczne
 *
 * Każdy użytkownik może mieć WIELE ról jednocześnie!
 * Np. provider może jednocześnie rezerwować usługi jako customer.
 */
class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Tworzenie podstawowych ról użytkowników
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $providerRole = Role::firstOrCreate(['name' => 'provider', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Tworzenie ról panelu administracyjnego
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $opsManagerRole = Role::firstOrCreate(['name' => 'ops_manager', 'guard_name' => 'web']);
        $financeRole = Role::firstOrCreate(['name' => 'finance', 'guard_name' => 'web']);
        $supportRole = Role::firstOrCreate(['name' => 'support', 'guard_name' => 'web']);

        $this->command->info('✅ Role utworzone: customer, provider, admin, super_admin, ops_manager, finance, support');

        // Opcjonalnie: Tworzenie uprawnień (permissions)
        // Na razie używamy tylko ról, ale możemy dodać szczegółowe uprawnienia później
        
        // Przykładowe uprawnienia dla przyszłości:
        // Permission::firstOrCreate(['name' => 'view bookings', 'guard_name' => 'web']);
        // Permission::firstOrCreate(['name' => 'create bookings', 'guard_name' => 'web']);
        // Permission::firstOrCreate(['name' => 'manage own services', 'guard_name' => 'web']);
        // Permission::firstOrCreate(['name' => 'manage all users', 'guard_name' => 'web']);

        // Migracja istniejących użytkowników
        $this->migrateExistingUsers();
    }

    /**
     * Migruje istniejących użytkowników do nowego systemu ról.
     */
    private function migrateExistingUsers(): void
    {
        $migratedCount = 0;

        // Wszyscy użytkownicy typu 'customer' → rola 'customer'
        $customers = User::with('roles')->where('user_type', 'customer')->get();
        foreach ($customers as $user) {
            if ($user->roles->isEmpty()) {
                $user->assignRole('customer');
                $migratedCount++;
            }
        }

        $this->command->info("✅ Migrowano {$migratedCount} klientów");

        // Wszyscy użytkownicy typu 'provider' → role 'customer' + 'provider'
        // (provider może też rezerwować jako klient!)
        $providersCount = 0;
        $providers = User::with('roles')->where('user_type', 'provider')->get();
        foreach ($providers as $user) {
            if ($user->roles->isEmpty()) {
                $user->assignRole(['customer', 'provider']); // Obydwie role naraz!
                $providersCount++;
            }
        }

        $this->command->info("✅ Migrowano {$providersCount} providerów (customer + provider)");

        // Admini
        $adminsCount = 0;
        $admins = User::with('roles')->where('is_admin', true)->get();
        foreach ($admins as $user) {
            // Sprawdź czy user już ma rolę admin
            $hasAdminRole = $user->roles->where('name', 'admin')->isNotEmpty();
            if (!$hasAdminRole) {
                $user->assignRole('admin');
                $adminsCount++;
            }

            // Automatycznie przypisz super_admin do wszystkich is_admin=true
            $hasSuperAdminRole = $user->roles->where('name', 'super_admin')->isNotEmpty();
            if (!$hasSuperAdminRole) {
                $user->assignRole('super_admin');
            }
        }

        $this->command->info("✅ Migrowano {$adminsCount} adminów (admin + super_admin)");

        // Użytkownicy bez user_type (edge case) → przypisz 'customer'
        $nullTypeCount = 0;
        $nullTypeUsers = User::with('roles')->whereNull('user_type')->get();
        foreach ($nullTypeUsers as $user) {
            if ($user->roles->isEmpty()) {
                $user->assignRole('customer');
                $nullTypeCount++;
            }
        }

        if ($nullTypeCount > 0) {
            $this->command->warn("⚠️  Znaleziono {$nullTypeCount} użytkowników bez user_type - przypisano rolę 'customer'");
        }

        $this->command->info('✅ Migracja użytkowników zakończona!');
    }
}
