<?php

namespace App\Listeners\Profile;

use App\Events\ProfileUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener wysyłający powiadomienie o aktualizacji profilu
 * 
 * Przetwarzany asynchronicznie (queued)
 * 
 * TODO: Implementacja wysyłki email/push notification
 */
class SendProfileUpdatedNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ProfileUpdated $event): void
    {
        $user = $event->user;

        // TODO: Wysyłka email notification
        // TODO: Wysyłka push notification
        
        Log::info('Profile updated notification', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }
}
