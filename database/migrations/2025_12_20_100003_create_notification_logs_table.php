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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_event_id')->constrained('notification_events')->onDelete('cascade');
            $table->foreignId('notification_template_id')->constrained('notification_templates')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('recipient_type', 20); // customer, provider, admin
            $table->string('event_key', 100); // booking.created, review.created, etc.
            $table->json('data')->nullable(); // Dane użyte do interpolacji
            $table->json('channels_sent')->nullable(); // ['email' => true, 'push' => false, ...]
            $table->json('channels_result')->nullable(); // ['email' => true, 'push' => 'failed: ...']
            $table->boolean('success')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            // Indeksy dla wydajności
            $table->index(['user_id', 'created_at']);
            $table->index(['event_key', 'created_at']);
            $table->index(['success', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
