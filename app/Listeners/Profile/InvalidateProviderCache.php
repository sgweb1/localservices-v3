<?php

namespace App\Listeners\Profile;

use App\Events\ProfileUpdated;
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
    public function handle(ProfileUpdated $event): void
    {
        $user = $event->user;

        // Tylko dla providerów
        if (!$user->isProvider()) {
            return;
        }

        // Flush cache tagów providera
        Cache::tags(['providers', "provider.{$user->id}"])->flush();
    }
}
