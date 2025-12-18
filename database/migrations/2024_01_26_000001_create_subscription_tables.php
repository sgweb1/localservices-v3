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
        // Plany subskrypcji (Basic, Professional, Premium)
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->string('name'); // Basic, Professional, Premium
            $table->text('description');
            $table->decimal('price_monthly', 10, 2);
            $table->decimal('price_yearly', 10, 2)->nullable();
            $table->integer('max_services'); // Ilość usług na planie
            $table->integer('max_bookings_per_month')->nullable(); // null = unlimited
            $table->boolean('featured_listing'); // Czy na głównej stronie
            $table->boolean('priority_support');
            $table->boolean('analytics_dashboard');
            $table->json('features'); // JSON array dodatkowych features
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // Aktywne subskrypcje providerów
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->enum('billing_period', ['monthly', 'yearly'])->default('monthly');
            $table->enum('status', ['active', 'paused', 'cancelled', 'past_due'])->default('active');
            $table->dateTime('started_at');
            $table->dateTime('ends_at');
            $table->dateTime('renews_at');
            $table->dateTime('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->dateTime('paused_at')->nullable();
            $table->integer('auto_renew')->default(1); // 1 = true, 0 = false
            $table->timestamps();
            $table->softDeletes();
        });

        // Płatności / transakcje
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->string('payment_method'); // credit_card, bank_transfer, paypal, stripe
            $table->enum('payment_type', ['subscription', 'booking_service', 'refund'])->default('subscription');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PLN');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->nullable()->unique(); // ID z payment gatewayu
            $table->string('reference')->nullable(); // Invoice number, booking reference
            $table->json('metadata'); // dodatkowe dane (card last 4, bank account, etc)
            $table->text('failure_reason')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('refunded_at')->nullable();
            $table->timestamps();
        });

        // Faktury
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->string('invoice_number')->unique(); // INV-2025-00001
            $table->enum('type', ['subscription', 'service', 'refund'])->default('subscription');
            $table->enum('status', ['draft', 'issued', 'paid', 'overdue', 'cancelled'])->default('issued');
            $table->text('description');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('vat_rate', 5, 2)->default(0); // 23% = 23.00
            $table->decimal('vat_amount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency')->default('PLN');
            $table->dateTime('issued_at');
            $table->dateTime('due_at');
            $table->dateTime('paid_at')->nullable();
            $table->string('document_path')->nullable(); // PDF path
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Pozycje na fakturze
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->json('metadata')->nullable(); // service_id, subscription_plan_id, etc
            $table->timestamps();
        });

        // Wypłaty dla providerów
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('payout_number')->unique(); // PAYOUT-2025-00001
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->enum('payout_method', ['bank_transfer', 'paypal', 'stripe'])->default('bank_transfer');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PLN');
            $table->decimal('platform_fee', 10, 2); // 10% lub inne
            $table->decimal('net_amount', 10, 2); // amount - platform_fee
            $table->text('description');
            $table->dateTime('requested_at');
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->string('transaction_id')->nullable();
            $table->text('failure_reason')->nullable();
            $table->integer('payment_count'); // Ilość transakcji w tej wypłacie
            $table->json('payment_ids'); // Array ID transakcji
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
