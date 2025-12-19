<?php

namespace App\Providers;

use App\Events\AvatarUpdated;
use App\Events\ProfileUpdated;
use App\Listeners\Profile\InvalidateProviderCache;
use App\Listeners\Profile\LogProfileChangeListener;
use App\Listeners\Profile\SendProfileUpdatedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        ProfileUpdated::class => [
            LogProfileChangeListener::class,
            InvalidateProviderCache::class,
            SendProfileUpdatedNotification::class,
        ],
        AvatarUpdated::class => [
            InvalidateProviderCache::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
