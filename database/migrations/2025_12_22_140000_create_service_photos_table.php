<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tworzenie tabeli service_photos (galeria zdjęć usług).
     */
    public function up(): void
    {
        Schema::create('service_photos', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('image_path');
            $table->text('alt_text')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indeksy
            $table->index(['service_id', 'is_primary']);
            $table->index(['service_id', 'position']);
        });
    }

    /**
     * Rollback migracji.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_photos');
    }
};
