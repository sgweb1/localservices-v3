<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela opinii/recenzji
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('booking_id')->index();
            $table->unsignedBigInteger('reviewer_id'); // User (kto ocenia)
            $table->unsignedBigInteger('reviewed_id'); // User (kogo ocenia)
            
            // Treść
            $table->integer('rating')->unsigned()->min(1)->max(5); // Ocena 1-5
            $table->text('comment')->nullable();
            $table->json('categories')->nullable(); // ['communication' => 5, 'cleanliness' => 4, ...]
            
            // Status
            $table->boolean('is_visible')->default(true); // Ukryta przez admina
            $table->boolean('is_reported')->default(false); // Zgłoszona jako spamowa
            $table->integer('helpful_votes')->unsigned()->default(0); // Ile osób uznało za przydatną
            
            // Timestamps
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('reviewer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['reviewed_id', 'rating']); // Oceny danego użytkownika
            $table->index(['booking_id', 'reviewer_id']); // Jedna recenzja na booking
        });

        // Tabela odpowiedzi na recenzje (od providera lub admina)
        Schema::create('review_responses', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('review_id')->index();
            $table->unsignedBigInteger('user_id'); // Provider lub admin
            
            // Treść
            $table->text('response');
            
            // Status
            $table->boolean('is_visible')->default(true);
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_responses');
        Schema::dropIfExists('reviews');
    }
};
