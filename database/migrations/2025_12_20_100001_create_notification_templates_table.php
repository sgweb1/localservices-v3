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
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('notification_events')->onDelete('cascade');
            $table->enum('recipient_type', ['customer', 'provider', 'admin'])->comment('Typ adresata');
            $table->json('channels')->comment('Aktywne kanały: email, push, toast, database');

            // EMAIL
            $table->boolean('email_enabled')->default(false);
            $table->string('email_subject')->nullable();
            $table->text('email_body')->nullable()->comment('Treść w markdown');
            $table->string('email_view')->nullable()->comment('Opcjonalny custom blade view');

            // PUSH
            $table->boolean('push_enabled')->default(false);
            $table->string('push_title')->nullable();
            $table->text('push_body')->nullable();

            // TOAST
            $table->boolean('toast_enabled')->default(true);
            $table->enum('toast_type', ['success', 'warning', 'error', 'info'])->nullable()->default('info');
            $table->string('toast_title')->nullable();
            $table->text('toast_message')->nullable();
            $table->integer('toast_duration')->nullable()->default(5)->comment('Czas wyświetlania w sekundach');

            // DATABASE (in-app notification)
            $table->boolean('database_enabled')->default(true);
            $table->string('database_title')->nullable();
            $table->text('database_body')->nullable();
            $table->string('database_action_url')->nullable()->comment('Link do akcji, np. /provider/bookings?booking=123');

            $table->boolean('is_active')->default(true)->comment('Czy szablon jest aktywny');
            $table->boolean('user_configurable')->default(true)->comment('Czy user może wyłączyć w ustawieniach');
            $table->timestamps();

            $table->index(['event_id', 'recipient_type']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
