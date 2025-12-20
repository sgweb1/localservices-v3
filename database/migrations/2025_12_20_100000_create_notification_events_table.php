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
        Schema::create('notification_events', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Unikalny klucz eventu, np. booking.created');
            $table->string('name')->comment('Nazwa eventu wyświetlana w UI');
            $table->text('description')->nullable()->comment('Opis eventu');
            $table->json('available_variables')->comment('Dostępne zmienne do interpolacji');
            $table->boolean('is_active')->default(true)->comment('Czy event jest aktywny');
            $table->timestamps();

            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_events');
    }
};
