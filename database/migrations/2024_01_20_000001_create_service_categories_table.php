<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracja: Tabela kategorii usług
 * 
 * Hierarchiczna struktura kategorii z parent/child relationships.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('color')->default('#3B82F6');
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('listings_count')->default(0);
            $table->unsignedInteger('providers_count')->default(0);
            $table->timestamps();

            $table->index('parent_id');
            $table->index('is_active');
            $table->index('order');

            $table->foreign('parent_id')
                ->references('id')
                ->on('service_categories')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_categories');
    }
};
