<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Centralny seeder danych słownikowych.
 *
 * Konsoliduje seedowanie ról, kategorii usług, lokalizacji oraz planów
 * subskrypcji, tak aby środowisko deweloperskie startowało z kompletnym
 * zestawem podstawowych danych referencyjnych.
 */
class DictionarySeeder extends Seeder
{
    /**
     * Uruchamia seedy dostarczające podstawowe dane słownikowe.
     */
    public function run(): void
    {
        $this->command?->info('🌍 Seedowanie danych słownikowych...');

        // Role i uprawnienia (Spatie)
        $this->call(RoleAndPermissionSeeder::class);

        // Kategorie usług
        $this->call(ServiceCategorySeeder::class);

        // Lokalizacje (zamiennik dawnych "cities")
        $this->call(LocationSeeder::class);

        // Plany subskrypcji
        $this->call(SubscriptionPlanSeeder::class);

        $this->command?->info('✅ Słowniki załadowane');
    }
}
