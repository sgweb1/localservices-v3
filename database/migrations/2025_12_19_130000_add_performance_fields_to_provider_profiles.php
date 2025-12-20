<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('provider_profiles', 'response_time_hours')) {
                $table->decimal('response_time_hours', 5, 2)->nullable()->after('trust_score');
            }
            if (! Schema::hasColumn('provider_profiles', 'completion_rate')) {
                $table->decimal('completion_rate', 5, 2)->nullable()->after('response_time_hours');
            }
            if (! Schema::hasColumn('provider_profiles', 'repeat_customers')) {
                $table->unsignedSmallInteger('repeat_customers')->nullable()->after('completion_rate');
            }
            if (! Schema::hasColumn('provider_profiles', 'cancellation_rate')) {
                $table->decimal('cancellation_rate', 5, 2)->nullable()->after('repeat_customers');
            }
        });
    }

    public function down(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('provider_profiles', 'cancellation_rate')) {
                $table->dropColumn('cancellation_rate');
            }
            if (Schema::hasColumn('provider_profiles', 'repeat_customers')) {
                $table->dropColumn('repeat_customers');
            }
            if (Schema::hasColumn('provider_profiles', 'completion_rate')) {
                $table->dropColumn('completion_rate');
            }
            if (Schema::hasColumn('provider_profiles', 'response_time_hours')) {
                $table->dropColumn('response_time_hours');
            }
        });
    }
};
