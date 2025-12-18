<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela rozmów (między customerem a providerem)
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('provider_id');
            $table->unsignedBigInteger('booking_id')->nullable(); // Powiązanie z rezerwacją
            $table->unsignedBigInteger('service_id')->nullable(); // Powiązanie z usługą
            
            // Metadane
            $table->string('subject')->nullable(); // Temat rozmowy
            $table->text('last_message')->nullable(); // Ostatnia wiadomość (cache)
            $table->timestamp('last_message_at')->nullable();
            
            // Status
            $table->boolean('customer_active')->default(true); // Czy customer ma dostęp
            $table->boolean('provider_active')->default(true); // Czy provider ma dostęp
            $table->timestamp('customer_read_at')->nullable();
            $table->timestamp('provider_read_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('provider_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('set null');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            
            // Indeksy
            $table->index(['customer_id', 'provider_id']); // Wyszukiwanie rozmowy
            $table->index(['customer_id', 'created_at']); // Lista rozmów dla customera
            $table->index(['provider_id', 'created_at']); // Lista rozmów dla providera
            $table->index('booking_id');
        });

        // Tabela wiadomości
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id');
            
            // Treść
            $table->text('body');
            $table->json('metadata')->nullable(); // {'type': 'quote_request', 'price': 250}
            
            // Status
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indeksy
            $table->index(['conversation_id', 'created_at']); // Wiadomości w rozmowie
            $table->index(['sender_id', 'created_at']);
        });

        // Tabela załączników do wiadomości
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            
            // Relacje
            $table->unsignedBigInteger('message_id');
            
            // Plik
            $table->string('file_path'); // storage path
            $table->string('file_name');
            $table->string('file_type'); // mime type: image/jpeg, application/pdf
            $table->integer('file_size'); // bytes
            
            // Metadane dla obrazów
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('thumbnail_path')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('message_id')->references('id')->on('messages')->onDelete('cascade');
            
            // Indeksy
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
