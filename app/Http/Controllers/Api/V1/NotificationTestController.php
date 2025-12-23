<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NotificationEvent;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTestController extends Controller
{
    /**
     * Wyślij testowe powiadomienie dla danego kanału
     * 
     * POST /api/v1/notifications/{eventId}/test
     */
    public function test(Request $request, int $eventId): JsonResponse
    {
        if (!app()->isLocal()) {
            return response()->json([
                'success' => false,
                'message' => 'Test notifications only available in development',
            ], 403);
        }

        $validated = $request->validate([
            'channel' => 'required|in:email,toast,push,database',
        ]);

        $user = $request->user();
        $event = NotificationEvent::findOrFail($eventId);

        $channel = $validated['channel'];

        try {
            // Utwórz testowe powiadomienie na podstawie kanału
            $toastPayload = null;
            match ($channel) {
                'email' => $this->sendTestEmail($user, $event),
                'toast' => $toastPayload = [
                    'type' => 'success',
                    'title' => '🔔 Testowe powiadomienie',
                    'message' => "To jest testowe powiadomienie dla wydarzenia: {$event->name}",
                ],
                'push' => $this->sendTestPush($user, $event),
                'database' => $this->createDatabaseNotification($user, $event),
                default => null,
            };

            return response()->json([
                'success' => true,
                'message' => "Testowe powiadomienie wysłane na kanał: {$channel}",
                'toast' => $toastPayload,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Błąd wysyłania: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function sendTestEmail($user, $event): void
    {
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "To jest testowe powiadomienie dla eventu: {$event->name}\n\n" .
                "Wysłano: " . now()->format('Y-m-d H:i:s') . "\n\n" .
                "Ta wiadomość potwierdza, że kanał email działa prawidłowo.",
                function ($message) use ($user, $event) {
                    $message->to($user->email)
                        ->subject('[TEST] ' . $event->name);
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Email test error: ' . $e->getMessage());
        }
    }

    private function sendTestPush($user, $event): void
    {
        try {
            // Check if VAPID keys are configured
            if (!config('broadcasting.notifications.push.public_key') || 
                !config('broadcasting.notifications.push.private_key')) {
                \Illuminate\Support\Facades\Log::warning('VAPID keys not configured for push notifications');
                return;
            }

            $subscriptions = $user->pushSubscriptions;
            if ($subscriptions->isEmpty()) {
                return;
            }

            $webPush = new \Minishlink\WebPush\WebPush([
                'VAPID' => [
                    'subject' => config('broadcasting.notifications.push.subject'),
                    'publicKey' => config('broadcasting.notifications.push.public_key'),
                    'privateKey' => config('broadcasting.notifications.push.private_key'),
                ],
            ]);

            foreach ($subscriptions as $subscription) {
                $webPush->queueNotification(
                    \Minishlink\WebPush\Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'keys' => [
                            'p256dh' => $subscription->p256dh_key,
                            'auth' => $subscription->auth_key,
                        ],
                    ]),
                    \json_encode([
                        'title' => 'Test: ' . $event->name,
                        'body' => 'To jest testowe powiadomienie',
                        'icon' => asset('favicon.png'),
                        'tag' => 'test-notification',
                        'data' => ['event' => $event->key],
                    ])
                );
            }

            // Send all queued notifications
            $results = $webPush->flush();
            
            // Log results
            foreach ($results as $result) {
                if (!$result->isSuccess()) {
                    \Illuminate\Support\Facades\Log::error('Push notification failed', [
                        'endpoint' => $result->getEndpoint(),
                        'reason' => $result->getReason(),
                        'expired' => $result->isSubscriptionExpired(),
                    ]);
                } else {
                    \Illuminate\Support\Facades\Log::info('Push notification sent successfully', [
                        'endpoint' => $result->getEndpoint(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Push test error: ' . $e->getMessage());
        }
    }

    private function createDatabaseNotification($user, $event): void
    {
        \App\Models\NotificationLog::create([
            'user_id' => $user->id,
            'notification_event_id' => $event->id,
            'title' => 'Test: ' . $event->name,
            'body' => 'To jest testowe powiadomienie',
            'data' => json_encode(['test' => true]),
            'channels_sent' => json_encode(['database']),
            'is_read' => false,
        ]);
    }
}
