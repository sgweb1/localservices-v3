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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('phone_country_code', 5)->default('+48');
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('video_introduction_url')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('preferred_language', 10)->default('pl');
            $table->string('timezone', 50)->default('Europe/Warsaw');
            $table->json('languages')->default('["pl"]');
            $table->unsignedTinyInteger('profile_completion_percentage')->default(0);
            $table->boolean('is_profile_public')->default(true);
            $table->timestamps();

            // Indexes
            $table->unique('user_id');
            $table->index('city');
            $table->index('profile_completion_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
