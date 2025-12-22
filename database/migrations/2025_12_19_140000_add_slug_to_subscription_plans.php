<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_plans', 'slug')) {
                $table->string('slug')->unique()->after('name');
            }
        });

        // Ustaw slug dla istniejących planów
        DB::table('subscription_plans')->whereNull('slug')->get()->each(function ($plan) {
            DB::table('subscription_plans')
                ->where('id', $plan->id)
                ->update(['slug' => Str::slug($plan->name)]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
