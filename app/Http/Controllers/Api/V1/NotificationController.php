<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Lista powiadomień użytkownika
     * 
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = min((int) $request->input('per_page', 20), 100);
            $onlyUnread = $request->boolean('unread');

            $query = NotificationLog::query()
                ->forUser(auth()->id())
                ->where('success', true)
                ->with(['event', 'template'])
                ->latest('created_at');

            if ($onlyUnread) {
                $query->unread();
            }

            $notifications = $query->paginate($perPage);

            return response()->json([
                'data' => $notifications->items(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'last_page' => $notifications->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            // Fallback jeśli tabela nie istnieje
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'last_page' => 1,
                ],
            ]);
        }
    }

    /**
     * Liczba nieprzeczytanych powiadomień
     * 
     * GET /api/v1/notifications/unread-count
     */
    public function unreadCount(): JsonResponse
    {
        try {
            $count = NotificationLog::query()
                ->forUser(auth()->id())
                ->unread()
                ->where('success', true)
                ->count();
        } catch (\Exception $e) {
            // Fallback jeśli tabela nie istnieje (np. migracje nie zostały uruchomione)
            $count = 0;
        }

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Oznacz powiadomienie jako przeczytane
     * 
     * PUT /api/v1/notifications/{id}/read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $notification = NotificationLog::query()
            ->forUser(auth()->id())
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['message' => 'Powiadomienie oznaczone jako przeczytane']);
    }

    /**
     * Oznacz wszystkie powiadomienia jako przeczytane
     * 
     * PUT /api/v1/notifications/read-all
     */
    public function markAllAsRead(): JsonResponse
    {
        try {
            $updated = NotificationLog::query()
                ->forUser(auth()->id())
                ->unread()
                ->update([
                    'read' => true,
                    'read_at' => now(),
                ]);
        } catch (\Exception $e) {
            // Fallback jeśli tabela nie istnieje
            $updated = 0;
        }

        return response()->json([
            'message' => 'Wszystkie powiadomienia oznaczone jako przeczytane',
            'updated' => $updated,
        ]);
    }

    /**
     * Szczegóły powiadomienia
     * 
     * GET /api/v1/notifications/{id}
     */
    public function show(int $id): JsonResponse
    {
        $notification = NotificationLog::query()
            ->forUser(auth()->id())
            ->with(['event', 'template'])
            ->findOrFail($id);

        // Auto-oznacz jako przeczytane przy otwarciu
        $notification->markAsRead();

        return response()->json(['data' => $notification]);
    }
}
