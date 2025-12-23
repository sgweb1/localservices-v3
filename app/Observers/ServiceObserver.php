<?php

namespace App\Observers;

use App\Models\Service;
use App\Services\Media\MediaServiceInterface;

/**
 * ServiceObserver - automatyczne zarządzanie mediami usługi
 * 
 * - deleting: Soft delete - zachowaj media
 * - forceDeleting: Usuń wszystkie zdjęcia (main + gallery)
 */
class ServiceObserver
{
    protected MediaServiceInterface $mediaService;

    public function __construct(MediaServiceInterface $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Handle the Service "deleting" event
     */
    public function deleting(Service $service): void
    {
        if (!$service->isForceDeleting()) {
            // Soft delete - tylko soft delete rekordów Media
            $service->media()->delete();
        }
    }

    /**
     * Handle the Service "force deleting" event
     */
    public function forceDeleting(Service $service): void
    {
        // Usuń wszystkie pliki usługi (main + gallery)
        $this->mediaService->deleteServiceMedia($service->id);
        
        // Usuń rekordy Media
        $service->media()->forceDelete();
    }

    /**
     * Handle the Service "restored" event
     */
    public function restored(Service $service): void
    {
        $service->media()->restore();
    }
}
