<?php

namespace App\Services;

use App\Models\NotificationEvent;
use App\Models\NotificationTemplate;
use App\Models\NotificationLog;
use App\Models\UserNotificationPreference;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * NotificationService - Serwis do wysyłania powiadomień
 * 
 * Obsługuje wszystkie kanały powiadomień (toast, database, email, push)
 * z uwzględnieniem preferencji użytkowników
 */
class NotificationService
{
    /**
     * Wyślij powiadomienie do użytkownika
     * 
     * @param string $eventKey - Klucz eventu np. 'booking.created'
     * @param User $user - Odbiorca
     * @param string $recipientType - 'customer', 'provider', 'admin'
     * @param array $variables - Zmienne do interpolacji np. ['customer_name' => 'Jan']
     * @return bool - Czy wysłano pomyślnie
     */
    public function send(string $eventKey, User $user, string $recipientType, array $variables): bool
    {
        try {
            // Znajdź event
            $event = NotificationEvent::findByKey($eventKey);
            if (!$event) {
                Log::warning("Notification event not found: {$eventKey}");
                return false;
            }

            // Znajdź szablon
            $template = NotificationTemplate::where('event_id', $event->id)
                ->where('recipient_type', $recipientType)
                ->where('is_active', true)
                ->first();

            if (!$template) {
                Log::warning("Notification template not found for event: {$eventKey}, recipient: {$recipientType}");
                return false;
            }

            // Pobierz preferencje użytkownika
            $preferences = UserNotificationPreference::where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->first();

            // Inicjalizuj log
            $log = NotificationLog::create([
                'notification_event_id' => $event->id,
                'notification_template_id' => $template->id,
                'user_id' => $user->id,
                'recipient_type' => $recipientType,
                'event_key' => $eventKey,
                'data' => $variables,
                'channels_sent' => [],
            ]);

            $channelsResult = [];

            // Wyślij przez każdy włączony kanał
            if ($this->shouldSendChannel('toast', $template, $preferences)) {
                $channelsResult['toast'] = $this->sendToast($template, $variables);
            }

            if ($this->shouldSendChannel('database', $template, $preferences)) {
                $channelsResult['database'] = $this->sendDatabase($template, $user, $variables);
            }

            if ($this->shouldSendChannel('email', $template, $preferences)) {
                $channelsResult['email'] = $this->sendEmail($template, $user, $variables);
            }

            if ($this->shouldSendChannel('push', $template, $preferences)) {
                $channelsResult['push'] = $this->sendPush($template, $user, $variables);
            }

            // Zapisz rezultat
            $success = collect($channelsResult)->contains(fn($result) => $result === true);
            if ($success) {
                $log->markAsSent($channelsResult);
            } else {
                $log->markAsFailed('All channels failed', $channelsResult);
            }

            return $success;

        } catch (\Exception $e) {
            Log::error("Notification send error: " . $e->getMessage(), [
                'event_key' => $eventKey,
                'user_id' => $user->id,
                'exception' => $e,
            ]);
            return false;
        }
    }

    /**
     * Sprawdza czy należy wysłać przez dany kanał
     */
    private function shouldSendChannel(string $channel, NotificationTemplate $template, ?UserNotificationPreference $preferences): bool
    {
        // Sprawdź czy template ma włączony kanał
        if (!$template->isChannelEnabled($channel)) {
            return false;
        }

        // Jeśli user nie skonfigurował preferencji, użyj domyślnych (wszystkie włączone)
        if (!$preferences) {
            return true;
        }

        // Sprawdź czy user ma włączony ten kanał
        $property = $channel . '_enabled';
        return $preferences->$property ?? false;
    }

    /**
     * Wyślij toast notification (zwraca dane do frontendu)
     */
    private function sendToast(NotificationTemplate $template, array $variables): bool
    {
        if (!$template->toast_enabled) {
            return false;
        }

        // Toast będzie wysłany jako część response API
        // Zapisujemy tylko info że powinien być wysłany
        return true;
    }

    /**
     * Wyślij database notification (in-app)
     */
    private function sendDatabase(NotificationTemplate $template, User $user, array $variables): bool
    {
        if (!$template->database_enabled) {
            return false;
        }

        try {
            $user->notifications()->create([
                'type' => 'App\\Notifications\\DatabaseNotification',
                'data' => [
                    'title' => $template->interpolate($template->database_title ?? '', $variables),
                    'body' => $template->interpolate($template->database_body ?? '', $variables),
                    'action_url' => $template->interpolate($template->database_action_url ?? '', $variables),
                ],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("Database notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Wyślij email
     */
    private function sendEmail(NotificationTemplate $template, User $user, array $variables): bool
    {
        if (!$template->email_enabled || !$user->email) {
            return false;
        }

        try {
            // TODO: Implementacja wysyłania emaili (Mail facade)
            // Mail::to($user->email)->send(new NotificationMail($template, $variables));
            return true;
        } catch (\Exception $e) {
            Log::error("Email notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Wyślij push notification
     */
    private function sendPush(NotificationTemplate $template, User $user, array $variables): bool
    {
        if (!$template->push_enabled) {
            return false;
        }

        try {
            // TODO: Implementacja push notifications (FCM, etc.)
            return true;
        } catch (\Exception $e) {
            Log::error("Push notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Pobierz dane toast notification dla response
     */
    public function getToastData(string $eventKey, string $recipientType, array $variables): ?array
    {
        $event = NotificationEvent::findByKey($eventKey);
        if (!$event) {
            return null;
        }

        $template = NotificationTemplate::where('event_id', $event->id)
            ->where('recipient_type', $recipientType)
            ->where('is_active', true)
            ->where('toast_enabled', true)
            ->first();

        if (!$template) {
            return null;
        }

        return [
            'type' => $template->toast_type,
            'title' => $template->interpolate($template->toast_title ?? '', $variables),
            'message' => $template->interpolate($template->toast_message ?? '', $variables),
            'duration' => $template->toast_duration ?? 5,
        ];
    }
}
