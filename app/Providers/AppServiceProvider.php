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
        // Eventy są rejestrowane w EventServiceProvider
    }
}
