<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracja systemu rezerwacji marketplace
 *
 * Dwa tryby rezerwacji:
 * 1. Instant Booking - natychmiastowe potwierdzenie (booking)
 * 2. Request Quote - zapytanie ofertowe wymagające wyceny (booking_request)
 *
 * Tabele:
 * - bookings: Potwierdzone rezerwacje (Instant Booking)
 * - booking_requests: Zapytania ofertowe (Request Quote)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabela głównych rezerwacji (Instant Booking)
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('booking_number')->unique()->comment('Format: BK-2025-00001');

            // Relacje
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();

            // Termin rezerwacji
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();

            // Lokalizacja usługi
            $table->text('service_address')->comment('Adres świadczenia usługi');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('distance_km', 6, 2)->nullable()->comment('Odległość od providera');

            // Cennik
            $table->decimal('service_price', 10, 2)->comment('Cena usługi');
            $table->decimal('travel_fee', 10, 2)->default(0)->comment('Opłata za dojazd');
            $table->decimal('platform_fee', 10, 2)->default(0)->comment('prowizja platformy');
            $table->decimal('total_price', 10, 2)->comment('Całkowita kwota');
            $table->string('currency', 3)->default('PLN');

            // Status płatności
            $table->enum('payment_status', ['pending', 'paid', 'refunded', 'failed'])->default('pending');
            $table->enum('payment_method', ['cash', 'card', 'transfer', 'online'])->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable()->comment('ID transakcji płatności');

            // Status rezerwacji
            $table->enum('status', [
                'pending',          // Oczekuje na potwierdzenie
                'confirmed',        // Potwierdzona
                'in_progress',      // W trakcie realizacji
                'completed',        // Zakończona
                'cancelled',        // Anulowana
                'no_show',          // Klient się nie stawił
                'disputed',         // Sporna
            ])->default('confirmed')->comment('Instant Booking = confirmed od razu');

            // Anulowanie
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('cancellation_fee', 10, 2)->nullable();

            // Notatki
            $table->text('customer_notes')->nullable()->comment('Uwagi klienta');
            $table->text('provider_notes')->nullable()->comment('Notatki providera');
            $table->text('admin_notes')->nullable()->comment('Notatki administracyjne');
            $table->json('special_requirements')->nullable()->comment('Specjalne wymagania');

            // Timeline
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // Recenzje
            $table->boolean('customer_reviewed')->default(false);
            $table->boolean('provider_reviewed')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Indeksy
            $table->index('booking_number');
            $table->index(['customer_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['service_id', 'status']);
            $table->index('booking_date');
            $table->index('status');
            $table->index('payment_status');
            $table->index(['provider_id', 'booking_date']);
        });

        // Tabela zapytań ofertowych (Request Quote)
        Schema::create('booking_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('request_number')->unique()->comment('Format: RQ-2025-00001');

            // Relacje
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete()
                ->comment('Po akceptacji tworzy się booking');

            // Szczegóły zapytania klienta
            $table->text('description')->comment('Opis potrzeb klienta');
            $table->text('service_address')->comment('Adres świadczenia usługi');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->date('preferred_date')->nullable()->comment('Preferowana data');
            $table->time('preferred_time')->nullable()->comment('Preferowana godzina');
            $table->json('attachments')->nullable()->comment('Załączniki (zdjęcia, pliki)');

            // Budżet klienta (opcjonalny)
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();

            // Oferta usługodawcy
            $table->decimal('quoted_price', 10, 2)->nullable()->comment('Wyceniona kwota');
            $table->text('quote_details')->nullable()->comment('Szczegóły wyceny');
            $table->date('quote_valid_until')->nullable()->comment('Ważność oferty');
            $table->unsignedInteger('estimated_duration_hours')->nullable();

            // Status
            $table->enum('status', [
                'pending',      // Oczekuje na wycenę
                'quoted',       // Wycenione przez providera
                'accepted',     // Zaakceptowane przez klienta (→ booking)
                'rejected',     // Odrzucone przez klienta
                'expired',      // Wygasła oferta
                'cancelled',    // Anulowane przez którąś stronę
            ])->default('pending');

            // Timeline
            $table->timestamp('quoted_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Indeksy
            $table->index('request_number');
            $table->index(['customer_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index('service_id');
            $table->index('status');
            $table->index('booking_id');
            $table->index('preferred_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_requests');
        Schema::dropIfExists('bookings');
    }
};
