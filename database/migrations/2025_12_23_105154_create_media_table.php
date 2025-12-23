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
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->morphs('mediable'); // mediable_type, mediable_id
            $table->string('collection', 50); // avatar, portfolio, service_main, service_gallery, review
            $table->string('disk', 20)->default('public'); // public, s3
            $table->string('path');
            $table->string('filename');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size'); // bytes
            $table->json('metadata')->nullable(); // width, height, custom data
            $table->unsignedInteger('order')->default(0); // Dla galerii
            $table->boolean('is_migrated')->default(false);
            $table->timestamp('migrated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indeksy dla wydajności
            $table->index(['mediable_type', 'mediable_id', 'collection']);
            $table->index(['collection', 'created_at']);
            $table->index('is_migrated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
