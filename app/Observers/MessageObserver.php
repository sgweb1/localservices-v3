<?php

namespace App\Observers;

use App\Models\Message;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Support\Str;

class MessageObserver
{
    public function __construct(private NotificationDispatcher $notifications)
    {
    }

    public function created(Message $message): void
    {
        $conversation = $message->conversation;

        if (!$conversation) {
            return;
        }

        $recipient = null;
        $recipientType = 'user';

        if ($message->sender_id === $conversation->customer_id && $conversation->provider) {
            $recipient = $conversation->provider;
            $recipientType = 'provider';
        } elseif ($message->sender_id === $conversation->provider_id && $conversation->customer) {
            $recipient = $conversation->customer;
            $recipientType = 'customer';
        } elseif ($conversation->customer && $message->sender_id !== $conversation->customer_id) {
            $recipient = $conversation->customer;
            $recipientType = 'customer';
        } elseif ($conversation->provider && $message->sender_id !== $conversation->provider_id) {
            $recipient = $conversation->provider;
            $recipientType = 'provider';
        }

        if (!$recipient) {
            return;
        }

        $this->notifications->send(
            'message.received',
            $recipient,
            $recipientType,
            [
                'sender_name' => $message->sender?->name ?? '',
                'message_preview' => Str::limit((string) $message->body, 120),
                'conversation_id' => $message->conversation_id,
                'message_id' => $message->id,
            ],
        );
    }
}
