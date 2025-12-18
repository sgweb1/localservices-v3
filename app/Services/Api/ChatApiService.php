<?php

namespace App\Services\Api;

use App\Models\Conversation;
use App\Models\Message;
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

        $query = Conversation::where(function ($q) use ($userId) {
            $q->where('customer_id', $userId)
                ->orWhere('provider_id', $userId);
        });

        // Sortowanie (ostatnie wiadomości na górze)
        $sortBy = $filters['sort_by'] ?? 'updated_at';
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

        $query = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc');

        // Eager load
        $query->with(['sender']);

        $result = $query->paginate($perPage, ['*'], 'page', $page);

        // Oznacz wiadomości jako przeczytane
        Message::where('conversation_id', $conversationId)
            ->whereNotNull('sent_at')
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
}
