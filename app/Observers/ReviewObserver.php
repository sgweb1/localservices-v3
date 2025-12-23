<?php

namespace App\Observers;

use App\Models\Review;
use App\Services\Media\MediaServiceInterface;
use App\Services\Notifications\NotificationDispatcher;

/**
 * ReviewObserver - automatyczne zarządzanie mediami opinii
 * 
 * - deleting: Soft delete - zachowaj media
 * - forceDeleting: Usuń wszystkie zdjęcia z opinii
 */
class ReviewObserver
{
    protected MediaServiceInterface $mediaService;

    public function __construct(
        MediaServiceInterface $mediaService,
        private NotificationDispatcher $notifications,
    ) {
        $this->mediaService = $mediaService;
    }

    public function created(Review $review): void
    {
        if ($review->provider) {
            $this->notifications->send(
                'review.received',
                $review->provider,
                'provider',
                [
                    'customer_name' => $review->customer->name ?? '',
                    'rating' => $review->rating,
                    'service_name' => $review->booking->service->name ?? '',
                ]
            );
        }
    }

    /**
     * Handle the Review "deleting" event
     */
    public function deleting(Review $review): void
    {
        if (!$review->isForceDeleting()) {
            // Soft delete - tylko soft delete rekordów Media
            $review->media()->delete();
        }
    }

    /**
     * Handle the Review "force deleting" event
     */
    public function forceDeleting(Review $review): void
    {
        // Usuń wszystkie zdjęcia opinii
        $this->mediaService->deleteReviewMedia($review->id);
        
        // Usuń rekordy Media
        $review->media()->forceDelete();
    }

    /**
     * Handle the Review "restored" event
     */
    public function restored(Review $review): void
    {
        $review->media()->restore();
    }
}
