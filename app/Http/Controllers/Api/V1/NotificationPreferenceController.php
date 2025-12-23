<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NotificationEvent;
use App\Models\UserNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Get user notification preferences for all events
     * 
     * GET /api/v1/notification-preferences
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get all events (remove is_active filter to see all)
        $events = NotificationEvent::with('templates')->orderBy('key')->get();
        
        $preferences = [];
        
        foreach ($events as $event) {
            $userPref = UserNotificationPreference::where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->first();
            
            $preferences[] = [
                'event_id' => $event->id,
                'event_key' => $event->key,
                'event_name' => $event->name,
                'is_active' => $event->is_active,
                'channels' => [
                    'email' => $userPref?->email_enabled ?? true,
                    'toast' => $userPref?->toast_enabled ?? true,
                    'push' => $userPref?->push_enabled ?? true,
                    'database' => $userPref?->database_enabled ?? true,
                ],
                'quiet_hours_enabled' => $userPref?->quiet_hours_enabled ?? false,
                'quiet_hours_start' => $userPref?->quiet_hours_start ?? '22:00',
                'quiet_hours_end' => $userPref?->quiet_hours_end ?? '08:00',
                'frequency' => $userPref?->frequency ?? 'instant',
                'batch_enabled' => $userPref?->batch_enabled ?? false,
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    /**
     * Update notification preferences for specific event
     * 
     * PUT /api/v1/notification-preferences/{eventId}
     */
    public function update(Request $request, int $eventId): JsonResponse
    {
        $validated = $request->validate([
            'channels.email' => 'boolean',
            'channels.toast' => 'boolean',
            'channels.push' => 'boolean',
            'channels.database' => 'boolean',
            'quiet_hours_enabled' => 'boolean',
            'quiet_hours_start' => 'nullable|string',
            'quiet_hours_end' => 'nullable|string',
            'frequency' => 'nullable|in:instant,hourly,daily,weekly,off',
            'batch_enabled' => 'boolean',
        ]);

        $user = $request->user();
        $event = NotificationEvent::findOrFail($eventId);

        // Normalize time format (HH:MM:SS -> HH:MM)
        $quietHoursStart = null;
        $quietHoursEnd = null;
        
        if (!empty($validated['quiet_hours_start'])) {
            $quietHoursStart = substr($validated['quiet_hours_start'], 0, 5);
        }
        if (!empty($validated['quiet_hours_end'])) {
            $quietHoursEnd = substr($validated['quiet_hours_end'], 0, 5);
        }

        $preference = UserNotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $event->id,
            ],
            [
                'email_enabled' => $validated['channels']['email'] ?? true,
                'toast_enabled' => $validated['channels']['toast'] ?? true,
                'push_enabled' => $validated['channels']['push'] ?? true,
                'database_enabled' => $validated['channels']['database'] ?? true,
                'quiet_hours_enabled' => $validated['quiet_hours_enabled'] ?? false,
                'quiet_hours_start' => $quietHoursStart,
                'quiet_hours_end' => $quietHoursEnd,
                'frequency' => $validated['frequency'] ?? 'instant',
                'batch_enabled' => $validated['batch_enabled'] ?? false,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferencje zaktualizowane',
            'data' => [
                'event_id' => $event->id,
                'event_key' => $event->key,
                'channels' => [
                    'email' => $preference->email_enabled,
                    'toast' => $preference->toast_enabled,
                    'push' => $preference->push_enabled,
                    'database' => $preference->database_enabled,
                ],
                'quiet_hours_enabled' => $preference->quiet_hours_enabled,
                'quiet_hours_start' => $preference->quiet_hours_start,
                'quiet_hours_end' => $preference->quiet_hours_end,
                'frequency' => $preference->frequency,
                'batch_enabled' => $preference->batch_enabled,
            ],
        ]);
    }

    /**
     * Reset all preferences to defaults
     * 
     * POST /api/v1/notification-preferences/reset
     */
    public function reset(Request $request): JsonResponse
    {
        $user = $request->user();
        
        UserNotificationPreference::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Preferencje przywrócone do domyślnych',
        ]);
    }
}
