<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rozbudowa tabeli users o system ról i dodatkowe pola z LocalServices.
     *
     * Dodaje:
     * - is_admin - flaga administratora
     * - rating_average, rating_count - średnia ocen i liczba ocen
     * - profile_completion - procent kompletności profilu
     * - last_login_at, last_seen_at - tracking aktywności
     * - subscription pola - current_subscription_plan_id, subscription_expires_at
     * - notification preferences - email_notifications, push_notifications, sms_notifications
     * - analytics_interface_visible - dostęp do analityki
     * - first_name, last_name - rozdzielenie imienia i nazwiska
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Admin flag
            $table->boolean('is_admin')->default(false)->after('user_type');
            
            // Rozdzielenie name na first_name i last_name
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            
            // Rating system
            $table->decimal('rating_average', 3, 2)->default(0)->after('longitude');
            $table->unsignedInteger('rating_count')->default(0)->after('rating_average');
            
            // Profile completion
            $table->tinyInteger('profile_completion')->default(0)->after('rating_count');
            
            // Activity tracking
            $table->timestamp('last_login_at')->nullable()->after('profile_completion');
            $table->timestamp('last_seen_at')->nullable()->after('last_login_at');
            
            // Subscription
            $table->foreignId('current_subscription_plan_id')->nullable()->after('last_seen_at');
            $table->timestamp('subscription_expires_at')->nullable()->after('current_subscription_plan_id');
            
            // Notification preferences
            $table->boolean('email_notifications')->default(true)->after('subscription_expires_at');
            $table->boolean('push_notifications')->default(true)->after('email_notifications');
            $table->boolean('sms_notifications')->default(false)->after('push_notifications');
            
            // Analytics
            $table->boolean('analytics_interface_visible')->default(false)->after('sms_notifications');
            
            // Indexes
            $table->index('is_admin');
            $table->index('last_seen_at');
            $table->index('profile_completion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_admin',
                'first_name',
                'last_name',
                'rating_average',
                'rating_count',
                'profile_completion',
                'last_login_at',
                'last_seen_at',
                'current_subscription_plan_id',
                'subscription_expires_at',
                'email_notifications',
                'push_notifications',
                'sms_notifications',
                'analytics_interface_visible',
            ]);
        });
    }
};
