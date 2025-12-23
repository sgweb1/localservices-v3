<?php

namespace App\Providers;

use App\Models\PushSubscription;
use App\Policies\PushSubscriptionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        PushSubscription::class => PushSubscriptionPolicy::class,
    ];

    public function boot(): void
    {
        // Polityki są mapowane przez $policies
    }
}
