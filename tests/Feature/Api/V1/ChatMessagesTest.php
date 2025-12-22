<?php

namespace Tests\Feature\Api\V1;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Comprehensive testy API chatu - messages, presence, online status
 */
class ChatMessagesTest extends TestCase
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

    /** Test: Send message updates last_seen_at */
    public function test_send_message_updates_last_seen_at(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $this->customer->update(['last_seen_at' => now()->subMinutes(10)]);
        $before = $this->customer->fresh()->last_seen_at;

        $this->actingAs($this->customer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'Test message',
            ]);

        sleep(1);
        $after = $this->customer->fresh()->last_seen_at;

        $this->assertGreaterThan($before, $after);
    }

    /** Test: Get conversation updates last_seen_at */
    public function test_get_conversation_updates_last_seen_at(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $this->customer->update(['last_seen_at' => now()->subMinutes(10)]);
        $before = $this->customer->fresh()->last_seen_at;

        sleep(1);
        $this->actingAs($this->customer)
            ->getJson("/api/v1/conversations/{$conversation->id}");

        $after = $this->customer->fresh()->last_seen_at;

        $this->assertGreaterThan($before, $after);
    }

    /** Test: is_online status is true when user was active recently */
    public function test_is_online_true_when_recently_active(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $this->provider->update(['last_seen_at' => now()]);

        $this->actingAs($this->customer)
            ->getJson("/api/v1/conversations/{$conversation->id}")
            ->assertJson([
                'data' => [
                    'other_user' => [
                        'is_online' => true,
                    ],
                ],
            ]);
    }

    /** Test: is_online status is false when user inactive > 30 seconds */
    public function test_is_online_false_when_inactive(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $this->provider->update(['last_seen_at' => now()->subSeconds(31)]);

        $this->actingAs($this->customer)
            ->getJson("/api/v1/conversations/{$conversation->id}")
            ->assertJson([
                'data' => [
                    'other_user' => [
                        'is_online' => false,
                    ],
                ],
            ]);
    }

    /** Test: Messages are paginated correctly */
    public function test_messages_are_paginated(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        // Create 25 messages
        for ($i = 0; $i < 25; $i++) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $i % 2 === 0 ? $this->customer->id : $this->provider->id,
                'body' => "Message {$i}",
            ]);
        }

        $this->actingAs($this->customer)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages?per_page=10")
            ->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJson([
                'meta' => [
                    'total' => 25,
                    'current_page' => 1,
                    'per_page' => 10,
                ],
            ]);
    }

    /** Test: Send message with attachment includes file info */
    public function test_send_message_with_attachment(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $file = \Illuminate\Http\UploadedFile::fake()->image('photo.jpg', 640, 480);

        $this->actingAs($this->customer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'Check this photo',
                'attachments' => [$file],
            ])
            ->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'body',
                    'attachments' => ['*' => ['id', 'file_name', 'url']],
                ],
            ])
            ->assertJson([
                'data' => [
                    'body' => 'Check this photo',
                ],
            ]);
    }

    /** Test: Delete message soft-deletes and shows in database as soft-deleted */
    public function test_delete_message_soft_deletes(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->customer->id,
            'body' => 'Message to delete',
        ]);

        $this->actingAs($this->customer)
            ->deleteJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}")
            ->assertStatus(200);

        // Verify soft delete
        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }

    /** Test: Cannot delete other user's message */
    public function test_cannot_delete_other_user_message(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->provider->id,
            'body' => 'Provider message',
        ]);

        $this->actingAs($this->customer)
            ->deleteJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}")
            ->assertStatus(403);

        // Verify not deleted
        $this->assertDatabaseHas('messages', ['id' => $message->id, 'deleted_at' => null]);
    }

    /** Test: other_user field contains correct user data */
    public function test_conversation_other_user_field(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        // From customer perspective
        $this->actingAs($this->customer)
            ->getJson("/api/v1/conversations/{$conversation->id}")
            ->assertJson([
                'data' => [
                    'other_user' => [
                        'id' => $this->provider->id,
                        'name' => $this->provider->name,
                    ],
                ],
            ]);

        // From provider perspective
        $this->actingAs($this->provider)
            ->getJson("/api/v1/conversations/{$conversation->id}")
            ->assertJson([
                'data' => [
                    'other_user' => [
                        'id' => $this->customer->id,
                        'name' => $this->customer->name,
                    ],
                ],
            ]);
    }

    /** Test: Messages endpoint requires authentication */
    public function test_messages_requires_authentication(): void
    {
        $conversation = Conversation::create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
        ]);

        $this->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertStatus(401);

        $this->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => 'Test',
        ])
            ->assertStatus(401);
    }

    /** Test: Unread count returns correct number */
    public function test_unread_count_returns_correct_number(): void
    {
        // Create 2 conversations with unread messages
        for ($i = 0; $i < 2; $i++) {
            $prov = User::factory()->provider()->create();
            $conv = Conversation::create([
                'customer_id' => $this->customer->id,
                'provider_id' => $prov->id,
            ]);

            for ($j = 0; $j < 3; $j++) {
                Message::create([
                    'conversation_id' => $conv->id,
                    'sender_id' => $prov->id,
                    'body' => "Message {$j}",
                ]);
            }
        }

        $this->actingAs($this->customer)
            ->getJson('/api/v1/unread-count')
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'unread_count' => 6,
                ],
            ]);
    }
}
