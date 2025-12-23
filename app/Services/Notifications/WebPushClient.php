<?php

namespace App\Services\Notifications;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Klient Web Push oparty o bibliotekę minishlink/web-push.
 * Odpowiedzialny wyłącznie za wysyłkę do subskrypcji użytkownika.
 */
class WebPushClient
{
    private WebPush $webPush;

    public function __construct()
    {
        $vapid = config('webpush.vapid');

        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => $vapid['subject'] ?? null,
                'publicKey' => $vapid['public_key'] ?? null,
                'privateKey' => $vapid['private_key'] ?? null,
            ],
        ]);

        $this->webPush->setDefaultOptions([
            'TTL' => config('webpush.ttl', 300),
        ]);
    }

    /**
     * Wyślij Web Push do wszystkich aktywnych subskrypcji użytkownika.
     * Zwraca liczbę udanych wysyłek.
     */
    public function send(User $user, array $payload): int
    {
        $sent = 0;

        /** @var PushSubscription[] $subscriptions */
        $subscriptions = $user->pushSubscriptions()->active()->get();

        foreach ($subscriptions as $subscription) {
            $report = $this->sendToSubscription($subscription, $payload);

            if ($report === true) {
                $sent++;
            }
        }

        return $sent;
    }

    private function sendToSubscription(PushSubscription $subscription, array $payload): bool
    {
        try {
            $report = $this->webPush->sendOneNotification(
                Subscription::create($subscription->toWebPushFormat()),
                json_encode($payload)
            );

            if ($report->isSuccess()) {
                $subscription->update(['last_sent_at' => now(), 'failed_at' => null, 'is_active' => true]);
                return true;
            }

            if ($report->isSubscriptionExpired() || $report->getResponse()->getStatusCode() === 410) {
                $subscription->markAsFailed();
            }

            Log::warning('WebPush failed', [
                'endpoint' => $subscription->endpoint,
                'status' => $report->getResponse()->getStatusCode(),
                'reason' => $report->getReason(),
            ]);
        } catch (\Throwable $e) {
            $subscription->markAsFailed();
            Log::error('WebPush exception', [
                'endpoint' => $subscription->endpoint,
                'error' => $e->getMessage(),
            ]);
        }

        return false;
    }
}
