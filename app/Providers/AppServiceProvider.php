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
        
        // Force HTTPS w dev mode dla Vite
        if (config('app.env') === 'local' && file_exists(public_path('hot'))) {
            $hotContent = file_get_contents(public_path('hot'));
            // Replace HTTP z HTTPS w hot file
            if (strpos($hotContent, 'http://') === 0 && strpos(config('app.url'), 'https://') === 0) {
                $httpsContent = str_replace('http://', 'https://', $hotContent);
                file_put_contents(public_path('hot'), $httpsContent);
            }
        }
    }
}
