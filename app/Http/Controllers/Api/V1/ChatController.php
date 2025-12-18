<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Services\Api\ChatApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla chatu
 */
class ChatController extends Controller
{
    public function __construct(private ChatApiService $service)
    {
    }

    /**
     * GET /api/v1/conversations
     * Lista rozmów dla zalogowanego użytkownika
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'sort_by' => 'string|in:updated_at,created_at',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $conversations = $this->service->listConversations($userId, $validated);

        return response()->json([
            'data' => ConversationResource::collection($conversations),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
                'last_page' => $conversations->lastPage(),
                'unread_count' => $this->service->getUnreadCount($userId),
            ],
        ]);
    }

    /**
     * GET /api/v1/conversations/{conversationId}
     * Szczegóły rozmowy
     */
    public function show(int $conversationId): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        $conversation = $this->service->getConversation($conversationId, $userId);

        if (!$conversation) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        }

        return response()->json(['data' => new ConversationResource($conversation)]);
    }

    /**
     * GET /api/v1/conversations/{conversationId}/messages
     * Wiadomości z rozmowy
     */
    public function messages(int $conversationId, Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
        ]);

        $messages = $this->service->listMessages($conversationId, $userId, $validated);

        return response()->json([
            'data' => MessageResource::collection($messages),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/unread-count
     * Liczba nieprzeczytanych wiadomości
     */
    public function unreadCount(): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        return response()->json([
            'data' => [
                'unread_count' => $this->service->getUnreadCount($userId),
            ],
        ]);
    }
}
