<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Migracja: Analytics System - Performance & Behavior Tracking
     * Główne tabele: events, provider_metrics, search_analytics, user_sessions, conversions
     */
    public function up(): void
    {
        // 1. TABELA: events (zdarzenia API - performance tracking)
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('event_name'); // 'booking.created', 'search.performed', 'review.submitted'
            $table->string('event_type'); // 'user_action', 'system', 'error'
            $table->nullableMorphs('model'); // polymorphic: User, Booking, Review
            $table->integer('response_time_ms')->nullable(); // czas odpowiedzi w ms
            $table->string('http_method')->nullable(); // GET, POST
            $table->string('http_status')->nullable(); // 200, 404, 500
            $table->json('metadata')->nullable(); // dodatkowe dane: filters, page, sort_by
            $table->timestamps();
            
            $table->index('event_name');
            $table->index('event_type');
            $table->index('created_at');
        });

        // 2. TABELA: provider_metrics (metryki wydajności providera)
        Schema::create('provider_metrics', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->date('metric_date');
            
            // Metryki booking'u
            $table->integer('bookings_completed')->default(0); // rezerwacje ukończone
            $table->integer('bookings_cancelled')->default(0); // rezerwacje anulowane
            $table->decimal('cancellation_rate', 5, 2)->default(0); // procent anulacji
            $table->decimal('avg_response_time_minutes', 8, 2)->nullable(); // avg. czas odpowiedzi
            
            // Metryki recenzji
            $table->integer('reviews_count')->default(0); // liczba recenzji
            $table->decimal('avg_rating', 3, 2)->nullable(); // średnia ocena
            $table->json('ratings_distribution')->nullable()->comment('JSON: {5: 10, 4: 5, 3: 2, 2: 0, 1: 0}');
            
            // Metryki dostępności
            $table->integer('slots_available')->default(0); // liczba wolnych slotów
            $table->integer('slots_booked')->default(0); // zarezerwowane sloty
            $table->decimal('utilization_rate', 5, 2)->default(0); // procent wykorzystania
            
            // Zarobki
            $table->decimal('total_revenue', 10, 2)->default(0); // PLN
            $table->integer('subscription_status')->comment('0=cancelled, 1=active, 2=paused');
            
            $table->timestamps();
            
            $table->unique(['provider_id', 'metric_date']);
            $table->index('provider_id');
            $table->index('metric_date');
        });

        // 3. TABELA: search_analytics (śledzenie wyszukiwań)
        Schema::create('search_analytics', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('search_query'); // "hydraulika Wrocław", "nauka angielskiego"
            $table->string('service_category')->nullable(); // 'plumbing', 'tutoring'
            $table->string('city')->nullable(); // 'Wrocław', 'Poznań'
            $table->integer('results_count'); // ile wyników znaleziono
            $table->integer('results_clicked')->default(0); // ile kliknięto
            $table->boolean('first_result_clicked')->default(false); // kliknięto pierwszy wynik
            $table->boolean('conversion_happened')->default(false); // prowadzi do rezerwacji
            $table->integer('time_to_booking_seconds')->nullable(); // ile sekund do rezerwacji
            $table->string('device')->nullable(); // 'mobile', 'desktop'
            $table->timestamps();
            
            $table->index('service_category');
            $table->index('city');
            $table->index('created_at');
        });

        // 4. TABELA: user_sessions (sesje użytkownika - behavior tracking)
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('session_id')->unique(); // session ID
            $table->string('device_type'); // 'mobile', 'desktop', 'tablet'
            $table->string('browser')->nullable(); // 'chrome', 'safari', 'firefox'
            $table->string('os')->nullable(); // 'ios', 'android', 'windows'
            
            // Sesja
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('page_views')->default(0); // liczba odwiedzonych stron
            $table->integer('actions_count')->default(0); // liczba akcji (click, submit, etc.)
            
            // Behavior
            $table->string('entry_page')->nullable(); // '/services', '/providers'
            $table->string('exit_page')->nullable(); // ostatnia odwiedzona strona
            $table->boolean('bounce')->default(false); // wyjście bez akcji
            
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('session_id');
            $table->index('started_at');
        });

        // 5. TABELA: conversions (funnel tracking - booking flow)
        Schema::create('conversions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->cascadeOnDelete();
            
            // Funnel stages
            $table->string('funnel_name')->default('booking_flow'); // 'booking_flow', 'review_flow'
            $table->integer('stage')->default(0); // 0=search, 1=viewed_profile, 2=viewed_price, 3=booking_started, 4=booking_completed
            $table->string('stage_name')->default('search'); // descriptive name
            $table->timestamp('reached_at');
            $table->timestamp('left_at')->nullable(); // gdy user opuścił funnel
            $table->boolean('completed')->default(false); // czy ukończył
            $table->string('drop_reason')->nullable()->comment('cancel, timeout, error, user_choice');
            
            // Metrics
            $table->decimal('time_in_stage_seconds', 10, 2)->nullable();
            $table->integer('interactions_count')->default(0); // liczba interakcji w stage'u
            $table->json('metadata')->nullable(); // dodatkowe dane
            
            $table->timestamps();
            
            $table->index('customer_id');
            $table->index('provider_id');
            $table->index('funnel_name');
            $table->index('stage');
        });

        // 6. TABELA: api_endpoint_metrics (Performance API endpoints)
        Schema::create('api_endpoint_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('endpoint'); // '/api/v1/bookings', '/api/v1/reviews'
            $table->string('method'); // GET, POST, PUT
            $table->date('metric_date');
            
            // Traffic
            $table->integer('request_count')->default(0); // liczba requestów
            $table->integer('error_count')->default(0); // błędy (5xx)
            $table->integer('not_found_count')->default(0); // 404
            $table->decimal('error_rate', 5, 2)->default(0); // procent błędów
            
            // Performance
            $table->decimal('avg_response_time_ms', 8, 2)->nullable(); // średni czas
            $table->decimal('p95_response_time_ms', 8, 2)->nullable(); // 95 percentyl
            $table->decimal('p99_response_time_ms', 8, 2)->nullable(); // 99 percentyl
            $table->decimal('min_response_time_ms', 8, 2)->nullable();
            $table->decimal('max_response_time_ms', 8, 2)->nullable();
            
            // Database
            $table->integer('avg_query_count')->nullable(); // średnia liczba queries
            $table->decimal('avg_query_time_ms', 8, 2)->nullable();
            
            $table->timestamps();
            
            $table->unique(['endpoint', 'method', 'metric_date']);
            $table->index('endpoint');
            $table->index('metric_date');
        });

        // 7. TABELA: feature_flags (A/B testing, experiments)
        Schema::create('feature_flags', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('flag_name')->unique(); // 'instant_booking_v2', 'new_ui_profile'
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->integer('rollout_percentage')->default(100); // 0-100% rollout
            
            // Targeting
            $table->json('target_users')->nullable(); // lista user IDs
            $table->json('target_roles')->nullable(); // ['provider', 'customer']
            $table->json('target_cities')->nullable(); // ['Wrocław', 'Poznań']
            
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            
            $table->index('flag_name');
            $table->index('is_enabled');
        });

        // 8. TABELA: feature_flag_events (Śledzenie feature flags)
        Schema::create('feature_flag_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('feature_flag_id')->constrained('feature_flags')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('event_type'); // 'viewed', 'interacted', 'converted'
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('feature_flag_id');
            $table->index('user_id');
            $table->index('event_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_flag_events');
        Schema::dropIfExists('feature_flags');
        Schema::dropIfExists('api_endpoint_metrics');
        Schema::dropIfExists('conversions');
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('search_analytics');
        Schema::dropIfExists('provider_metrics');
        Schema::dropIfExists('events');
    }
};
