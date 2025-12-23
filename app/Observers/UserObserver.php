<?php

namespace App\Observers;

use App\Models\User;
use App\Services\Media\MediaServiceInterface;

/**
 * UserObserver - automatyczne zarządzanie mediami użytkownika
 * 
 * - deleting: Soft delete - zachowaj media (zostaną usunięte po 30 dniach)
 * - forceDeleting: Trwałe usunięcie - usuń wszystkie media natychmiast
 */
class UserObserver
{
    protected MediaServiceInterface $mediaService;

    public function __construct(MediaServiceInterface $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Handle the User "deleting" event (soft delete)
     * Zachowaj pliki - zostaną usunięte przez scheduled cleanup po 30 dniach
     */
    public function deleting(User $user): void
    {
        if (!$user->isForceDeleting()) {
            // Soft delete - tylko soft delete rekordów Media
            $user->media()->delete();
        }
    }

    /**
     * Handle the User "force deleting" event (permanent deletion)
     * Usuń wszystkie pliki i rekordy natychmiast
     */
    public function forceDeleting(User $user): void
    {
        // Usuń pliki z dysku
        $this->mediaService->deleteUserMedia($user->id);
        
        // Usuń rekordy Media (force delete)
        $user->media()->forceDelete();
    }

    /**
     * Handle the User "restored" event
     * Przywróć soft-deleted media
     */
    public function restored(User $user): void
    {
        $user->media()->restore();
    }
}
