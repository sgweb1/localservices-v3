<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite nie wspiera MODIFY COLUMN z ENUM - status jest już jako string
        // Dodanie 'rejected' jest tylko semantyczne (wartości stringowe)
        // Walidacja odbędzie się na poziomie aplikacji
        
        // Dla MySQL/MariaDB można by użyć:
        // DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected', 'no_show', 'disputed') DEFAULT 'confirmed'");
        
        // Dla SQLite (używanego w testach) - nic nie trzeba robić, status to już string
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Zamień rejected na cancelled przy rollbacku
        DB::table('bookings')
            ->where('status', 'rejected')
            ->update(['status' => 'cancelled']);
    }
};
