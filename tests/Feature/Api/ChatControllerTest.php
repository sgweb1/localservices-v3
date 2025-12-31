<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testy API dla ChatController - system wiadomości
 * 
 * Testuje:
 * - Pobieranie listy konwersacji
 * - Tworzenie nowych konwersacji
 * - Wysyłanie wiadomości
 * - Oznaczanie jako przeczytane
 * - Ukrywanie konwersacji
 */
class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $provider;
    private User $customer;
    private Conversation $conversation;

    protected function setUp(): void
    {
        parent::setUp();

        // Tworzymy providera i customera
        $this->provider = User::factory()->create([
            'user_type' => 'provider',
            'name' => 'Jan Kowalski',
            'email' => 'provider@test.com',
        ]);

        $this->customer = User::factory()->customer()->create([
            'name' => 'Anna Nowak',
            'email' => 'customer@test.com',
        ]);

        // Tworzymy konwersację między nimi
        $this->conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'subject' => 'Zapytanie o usługę',
            'customer_active' => true,
            'provider_active' => true,
        ]);
    }

    /** @test */
    public function unauthorized_user_cannot_access_conversations()
    {
        $response = $this->getJson('/api/v1/conversations');

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function provider_can_list_their_conversations()
    {
        Sanctum::actingAs($this->provider);

        // Dodajemy kilka wiadomości
        Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Witam, interesuje mnie usługa',
            'is_read' => false,
        ]);

        $response = $this->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'uuid',
                    'customer',
                    'provider',
                    'other_user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'last_message',
                    'last_message_at',
                    'unread_count',
                    'is_hidden_for_current_user',
                    'created_at',
                    'updated_at',
                ],
            ],
            'meta' => [
                'current_page',
                'per_page',
                'total',
                'last_page',
                'unread_count',
            ],
        ]);

        $response->assertJsonPath('data.0.id', $this->conversation->id);
        $response->assertJsonPath('data.0.unread_count', 1);
    }

    /** @test */
    public function customer_can_list_their_conversations()
    {
        Sanctum::actingAs($this->customer);

        $response = $this->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.other_user.name', 'Jan Kowalski');
    }

    /** @test */
    public function can_get_single_conversation_details()
    {
        Sanctum::actingAs($this->provider);

        $response = $this->getJson("/api/v1/conversations/{$this->conversation->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $this->conversation->id);
        $response->assertJsonPath('data.other_user.name', 'Anna Nowak');
    }

    /** @test */
    public function cannot_access_other_users_conversation()
    {
        $otherUser = User::factory()->create();
        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/v1/conversations/{$this->conversation->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function can_create_new_conversation()
    {
        $newCustomer = User::factory()->customer()->create();
        Sanctum::actingAs($newCustomer);

        $response = $this->postJson('/api/v1/conversations', [
            'participant_id' => $this->provider->id,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'uuid',
                'customer',
                'provider',
                'other_user',
                'created_at',
            ],
        ]);

        $this->assertDatabaseHas('conversations', [
            'customer_id' => $newCustomer->id,
            'provider_id' => $this->provider->id,
        ]);
    }

    /** @test */
    public function cannot_create_conversation_with_self()
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson('/api/v1/conversations', [
            'participant_id' => $this->provider->id,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error', 'Nie możesz czatować sam ze sobą');
    }

    /** @test */
    public function can_send_message_in_conversation()
    {
        Sanctum::actingAs($this->customer);

        $response = $this->postJson("/api/v1/conversations/{$this->conversation->id}/messages", [
            'body' => 'Witam, kiedy może Pan przyjechać?',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'uuid',
                'sender_id',
                'body',
                'created_at',
            ],
        ]);
        $response->assertJsonPath('data.body', 'Witam, kiedy może Pan przyjechać?');
        $response->assertJsonPath('data.sender_id', $this->customer->id);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Witam, kiedy może Pan przyjechać?',
        ]);
    }

    /** @test */
    public function can_get_messages_in_conversation()
    {
        Sanctum::actingAs($this->provider);

        // Dodajemy kilka wiadomości
        $msg1 = Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Pierwsza wiadomość',
            'is_read' => false,
        ]);

        $msg2 = Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->provider->id,
            'receiver_id' => $this->customer->id,
            'body' => 'Odpowiedź',
            'is_read' => false,
        ]);

        $response = $this->getJson("/api/v1/conversations/{$this->conversation->id}/messages");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $response->assertJsonPath('data.0.body', 'Pierwsza wiadomość');
        $response->assertJsonPath('data.1.body', 'Odpowiedź');
    }

    /** @test */
    public function can_mark_conversation_as_read()
    {
        Sanctum::actingAs($this->provider);

        // Dodajemy nieprzeczytane wiadomości
        Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Nieprzeczytana wiadomość',
            'is_read' => false,
        ]);

        $response = $this->postJson("/api/v1/conversations/{$this->conversation->id}/mark-read");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'ok');

        // Sprawdzamy czy wiadomości zostały oznaczone jako przeczytane
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $this->conversation->id,
            'receiver_id' => $this->provider->id,
            'is_read' => true,
        ]);
    }

    /** @test */
    public function can_hide_conversation()
    {
        Sanctum::actingAs($this->provider);

        $response = $this->postJson("/api/v1/conversations/{$this->conversation->id}/hide");

        $response->assertStatus(200);

        // Sprawdzamy czy konwersacja została ukryta dla providera
        $this->assertDatabaseHas('conversations', [
            'id' => $this->conversation->id,
            'provider_active' => false,
        ]);
    }

    /** @test */
    public function can_unhide_conversation()
    {
        Sanctum::actingAs($this->provider);

        // Najpierw ukrywamy
        $this->conversation->update(['provider_active' => false]);

        $response = $this->postJson("/api/v1/conversations/{$this->conversation->id}/hide");

        $response->assertStatus(200);

        // Sprawdzamy czy konwersacja została odkryta
        $this->assertDatabaseHas('conversations', [
            'id' => $this->conversation->id,
            'provider_active' => true,
        ]);
    }

    /** @test */
    public function can_delete_own_message()
    {
        Sanctum::actingAs($this->provider);

        $message = Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->provider->id,
            'receiver_id' => $this->customer->id,
            'body' => 'Wiadomość do usunięcia',
            'is_read' => false,
        ]);

        $response = $this->deleteJson("/api/v1/conversations/{$this->conversation->id}/messages/{$message->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'ok');

        $this->assertSoftDeleted('messages', [
            'id' => $message->id,
        ]);
    }

    /** @test */
    public function cannot_delete_other_users_message()
    {
        Sanctum::actingAs($this->provider);

        $message = Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Wiadomość customera',
            'is_read' => false,
        ]);

        $response = $this->deleteJson("/api/v1/conversations/{$this->conversation->id}/messages/{$message->id}");

        $response->assertStatus(403);
        $response->assertJsonPath('error', 'Możesz usunąć tylko własne wiadomości');
    }

    /** @test */
    public function conversation_list_shows_correct_unread_count()
    {
        Sanctum::actingAs($this->provider);

        // Dodajemy 3 nieprzeczytane wiadomości od customera
        for ($i = 1; $i <= 3; $i++) {
            Message::create([
                'conversation_id' => $this->conversation->id,
                'sender_id' => $this->customer->id,
                'receiver_id' => $this->provider->id,
                'body' => "Wiadomość #{$i}",
                'is_read' => false,
            ]);
        }

        // Dodajemy 1 przeczytaną
        Message::create([
            'conversation_id' => $this->conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Przeczytana',
            'is_read' => true,
        ]);

        $response = $this->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $response->assertJsonPath('data.0.unread_count', 3);
        $response->assertJsonPath('meta.unread_count', 3);
    }

    /** @test */
    public function pagination_works_correctly()
    {
        Sanctum::actingAs($this->provider);

        // Tworzymy 15 dodatkowych konwersacji
        for ($i = 1; $i <= 15; $i++) {
            $customer = User::factory()->customer()->create();
            Conversation::create([
                'customer_id' => $customer->id,
                'provider_id' => $this->provider->id,
                'subject' => "Konwersacja #{$i}",
                'customer_active' => true,
                'provider_active' => true,
            ]);
        }

        // Pobieramy pierwszą stronę (domyślnie 10 na stronę)
        $response = $this->getJson('/api/v1/conversations?per_page=10');

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
        $response->assertJsonPath('meta.total', 16); // 1 z setUp + 15 nowych
        $response->assertJsonPath('meta.last_page', 2);
        $response->assertJsonPath('meta.current_page', 1);

        // Pobieramy drugą stronę
        $response2 = $this->getJson('/api/v1/conversations?per_page=10&page=2');

        $response2->assertStatus(200);
        $response2->assertJsonCount(6, 'data');
        $response2->assertJsonPath('meta.current_page', 2);
    }

    /** @test */
    public function hidden_conversations_are_filtered_correctly()
    {
        Sanctum::actingAs($this->provider);

        // Ukrywamy konwersację
        $this->conversation->update(['provider_active' => false]);

        // Bez show_hidden - nie powinno być widoczne
        $response1 = $this->getJson('/api/v1/conversations');
        $response1->assertStatus(200);
        $response1->assertJsonCount(0, 'data');

        // Z show_hidden=1 - powinno być widoczne
        $response2 = $this->getJson('/api/v1/conversations?show_hidden=1');
        $response2->assertStatus(200);
        $response2->assertJsonCount(1, 'data');
        $response2->assertJsonPath('data.0.is_hidden_for_current_user', true);
    }
}
