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
        Schema::create('profile_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('viewer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('source')->default('direct'); // direct, search, google_ads, social_media, referral
            $table->string('referrer')->nullable();
            $table->string('user_agent')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('viewed_at');
            $table->timestamps();

            $table->index(['provider_id', 'viewed_at']);
            $table->index(['provider_id', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_views');
    }
};
