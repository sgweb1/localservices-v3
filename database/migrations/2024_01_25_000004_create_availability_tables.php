<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela dostępności (godziny pracy)
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('provider_id');
            
            // Harmonogram
            $table->tinyInteger('day_of_week'); // 0=niedziela, 1=poniedziałek, ..., 6=sobota
            $table->time('start_time'); // 09:00
            $table->time('end_time'); // 17:00
            
            // Maks bookings w tym dniu
            $table->integer('max_bookings')->unsigned()->default(10);
            $table->integer('current_bookings')->unsigned()->default(0); // Cache dla optymalizacji
            
            // Status
            $table->boolean('is_available')->default(true);
            $table->string('break_time_start')->nullable(); // 12:00
            $table->string('break_time_end')->nullable(); // 13:00
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('provider_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['provider_id', 'day_of_week']);
            $table->index('is_available');
        });

        // Tabela wyjątków dostępności (urlop, niedostępność)
        Schema::create('availability_exceptions', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('provider_id');
            
            // Okres
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason'); // 'vacation', 'sick_leave', 'maintenance', 'other'
            $table->text('description')->nullable();
            
            // Status
            $table->boolean('is_approved')->default(false);
            $table->unsignedBigInteger('approved_by')->nullable(); // Admin
            $table->timestamp('approved_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('provider_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            // Indeksy
            $table->index(['provider_id', 'start_date', 'end_date']);
            $table->index('is_approved');
        });

        // Tabela obszarów serwisu (gdzie provider jeździ)
        Schema::create('service_areas', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('provider_id');
            $table->unsignedBigInteger('location_id')->nullable();
            
            // Obszar
            $table->string('name'); // "Warszawa - Śródmieście"
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('radius_km', 5, 2)->default(15); // Promień obsługi w km
            
            // Opłata
            $table->decimal('travel_fee_per_km', 5, 2)->nullable();
            $table->decimal('min_travel_fee', 8, 2)->default(0); // Minimalna opłata za dojazd
            
            // Status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('provider_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            
            // Indeksy
            $table->index(['provider_id', 'is_active']);
            $table->index(['latitude', 'longitude']); // Standardowy index zamiast spatial
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_areas');
        Schema::dropIfExists('availability_exceptions');
        Schema::dropIfExists('availabilities');
    }
};
