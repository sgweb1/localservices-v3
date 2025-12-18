<?php

namespace App\Listeners\Profile;

use App\Events\ProfileUpdated;
use App\Models\ProfileAuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Listener zapisujący zmiany profilu do audit logu
 * 
 * Przetwarzany asynchronicznie (queued)
 */
class LogProfileChangeListener implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ProfileUpdated $event): void
    {
        $user = $event->user;

        // Pobierz zmienione pola
        $changes = $user->getChanges();
        
        if (empty($changes)) {
            return;
        }

        ProfileAuditLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'changed_fields' => array_keys($changes),
            'old_values' => $user->getOriginal(),
            'new_values' => $user->getAttributes(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
