<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->timestamp('hidden_by_customer_at')->nullable()->after('provider_read_at');
            $table->timestamp('hidden_by_provider_at')->nullable()->after('hidden_by_customer_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['hidden_by_customer_at', 'hidden_by_provider_at']);
        });
    }
};
