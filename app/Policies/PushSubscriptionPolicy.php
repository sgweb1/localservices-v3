<?php

namespace App\Policies;

use App\Models\PushSubscription;
use App\Models\User;

class PushSubscriptionPolicy
{
    public function delete(User $user, PushSubscription $subscription): bool
    {
        return $subscription->user_id === $user->id;
    }
}
