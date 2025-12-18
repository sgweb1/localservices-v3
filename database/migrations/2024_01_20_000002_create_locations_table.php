<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracja: Tabela lokalizacji geograficznych
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 11, 7);
            $table->string('region')->nullable();
            $table->integer('population')->nullable();
            $table->boolean('is_major_city')->default(false);
            $table->timestamps();

            $table->index('name');
            $table->index('is_major_city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
