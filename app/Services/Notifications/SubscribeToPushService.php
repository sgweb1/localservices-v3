<?php

namespace App\Services\Notifications;

use App\Models\PushSubscription;
use App\Models\User;

/**
 * Serwis zapisujący subskrypcję Web Push dla użytkownika.
 */
class SubscribeToPushService
{
    public function handle(User $user, string $endpoint, string $p256dh, string $auth): PushSubscription
    {
        return PushSubscription::updateOrCreate(
            ['endpoint' => $endpoint],
            [
                'user_id' => $user->id,
                'p256dh_key' => $p256dh,
                'auth_key' => $auth,
                'is_active' => true,
                'failed_at' => null,
            ]
        );
    }
}
