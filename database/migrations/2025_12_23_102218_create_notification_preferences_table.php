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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->unique();

            // Email notifications
            $table->boolean('email_booking_created')->default(true);
            $table->boolean('email_booking_cancelled')->default(true);
            $table->boolean('email_message_received')->default(true);
            $table->boolean('email_review_received')->default(true);

            // App (push) notifications
            $table->boolean('app_booking_created')->default(true);
            $table->boolean('app_message_received')->default(true);
            $table->boolean('app_review_received')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
