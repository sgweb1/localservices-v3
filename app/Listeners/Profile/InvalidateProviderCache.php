<?php

namespace App\Listeners\Profile;

use Illuminate\Cache\TaggableStore;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

/**
 * Listener invalidujący cache providera po zmianie profilu
 * 
 * Przetwarzany asynchronicznie (queued)
 */
class InvalidateProviderCache implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        // Obsłuż zarówno ProfileUpdated jak i AvatarUpdated (oba mają $user)
        if (!property_exists($event, 'user')) {
            return;
        }

        $user = $event->user;

        // Tylko dla providerów
        if (!$user->isProvider()) {
            return;
        }

        // Flush cache tagów providera (tylko jeśli store wspiera tagi)
        $store = Cache::getStore();
        if ($store instanceof TaggableStore) {
            Cache::tags(['providers', "provider.{$user->id}"])->flush();
        }
    }
}
