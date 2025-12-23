<?php

use App\Models\Media;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled cleanup - usuń soft-deleted media po 30 dniach
Schedule::call(function () {
    Media::onlyTrashed()
        ->where('deleted_at', '<', now()->subDays(30))
        ->chunk(100, function ($mediaFiles) {
            foreach ($mediaFiles as $media) {
                // Usuń plik z dysku
                Storage::disk($media->disk)->delete($media->path);
                
                // Force delete rekord
                $media->forceDelete();
            }
        });
})->daily()->name('cleanup-old-media')->description('Usuwa soft-deleted media starsze niż 30 dni');

// Scheduled cleanup - pliki temp starsze niż 24h
Schedule::call(function () {
    Storage::disk('public')->deleteDirectory('temp/uploads');
})->daily()->name('cleanup-temp-uploads')->description('Usuwa tymczasowe pliki starsze niż 24h');

// Scheduled cleanup - push subscriptions
Schedule::command('notifications:clean-subscriptions --days=30')
    ->weekly()
    ->name('cleanup-push-subscriptions')
    ->description('Usuwa nieaktywne push subscriptions');

// Scheduled cleanup - notification logs
Schedule::command('notifications:prune-logs --days=90')
    ->weekly()
    ->name('prune-notification-logs')
    ->description('Usuwa stare logi powiadomień');

// Scheduled check - retry failed notifications
Schedule::command('notifications:retry-failed --hours=24 --limit=100')
    ->dailyAt('03:00')
    ->name('retry-failed-notifications')
    ->description('Retry failed notifications');


