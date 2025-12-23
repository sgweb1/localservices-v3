<?php

namespace App\Services\Notifications;

use App\Models\User;
use App\Models\NotificationEvent;
use App\Models\NotificationLog;
use App\Models\UserNotificationPreference;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class NotificationDispatcher
{
    // Rate limiting - per event per user
    private const RATE_LIMIT_PER_EVENT = 10;
    private const RATE_LIMIT_WINDOW = 60;

    // Rate limiting - global per user
    private const RATE_LIMIT_GLOBAL = 50;
    private const RATE_LIMIT_GLOBAL_WINDOW = 3600; // 1 hour

    // Deduplication - don't send same event twice within this period (seconds)
    private const DEDUP_WINDOW = 300; // 5 minutes

    public function __construct(
        protected ChannelDispatcher $channelDispatcher,
    ) {}

    /**
     * Send a notification through enabled channels
     * 
     * @param string $eventKey Event key (e.g., 'booking.created')
     * @param User $user Recipient user
     * @param string $recipientType Typ adresata ('customer' | 'provider' | 'admin')
     * @param array $variables Variables to interpolate in templates
     * @return array Result with success status and dispatched channels
     */
    public function send(
        string $eventKey,
        User $user,
        string $recipientType,
        array $variables = [],
    ): array {
        $event = NotificationEvent::findByKey($eventKey);
        
        if (!$event) {
            return [
                'success' => false,
                'channels' => [],
                'error' => "Event '{$eventKey}' not found",
            ];
        }

        if (!$event->is_active) {
            return [
                'success' => false,
                'channels' => [],
                'error' => "Event '{$eventKey}' is disabled",
            ];
        }

        // Check quiet hours (push/toast disabled, email still OK)
        $inQuietHours = $this->isInQuietHours($user);

        // Check deduplication
        if ($this->isDuplicate($user->id, $eventKey, $variables)) {
            return [
                'success' => false,
                'channels' => [],
                'error' => 'Duplicate notification within dedup window',
            ];
        }

        // Check rate limiting (per event)
        if (!$this->checkRateLimit($user->id, $eventKey, self::RATE_LIMIT_PER_EVENT, self::RATE_LIMIT_WINDOW)) {
            return [
                'success' => false,
                'channels' => [],
                'error' => 'Rate limit exceeded for event',
            ];
        }

        // Check rate limiting (global)
        if (!$this->checkGlobalRateLimit($user->id, self::RATE_LIMIT_GLOBAL, self::RATE_LIMIT_GLOBAL_WINDOW)) {
            return [
                'success' => false,
                'channels' => [],
                'error' => 'Rate limit exceeded globally',
            ];
        }

        // Get active template for this recipient type
        $template = $event->templates()
            ->where('recipient_type', $recipientType)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return [
                'success' => false,
                'channels' => [],
                'error' => "No template found for type '{$recipientType}'",
            ];
        }

        // User preferences (new system)
        $preferences = $user->userNotificationPreferences()
            ->where('event_id', $event->id)
            ->first();

        $channels = [];
        $results = [];

        // Email - always allowed
        if ($this->shouldSendChannel('email', $template, $preferences)) {
            $sent = $this->channelDispatcher->dispatchEmail($user, $template, $variables);
            if ($sent) {
                $channels[] = 'email';
            }
            $results['email'] = $sent;
        }

        // Toast - skip if in quiet hours
        if (!$inQuietHours && $this->shouldSendChannel('toast', $template, $preferences)) {
            $sent = $this->channelDispatcher->dispatchToast($user, $template, $variables);
            if ($sent) {
                $channels[] = 'toast';
            }
            $results['toast'] = $sent;
        }

        // Push - skip if in quiet hours
        if (!$inQuietHours && $this->shouldSendChannel('push', $template, $preferences)) {
            $sent = $this->channelDispatcher->dispatchPush($user, $template, $variables);
            if ($sent) {
                $channels[] = 'push';
            }
            $results['push'] = $sent;
        }

        // Database - always allowed
        if ($this->shouldSendChannel('database', $template, $preferences)) {
            $sent = $this->channelDispatcher->dispatchDatabase($user, $template, $variables);
            if ($sent) {
                $channels[] = 'database';
            }
            $results['database'] = $sent;
        }

        // Log the notification
        NotificationLog::create([
            'notification_event_id' => $event->id,
            'notification_template_id' => $template->id,
            'user_id' => $user->id,
            'recipient_type' => $recipientType,
            'event_key' => $eventKey,
            'data' => $variables,
            'channels_sent' => $channels,
            'channels_result' => $results,
            'success' => !empty(array_filter($results)),
            'sent_at' => now(),
        ]);

        return [
            'success' => !empty($channels),
            'channels' => $channels,
            'results' => $results,
        ];
    }

    /**
     * Check if notification should be sent through a specific channel
     */
    private function shouldSendChannel(
        string $channel,
        $template,
        ?UserNotificationPreference $preferences,
    ): bool {
        // Channel must be enabled on template level
        $templateEnabled = (bool) ($template->{"{$channel}_enabled"} ?? false);
        if (!$templateEnabled) {
            return false;
        }

        // User preference overrides (if present)
        if ($preferences !== null) {
            $userChoice = $preferences->{"{$channel}_enabled"} ?? true;
            return (bool) $userChoice;
        }

        // Default: follow template
        return true;
    }

    /**
     * Check rate limit for user and event
     */
    private function checkRateLimit(
        int $userId,
        string $eventKey,
        int $limit,
        int $windowSeconds,
    ): bool {
        $key = "notification_rate_limit:{$userId}:{$eventKey}";
        $count = Cache::get($key, 0);

        if ($count >= $limit) {
            return false;
        }

        Cache::put($key, $count + 1, $windowSeconds);
        return true;
    }

    /**
     * Check global rate limit for user across all events
     */
    private function checkGlobalRateLimit(int $userId, int $limit, int $windowSeconds): bool
    {
        $key = "notification_rate_limit_global:{$userId}";
        $count = Cache::get($key, 0);

        if ($count >= $limit) {
            return false;
        }

        Cache::put($key, $count + 1, $windowSeconds);
        return true;
    }

    /**
     * Check if this is a duplicate notification sent recently
     */
    private function isDuplicate(int $userId, string $eventKey, array $variables): bool
    {
        // Create a hash of event + key variables (e.g., booking_id, review_id)
        // to determine uniqueness
        $dupKey = "notification_dedup:{$userId}:{$eventKey}";

        // Add important variables to the key
        $importantVars = array_intersect_key($variables, array_flip([
            'booking_id',
            'review_id',
            'message_id',
            'conversation_id',
            'service_id',
            'provider_id',
        ]));

        if (!empty($importantVars)) {
            $dupKey .= ':' . md5(json_encode($importantVars));
        }

        // Check if we've sent this recently
        if (Cache::has($dupKey)) {
            return true;
        }

        // Mark as sent
        Cache::put($dupKey, true, self::DEDUP_WINDOW);
        return false;
    }

    /**
     * Check if user is in quiet hours
     * 
     * Quiet hours can be set in user preferences
     * If not set, defaults to 22:00-08:00
     */
    private function isInQuietHours(User $user): bool
    {
        // Get quiet hours from user settings (if implemented)
        // For now, use default 22:00-08:00
        $now = Carbon::now($user->timezone ?? 'UTC');
        $hour = $now->hour;

        // Quiet hours: 22:00 (22) to 08:00 (8)
        return $hour >= 22 || $hour < 8;
    }
}
