<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Konsolidacja 3 patches do tabeli bookings:
 * - 2025_12_20_064443_add_rejected_status_to_bookings_table.php
 * - 2025_12_20_065701_add_hidden_flags_to_bookings_table.php  
 * - 2025_12_21_173411_add_is_test_data_to_bookings_table.php
 * 
 * UWAGA: Ta migracja jest NO-OP jeśli poprzednie migracje już się wykonały.
 * Sprawdza czy kolumny istnieją przed dodaniem.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // 1. Status 'rejected' (semantyczny, SQLite używa string nie ENUM)
            // Nic do zrobienia - status to już string, aplikacja waliduje wartości
            
            // 2. Flagi ukrywania rezerwacji (hidden_by_provider, hidden_by_customer)
            if (!Schema::hasColumn('bookings', 'hidden_by_provider')) {
                $table->boolean('hidden_by_provider')->default(false)->after('provider_reviewed')
                    ->comment('Provider ukrył rezerwację w swoim panelu');
                $table->index('hidden_by_provider');
            }
            
            if (!Schema::hasColumn('bookings', 'hidden_by_customer')) {
                $table->boolean('hidden_by_customer')->default(false)->after('hidden_by_provider')
                    ->comment('Customer ukrył rezerwację w swoim panelu');
                $table->index('hidden_by_customer');
            }
            
            // 3. Flaga testowych danych (is_test_data)
            if (!Schema::hasColumn('bookings', 'is_test_data')) {
                $table->boolean('is_test_data')->default(false)->after('hidden_by_customer')
                    ->comment('Booking dodany przez DevSimulator/testy E2E');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Odwróć zmiany w odwrotnej kolejności (LIFO)
        Schema::table('bookings', function (Blueprint $table) {
            // 3. Usuń is_test_data
            if (Schema::hasColumn('bookings', 'is_test_data')) {
                $table->dropColumn('is_test_data');
            }
            
            // 2. Usuń flagi ukrywania
            if (Schema::hasColumn('bookings', 'hidden_by_customer')) {
                $table->dropIndex(['hidden_by_customer']);
                $table->dropColumn('hidden_by_customer');
            }
            
            if (Schema::hasColumn('bookings', 'hidden_by_provider')) {
                $table->dropIndex(['hidden_by_provider']);
                $table->dropColumn('hidden_by_provider');
            }
            
            // 1. Status rejected → cancelled przy rollbacku
            DB::table('bookings')
                ->where('status', 'rejected')
                ->update(['status' => 'cancelled']);
        });
    }
};
