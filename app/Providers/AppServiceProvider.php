<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\ProfileUpdated;
use App\Events\AvatarUpdated;
use App\Listeners\Profile\LogProfileChangeListener;
use App\Listeners\Profile\InvalidateProviderCache;
use App\Listeners\Profile\SendProfileUpdatedNotification;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register event listeners
        Event::listen(ProfileUpdated::class, [
            LogProfileChangeListener::class,
            InvalidateProviderCache::class,
            SendProfileUpdatedNotification::class,
        ]);

        Event::listen(AvatarUpdated::class, [
            InvalidateProviderCache::class,
        ]);
    }
}
