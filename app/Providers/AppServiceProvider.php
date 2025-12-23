<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Message;
use App\Models\Review;
use App\Observers\BookingObserver;
use App\Observers\MessageObserver;
use App\Observers\ReviewObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\ProfileUpdated;
use App\Events\AvatarUpdated;
use App\Listeners\Profile\LogProfileChangeListener;
use App\Listeners\Profile\InvalidateProviderCache;
use App\Listeners\Profile\SendProfileUpdatedNotification;
use App\Services\Media\MediaServiceInterface;
use App\Services\Media\LocalMediaService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind MediaService interface to LocalMediaService implementation
        $this->app->bind(MediaServiceInterface::class, LocalMediaService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rejestracja observerów
        Booking::observe(BookingObserver::class);
        Review::observe(ReviewObserver::class);
        Message::observe(MessageObserver::class);
        
        // Eventy są rejestrowane w EventServiceProvider
    }
}
