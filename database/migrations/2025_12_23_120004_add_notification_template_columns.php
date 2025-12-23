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
        // Jeśli tabela istnieje, dodaj brakujące kolumny
        if (Schema::hasTable('notification_templates')) {
            Schema::table('notification_templates', function (Blueprint $table) {
                // Dodaj brakujące kolumny dla email
                if (!Schema::hasColumn('notification_templates', 'email_action_url')) {
                    $table->string('email_action_url')->nullable()->comment('Link CTA w emailu')->after('email_body');
                }

                // Dodaj brakujące kolumny dla push
                if (!Schema::hasColumn('notification_templates', 'push_action_url')) {
                    $table->string('push_action_url')->nullable()->after('push_body');
                }
                
                if (!Schema::hasColumn('notification_templates', 'push_icon')) {
                    $table->string('push_icon')->nullable()->default('/images/icon-192.png')->after('push_action_url');
                }

                // Dodaj kanały JSON jeśli nie istnieją
                if (!Schema::hasColumn('notification_templates', 'channels')) {
                    $table->json('channels')->nullable()->comment('Aktywne kanały')->after('recipient_type');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
