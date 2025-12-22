<?php

namespace Tests\Feature\Api\V1;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testy API chatu
 *
 * @group api
 * @group chat
 */
class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $provider;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->customer()->create();
        $this->provider = User::factory()->provider()->create();
    }

    /**
     * Powinien zwrócić listę rozmów z polem last_message (string)
     */
    public function test_conversations_returns_last_message_string(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'last_message' => 'Cześć, jak mogę pomóc?',
            'last_message_at' => now(),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->provider->id,
            'body' => 'Cześć, jak mogę pomóc?',
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $conversation->id,
                'last_message' => 'Cześć, jak mogę pomóc?',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'uuid',
                        'customer',
                        'provider',
                        'last_message',
                        'unread_count',
                        'last_message_at',
                    ],
                ],
            ]);
    }

    /**
     * Powinien oznaczyć wiadomości jako przeczytane i ustawić read_at
     */
    public function test_mark_read_updates_messages_and_conversation(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        // Wiadomość od providera do klienta (powinna zostać oznaczona jako przeczytana przez klienta)
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->provider->id,
            'body' => 'Nowa wiadomość dla klienta',
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->postJson("/api/v1/conversations/{$conversation->id}/mark-read");

        $response->assertStatus(200)->assertJson(['status' => 'ok']);

        $this->assertNotNull(Message::where('conversation_id', $conversation->id)
            ->where('sender_id', $this->provider->id)
            ->first()
            ->read_at);

        $this->assertNotNull($conversation->fresh()->customer_read_at);
    }

    /**
     * Powinien wysłać wiadomość i zwrócić ją w response
     */
    public function test_send_message_creates_message(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => 'Cześć! Jestem zainteresowany twoją usługą.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'uuid',
                    'body',
                    'sender_id',
                    'created_at',
                    'read_at',
                    'is_edited',
                ],
            ])
            ->assertJson([
                'data' => [
                    'body' => 'Cześć! Jestem zainteresowany twoją usługą.',
                    'sender_id' => $this->customer->id,
                ],
            ]);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $this->customer->id,
            'body' => 'Cześć! Jestem zainteresowany twoją usługą.',
        ]);
    }

    /**
     * Powinien wysłać wiadomość z załącznikiem
     */
    public function test_send_message_with_attachment(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        Sanctum::actingAs($this->customer);

        // Utwórz testowy plik
        $file = \Illuminate\Http\UploadedFile::fake()->image('photo.jpg', 640, 480);

        $response = $this->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => 'Tutaj zdjęcie',
            'attachments' => [$file],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'body',
                    'attachments' => [
                        '*' => [
                            'id',
                            'file_name',
                            'file_size',
                            'width',
                            'height',
                            'url',
                        ],
                    ],
                ],
            ])
            ->assertJson([
                'data' => [
                    'body' => 'Tutaj zdjęcie',
                ],
            ]);

        $this->assertCount(1, $response->json('data.attachments'));
        $this->assertEquals('photo.jpg', $response->json('data.attachments.0.file_name'));
    }

    /**
     * Powinien zwrócić błąd validacji gdy brak body i attachments
     */
    public function test_send_message_requires_body_or_attachments(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['body'])
            ->assertJson([
                'message' => 'Napisz wiadomość lub dodaj załącznik',
            ]);
    }

    /**
     * Powinien usunąć własną wiadomość
     */
    public function test_delete_message_deletes_own_message(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->customer->id,
            'body' => 'Wiadomość do usunięcia',
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->deleteJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}");

        $response->assertStatus(200)->assertJson(['status' => 'ok']);

        $this->assertDatabaseMissing('messages', [
            'id' => $message->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Powinien zwrócić błąd 403 przy próbie usunięcia cudzej wiadomości
     */
    public function test_delete_message_denies_deleting_other_user_message(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->provider->id,
            'body' => 'Wiadomość od providera',
        ]);

        Sanctum::actingAs($this->customer);

        $response = $this->deleteJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}");

        $response->assertStatus(403)
            ->assertJson(['error' => 'Możesz usunąć tylko własne wiadomości']);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
        ]);
    }
}
