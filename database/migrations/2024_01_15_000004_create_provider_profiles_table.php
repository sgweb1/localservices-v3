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
        Schema::create('provider_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->text('service_description')->nullable();
            $table->string('website_url')->nullable();
            $table->json('social_media')->nullable();
            $table->string('subdomain')->nullable()->unique();
            $table->unsignedTinyInteger('trust_score')->default(0);
            $table->unsignedTinyInteger('verification_level')->default(1);
            $table->boolean('id_verified')->default(false);
            $table->boolean('background_check_passed')->default(false);
            $table->timestamps();

            // Indexes
            $table->unique('user_id');
            $table->index('subdomain');
            $table->index('trust_score');
            $table->index('verification_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_profiles');
    }
};
