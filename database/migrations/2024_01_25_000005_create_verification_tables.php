<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela weryfikacji (tożsamość, konto bankowe, itp)
        Schema::create('verifications', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('user_id');
            
            // Typ weryfikacji
            $table->string('type'); // 'identity', 'bank_account', 'phone', 'email'
            
            // Dane
            $table->string('value')->nullable(); // +48123456789 / nr konta / email
            $table->json('metadata')->nullable(); // {'document_type': 'passport', ...}
            $table->string('document_path')->nullable(); // Ścieżka do dokumentu
            
            // Status
            $table->enum('status', ['pending', 'verified', 'rejected', 'expired'])->default('pending');
            $table->text('rejection_reason')->nullable();
            
            // Daty
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable(); // Admin
            
            // Timestamps
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            
            // Indeksy
            $table->index(['user_id', 'type']);
            $table->index('status');
        });

        // Tabela certyfikatów (zawodowych)
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('user_id');
            
            // Certyfikat
            $table->string('name'); // "Kurs hydrauliki - certyfikat"
            $table->string('issuer')->nullable(); // "Wojewódzki Ośrodek Kształcenia"
            $table->string('credential_id')->nullable(); // Numer certyfikatu
            $table->text('description')->nullable();
            
            // Daty
            $table->date('issue_date');
            $table->date('expiry_date')->nullable(); // null = brak wygaśnięcia
            
            // Dokument
            $table->string('document_path')->nullable(); // Ścieżka do pliku PDF
            $table->string('credential_url')->nullable(); // Link do weryfikacji
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false); // Admin zweryfikował
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['user_id', 'is_active']);
            $table->index('is_verified');
        });

        // Tabela portfolio (przykłady prac)
        Schema::create('portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('user_id');
            
            // Projekt
            $table->string('title');
            $table->text('description');
            $table->string('category')->nullable(); // 'kitchen_renovation', 'bathroom', itp
            
            // Media
            $table->json('image_paths'); // Array of paths
            $table->string('thumbnail_path')->nullable();
            
            // Info
            $table->date('completed_at');
            $table->decimal('project_value', 10, 2)->nullable(); // Wartość projektu
            $table->integer('duration_days')->nullable(); // Czas trwania projektu
            
            // Social proof
            $table->integer('views')->unsigned()->default(0);
            $table->integer('likes')->unsigned()->default(0);
            
            // Status
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_verified')->default(false); // Admin sprawdził autentyczność
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['user_id', 'is_visible']);
            $table->index('is_verified');
            $table->index('completed_at');
        });

        // Tabela kommentarzy do portfolio
        Schema::create('portfolio_comments', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('portfolio_item_id');
            $table->unsignedBigInteger('user_id'); // Kto napisał
            
            // Treść
            $table->text('comment');
            $table->integer('rating')->nullable()->min(1)->max(5);
            
            // Status
            $table->boolean('is_approved')->default(true);
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('portfolio_item_id')->references('id')->on('portfolio_items')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['portfolio_item_id', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_comments');
        Schema::dropIfExists('portfolio_items');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('verifications');
    }
};
