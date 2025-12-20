<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Dodaje flagi ukrywania rezerwacji dla providera i customera.
     * Każdy użytkownik może ukryć rezerwację w swoim panelu bez wpływu na drugą stronę.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->boolean('hidden_by_provider')->default(false)->after('provider_reviewed')
                ->comment('Provider ukrył rezerwację w swoim panelu');
            $table->boolean('hidden_by_customer')->default(false)->after('hidden_by_provider')
                ->comment('Customer ukrył rezerwację w swoim panelu');
            
            $table->index('hidden_by_provider');
            $table->index('hidden_by_customer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['hidden_by_provider']);
            $table->dropIndex(['hidden_by_customer']);
            $table->dropColumn(['hidden_by_provider', 'hidden_by_customer']);
        });
    }
};
