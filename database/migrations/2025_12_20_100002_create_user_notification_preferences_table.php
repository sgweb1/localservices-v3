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
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('notification_events')->onDelete('cascade');
            
            // Preferencje kanałów
            $table->boolean('email_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('toast_enabled')->default(true);
            $table->boolean('database_enabled')->default(true);
            
            $table->timestamps();

            $table->unique(['user_id', 'event_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
