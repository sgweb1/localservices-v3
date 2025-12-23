<?php

namespace App\Traits;

use App\Models\Media;
use App\Services\Media\MediaServiceInterface;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Http\UploadedFile;

/**
 * Trait HasMedia - dodaje obsługę mediów do modeli
 * 
 * Użycie:
 * - User (avatar)
 * - Provider (portfolio)
 * - Service (main + gallery)
 * - Review (zdjęcia opinii)
 */
trait HasMedia
{
    /**
     * Relacja do media (polymorphic)
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    /**
     * Dodaj media do modelu
     * Automatyczne rozpoznawanie typu na podstawie collection
     * 
     * @param UploadedFile $file Plik do uploadu
     * @param string $collection Typ (avatar, portfolio, service_main, service_gallery, review)
     * @param array $metadata Dodatkowe metadane
     * @return Media
     */
    public function addMedia(UploadedFile $file, string $collection, array $metadata = []): Media
    {
        $service = app(MediaServiceInterface::class);

        // Deleguj do odpowiedniej metody MediaService
        $media = match ($collection) {
            'avatar' => $service->uploadAvatar($this, $file),
            'portfolio' => $service->uploadPortfolio($this, $file),
            'service_main' => $service->uploadServicePhoto($this, $file, true),
            'service_gallery' => $service->uploadServicePhoto($this, $file, false),
            'review' => $service->uploadReviewPhoto($this, $file),
            default => throw new \InvalidArgumentException("Unknown collection: {$collection}"),
        };

        // Dodaj custom metadata jeśli podane
        if (!empty($metadata)) {
            $media->update([
                'metadata' => array_merge($media->metadata ?? [], $metadata),
            ]);
        }

        return $media;
    }

    /**
     * Pobierz pierwsze media z kolekcji
     */
    public function getFirstMedia(string $collection): ?Media
    {
        return $this->media()
            ->where('collection', $collection)
            ->ordered()
            ->first();
    }

    /**
     * Pobierz wszystkie media z kolekcji
     */
    public function getMedia(string $collection): \Illuminate\Database\Eloquent\Collection
    {
        return $this->media()
            ->where('collection', $collection)
            ->ordered()
            ->get();
    }

    /**
     * Usuń media z kolekcji
     */
    public function clearMediaCollection(string $collection): bool
    {
        $media = $this->media()->where('collection', $collection)->get();
        
        foreach ($media as $item) {
            // Soft delete - pliki zostaną usunięte przez scheduled cleanup
            $item->delete();
        }

        return true;
    }

    /**
     * Helper dla avatara (User)
     */
    public function getAvatarUrl(?string $size = 'medium'): ?string
    {
        $avatar = $this->getFirstMedia('avatar');
        return $avatar?->getUrl($size);
    }

    /**
     * Helper dla głównego zdjęcia usługi (Service)
     */
    public function getMainPhotoUrl(?string $size = 'large'): ?string
    {
        $photo = $this->getFirstMedia('service_main');
        return $photo?->getUrl($size);
    }

    /**
     * Helper dla galerii (Service, Provider)
     */
    public function getGalleryUrls(string $collection = 'service_gallery', ?string $size = 'large'): array
    {
        return $this->getMedia($collection)
            ->map(fn($media) => $media->getUrl($size))
            ->toArray();
    }

    /**
     * Sprawdź czy ma media w kolekcji
     */
    public function hasMedia(string $collection): bool
    {
        return $this->media()->where('collection', $collection)->exists();
    }

    /**
     * Policz media w kolekcji
     */
    public function mediaCount(string $collection): int
    {
        return $this->media()->where('collection', $collection)->count();
    }
}
