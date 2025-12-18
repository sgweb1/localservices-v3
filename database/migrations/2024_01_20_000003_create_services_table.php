<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracja: Tabela główna - oferty usług (services)
 * 
 * Uproszczona wersja marketplace - bez subcategories, portfolio, photos na razie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('provider_id');
            $table->unsignedBigInteger('location_id')->nullable();
            $table->unsignedBigInteger('category_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('what_included')->nullable();

            // Cennik
            $table->enum('pricing_type', ['hourly', 'fixed', 'quote'])->default('hourly');
            $table->decimal('base_price', 8, 2)->nullable();
            $table->decimal('price_range_low', 8, 2)->nullable();
            $table->decimal('price_range_high', 8, 2)->nullable();
            $table->string('price_currency', 3)->default('PLN');
            $table->string('pricing_unit')->nullable();

            // Rezerwacje
            $table->boolean('instant_booking')->default(false);
            $table->boolean('accepts_quote_requests')->default(true);
            $table->unsignedInteger('min_notice_hours')->default(24);
            $table->unsignedInteger('max_advance_days')->default(90);
            $table->unsignedInteger('duration_minutes')->nullable();

            // Lokalizacja
            $table->json('service_locations')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('max_distance_km')->default(20);
            $table->boolean('willing_to_travel')->default(true);
            $table->decimal('travel_fee_per_km', 6, 2)->nullable();

            // Wymagania i narzędzia
            $table->json('requirements')->nullable();
            $table->json('tools_provided')->nullable();
            $table->text('cancellation_policy')->nullable();

            // Statystyki
            $table->decimal('rating_average', 3, 2)->default(0.00);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('bookings_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamp('last_booked_at')->nullable();

            // Status i moderacja
            $table->enum('status', ['draft', 'pending', 'active', 'paused', 'rejected'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_promoted')->default(false);
            $table->timestamp('promoted_until')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('moderated_by')->nullable();
            $table->timestamp('moderated_at')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indeksy
            $table->index('provider_id');
            $table->index('location_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('is_featured');
            $table->index('is_promoted');
            $table->index('rating_average');
            $table->index('published_at');
            $table->index('base_price');

            // Klucze obce
            $table->foreign('provider_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('location_id')
                ->references('id')
                ->on('locations')
                ->onDelete('set null');

            $table->foreign('category_id')
                ->references('id')
                ->on('service_categories')
                ->onDelete('restrict');

            $table->foreign('moderated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
