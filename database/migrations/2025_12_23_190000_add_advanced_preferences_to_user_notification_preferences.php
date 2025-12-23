<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_notification_preferences', function (Blueprint $table) {
            // Quiet hours
            $table->time('quiet_hours_start')->nullable()->after('database_enabled')->comment('22:00');
            $table->time('quiet_hours_end')->nullable()->after('quiet_hours_start')->comment('08:00');
            $table->boolean('quiet_hours_enabled')->default(false)->after('quiet_hours_end');
            
            // Frequency control
            $table->enum('frequency', ['instant', 'hourly', 'daily', 'weekly', 'off'])->default('instant')->after('quiet_hours_enabled');
            
            // Batch notifications
            $table->boolean('batch_enabled')->default(false)->after('frequency')->comment('Group similar notifications');
            
            // Notes
            $table->text('notes')->nullable()->after('batch_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('user_notification_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'quiet_hours_start',
                'quiet_hours_end',
                'quiet_hours_enabled',
                'frequency',
                'batch_enabled',
                'notes',
            ]);
        });
    }
};
