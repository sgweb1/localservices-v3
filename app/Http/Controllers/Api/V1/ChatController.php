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
            'show_hidden' => 'boolean',
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

        // Aktualizuj last_seen_at dla zalogowanego użytkownika
        $user = auth()->user();
        $user->timestamps = false;
        $user->last_seen_at = now();
        $user->save();
        $user->timestamps = true;

        $conversation = $this->service->getConversation($conversationId, $userId);

        if (!$conversation) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        }

        return response()->json(['data' => new ConversationResource($conversation)]);
    }

    /**
     * POST /api/v1/conversations
     * Utwórz lub pobierz konwersację z innym użytkownikiem
     */
    public function store(Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        $validated = $request->validate([
            'participant_id' => 'required|integer|exists:users,id',
            'booking_id' => 'nullable|integer|exists:bookings,id',
            'message' => 'nullable|string|max:5000', // Opcjonalna pierwsza wiadomość
        ]);

        $participantId = $validated['participant_id'];
        
        // Blokada self-chat
        if ($participantId === $userId) {
            return response()->json(['error' => 'Nie możesz czatować sam ze sobą'], 400);
        }

        // Określ kto jest customer a kto provider
        $currentUser = auth()->user();
        $participant = \App\Models\User::findOrFail($participantId);
        
        // Sprawdź role użytkowników
        $isCurrentProvider = $currentUser->hasRole('provider');
        $isParticipantProvider = $participant->hasRole('provider');
        
        // Ustal customer_id i provider_id
        if ($isCurrentProvider && !$isParticipantProvider) {
            $customerId = $participantId;
            $providerId = $userId;
        } elseif (!$isCurrentProvider && $isParticipantProvider) {
            $customerId = $userId;
            $providerId = $participantId;
        } else {
            return response()->json(['error' => 'Konwersacja musi być między customer a provider'], 400);
        }

        // Utwórz lub pobierz istniejącą konwersację
        $conversation = \App\Models\Conversation::firstOrCreate(
            [
                'customer_id' => $customerId,
                'provider_id' => $providerId,
            ],
            [
                'booking_id' => $validated['booking_id'] ?? null,
            ]
        );

        // Jeśli podano booking_id, zaktualizuj konwersację
        if (($validated['booking_id'] ?? null) && !$conversation->booking_id) {
            $conversation->update(['booking_id' => $validated['booking_id']]);
        }

        // Jeśli podano wiadomość, wyślij ją
        if (!empty($validated['message'])) {
            try {
                $this->service->sendMessage(
                    $conversation->id,
                    $userId,
                    $validated['message'],
                    []
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send initial message', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['data' => new ConversationResource($conversation)], 201);
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
     * POST /api/v1/conversations/{conversationId}/messages
     * Wyślij nową wiadomość z opcjonalnymi załącznikami
     */
    public function sendMessage(int $conversationId, Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        // Aktualizuj last_seen_at dla zalogowanego użytkownika
        $user = auth()->user();
        $user->timestamps = false;
        $user->last_seen_at = now();
        $user->save();
        $user->timestamps = true;

        $validated = $request->validate([
            'body' => 'required_without:attachments|string|max:5000',
            'attachments.*' => 'nullable|file|max:2048', // 2MB per file
        ], [
            'body.required_without' => 'Napisz wiadomość lub dodaj załącznik',
            'body.string' => 'Wiadomość musi być tekstem',
            'body.max' => 'Wiadomość nie może mieć więcej niż 5000 znaków',
            'attachments.*.file' => 'Każdy załącznik musi być plikiem',
            'attachments.*.max' => 'Każdy plik nie może przekroczyć 2 MB',
        ]);

        try {
            $attachments = $request->file('attachments') ?? [];
            $message = $this->service->sendMessage(
                $conversationId,
                $userId,
                $validated['body'] ?? '',
                $attachments
            );
            return response()->json(['data' => new MessageResource($message)], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        }
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

    /**
     * POST /api/v1/conversations/{conversationId}/mark-read
     * Oznacz konwersację jako przeczytaną
     */
    public function markAsRead(int $conversationId): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        try {
            $this->service->markConversationAsRead($conversationId, $userId);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * DELETE /api/v1/conversations/{conversationId}/messages/{messageId}
     * Usuń własną wiadomość
     */
    public function deleteMessage(int $conversationId, int $messageId): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        try {
            $this->service->deleteMessage($conversationId, $messageId, $userId);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Wiadomość nie znaleziona'], 404);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Brak uprawnień') {
                return response()->json(['error' => 'Możesz usunąć tylko własne wiadomości'], 403);
            }
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * POST /api/v1/conversations/{conversationId}/hide
     * Ukryj konwersację dla zalogowanego użytkownika
     */
    public function hideConversation(int $conversationId): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        try {
            $this->service->hideConversation($conversationId, $userId);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Brak uprawnień') {
                return response()->json(['error' => 'Nie masz dostępu do tej rozmowy'], 403);
            }
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * POST /api/v1/conversations/{conversationId}/unhide
     * Pokaż ukrytą konwersację dla zalogowanego użytkownika
     */
    public function unhideConversation(int $conversationId): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        try {
            $this->service->unhideConversation($conversationId, $userId);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Rozmowa nie znaleziona'], 404);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Brak uprawnień') {
                return response()->json(['error' => 'Nie masz dostępu do tej rozmowy'], 403);
            }
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json(['status' => 'ok']);
    }
}