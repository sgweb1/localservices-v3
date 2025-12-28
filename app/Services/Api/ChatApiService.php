<?php

namespace App\Services\Api;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service do obsługi API chatu
 */
class ChatApiService
{
    /**
     * Pobierz rozmowy dla użytkownika
     */
    public function listConversations(int $userId, array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 20, 50);
        $page = max($filters['page'] ?? 1, 1);
        $showHidden = isset($filters['show_hidden']) && $filters['show_hidden'];

        $query = Conversation::where(function ($q) use ($userId) {
            $q->where('customer_id', $userId)
                ->orWhere('provider_id', $userId);
        });

        // Filtruj ukryte/aktywne konwersacje
        if ($showHidden) {
            // Pokaż tylko ukryte
            $query->where(function ($q) use ($userId) {
                $q->where(function ($q2) use ($userId) {
                    $q2->where('customer_id', $userId)->whereNotNull('hidden_by_customer_at');
                })->orWhere(function ($q3) use ($userId) {
                    $q3->where('provider_id', $userId)->whereNotNull('hidden_by_provider_at');
                });
            });
        } else {
            // Pokaż tylko aktywne (nieukryte)
            $query->where(function ($q) use ($userId) {
                $q->where(function ($q2) use ($userId) {
                    $q2->where('customer_id', $userId)->whereNull('hidden_by_customer_at');
                })->orWhere(function ($q3) use ($userId) {
                    $q3->where('provider_id', $userId)->whereNull('hidden_by_provider_at');
                });
            });
        }

        // Sortowanie (ostatnie wiadomości na górze)
        $sortBy = $filters['sort_by'] ?? 'last_message_at';
        $sortOrderRaw = $filters['sort_order'] ?? 'desc';
        $sortOrder = in_array($sortOrderRaw, ['asc', 'desc']) ? $sortOrderRaw : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Eager load
        $query->with(['customer', 'provider', 'lastMessage', 'messages']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pobierz wiadomości z rozmowy
     */
    public function listMessages(int $conversationId, int $userId, array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 50, 100);
        $page = max($filters['page'] ?? 1, 1);

        $query = Message::withTrashed()
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc');

        // Eager load
        $query->with(['sender', 'attachments']);

        $result = $query->paginate($perPage, ['*'], 'page', $page);

        // Oznacz wiadomości jako przeczytane
        Message::where('conversation_id', $conversationId)
            // sent_at nie istnieje w naszej tabeli messages; korzystamy z created_at
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $result;
    }

    /**
     * Pobierz jedną rozmowę
     */
    public function getConversation(int $conversationId, int $userId): ?Conversation
    {
        return Conversation::where(function ($q) use ($userId) {
            $q->where('customer_id', $userId)
                ->orWhere('provider_id', $userId);
        })
            ->with(['customer', 'provider', 'messages'])
            ->find($conversationId);
    }

    /**
     * Pobierz niezrzuczone wiadomości dla użytkownika
     */
    public function getUnreadCount(int $userId): int
    {
        return Message::whereIn('conversation_id', function ($q) use ($userId) {
            $q->select('id')->from('conversations')
                ->where(function ($q) use ($userId) {
                    $q->where('customer_id', $userId)
                        ->orWhere('provider_id', $userId);
                });
        })
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Oznacz konwersację jako przeczytaną dla danego użytkownika
     */
    public function markConversationAsRead(int $conversationId, int $userId): void
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new ModelNotFoundException('Conversation not found');
        }

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->markAsRead($userId);
    }

    /**
     * Wyślij wiadomość w konwersacji z opcjonalnymi załącznikami
     */
    public function sendMessage(int $conversationId, int $userId, string $body = '', array $attachments = []): Message
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new ModelNotFoundException('Conversation not found');
        }

        // Utwórz wiadomość
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'body' => $body,
        ]);

        // Prześlij załączniki
        if (!empty($attachments)) {
            foreach ($attachments as $file) {
                $path = $file->store('messages/' . $conversationId, 'public');

                $message->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Ładuj relacje
        $message->load(['sender', 'attachments']);

        // Broadcast event
        \App\Events\MessageSent::dispatch($message);

        // Dodatkowo wyślij powiadomienie toast do uczestników rozmowy
        // aby frontend mógł zareagować (np. zainwalidować cache React Query)
        if ($conversation) {
            // Określ odbiorców (drugi uczestnik oraz nadawca)
            $recipientId = $message->sender_id === $conversation->customer_id
                ? (int) $conversation->provider_id
                : (int) $conversation->customer_id;

            // Wyślij do odbiorcy
            \App\Events\NotificationToastEvent::dispatch(
                userId: $recipientId,
                title: 'Nowa wiadomość',
                message: mb_substr($message->body ?? '', 0, 140),
                type: 'info',
                actionUrl: '/provider/messages?conv=' . $conversationId,
                metadata: [
                    'event' => 'message.sent',
                    'conversation_id' => $conversationId,
                    'sender_id' => $message->sender_id,
                    'preview' => mb_substr($message->body ?? '', 0, 60),
                ],
            );

            // Opcjonalnie: wyślij także do nadawcy (aby odświeżyć jego listy bez dodatkowego requestu)
            \App\Events\NotificationToastEvent::dispatch(
                userId: (int) $message->sender_id,
                title: 'Wiadomość wysłana',
                message: mb_substr($message->body ?? '', 0, 140),
                type: 'success',
                actionUrl: '/provider/messages?conv=' . $conversationId,
                metadata: [
                    'event' => 'message.sent',
                    'conversation_id' => $conversationId,
                    'sender_id' => $message->sender_id,
                    'preview' => mb_substr($message->body ?? '', 0, 60),
                ],
            );
        }

        return $message;
    }

    /**
     * Usuń wiadomość
     */
    public function deleteMessage(int $conversationId, int $messageId, int $userId): void
    {
        $message = Message::where('id', $messageId)
            ->where('conversation_id', $conversationId)
            ->first();

        if (!$message) {
            throw new ModelNotFoundException('Message not found');
        }

        if ($message->sender_id !== $userId) {
            throw new \Exception('Brak uprawnień');
        }

        // Usuń załączniki
        $message->attachments()->delete();
        
        // Usuń wiadomość
        $message->delete();
    }

    /**
     * Ukryj konwersację dla użytkownika
     */
    public function hideConversation(int $conversationId, int $userId): void
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new ModelNotFoundException('Conversation not found');
        }

        if ($conversation->customer_id !== $userId && $conversation->provider_id !== $userId) {
            throw new \Exception('Brak uprawnień');
        }

        $conversation->hideFor($userId);
    }

    /**
     * Pokaż ukrytą konwersację dla użytkownika
     */
    public function unhideConversation(int $conversationId, int $userId): void
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new ModelNotFoundException('Conversation not found');
        }

        if ($conversation->customer_id !== $userId && $conversation->provider_id !== $userId) {
            throw new \Exception('Brak uprawnień');
        }

        $conversation->unhideFor($userId);
    }
}
