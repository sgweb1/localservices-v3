<?php

namespace App\Services\Media;

use App\Helpers\MediaHelper;
use App\Models\Media;
use App\Models\Provider;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Lokalna implementacja MediaService
 * 
 * Używa Laravel Storage (disk: public) z shardowaną strukturą katalogów.
 * Pliki przechowywane w storage/app/public/{type}/{shard}/{id}/
 */
class LocalMediaService implements MediaServiceInterface
{
    protected string $disk = 'public';

    public function uploadAvatar(User $user, UploadedFile $file): Media
    {
        // Usuń stary avatar (cały katalog użytkownika)
        $this->deleteUserMedia($user->id);

        // Upload do shardowanego katalogu
        $path = MediaHelper::getShardedPath('avatars', $user->id);
        $filename = 'avatar.' . $file->extension();
        
        $storedPath = Storage::disk($this->disk)->putFileAs(
            $path,
            $file,
            $filename
        );

        // Stwórz rekord Media
        $media = $user->media()->create([
            'uuid' => Str::uuid(),
            'collection' => 'avatar',
            'disk' => $this->disk,
            'path' => $storedPath,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'metadata' => [
                'width' => null,  // TODO: Intervention Image
                'height' => null,
            ],
        ]);

        // Zaktualizuj pole avatar w users
        $user->update(['avatar' => $storedPath]);

        return $media;
    }

    public function uploadPortfolio(Provider $provider, UploadedFile $file): Media
    {
        $path = MediaHelper::getShardedPath('providers', $provider->id, 'portfolio');
        $filename = Str::uuid() . '.' . $file->extension();
        
        $storedPath = Storage::disk($this->disk)->putFileAs(
            $path,
            $file,
            $filename
        );

        // Oblicz kolejność (ostatnie + 1)
        $order = $provider->media()
            ->where('collection', 'portfolio')
            ->max('order') ?? 0;

        return $provider->media()->create([
            'uuid' => Str::uuid(),
            'collection' => 'portfolio',
            'disk' => $this->disk,
            'path' => $storedPath,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'order' => $order + 1,
        ]);
    }

    public function uploadServicePhoto(Service $service, UploadedFile $file, bool $isMain = false): Media
    {
        $subpath = $isMain ? null : 'gallery';
        $path = MediaHelper::getShardedPath('services', $service->id, $subpath);
        $filename = $isMain ? 'main.' . $file->extension() : Str::uuid() . '.' . $file->extension();
        
        $storedPath = Storage::disk($this->disk)->putFileAs(
            $path,
            $file,
            $filename
        );

        // Jeśli main - usuń poprzednie main
        if ($isMain) {
            $service->media()
                ->where('collection', 'service_main')
                ->delete();
        }

        $collection = $isMain ? 'service_main' : 'service_gallery';
        $order = $isMain ? 0 : ($service->media()->where('collection', 'service_gallery')->max('order') ?? 0) + 1;

        return $service->media()->create([
            'uuid' => Str::uuid(),
            'collection' => $collection,
            'disk' => $this->disk,
            'path' => $storedPath,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'order' => $order,
        ]);
    }

    public function uploadReviewPhoto(Review $review, UploadedFile $file): Media
    {
        $path = MediaHelper::getShardedPath('reviews', $review->id);
        $filename = Str::uuid() . '.' . $file->extension();
        
        $storedPath = Storage::disk($this->disk)->putFileAs(
            $path,
            $file,
            $filename
        );

        $order = $review->media()->where('collection', 'review')->max('order') ?? 0;

        return $review->media()->create([
            'uuid' => Str::uuid(),
            'collection' => 'review',
            'disk' => $this->disk,
            'path' => $storedPath,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'order' => $order + 1,
        ]);
    }

    public function getUrl(string $path, string $size = 'original'): string
    {
        // TODO: Obsługa różnych rozmiarów (large, medium, thumb)
        return Storage::disk($this->disk)->url($path);
    }

    public function deleteUserMedia(int $userId): bool
    {
        $path = MediaHelper::getShardedPath('avatars', $userId);
        
        // Usuń pliki
        if (Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->deleteDirectory($path);
        }

        return true;
    }

    public function deleteProviderMedia(int $providerId): bool
    {
        $path = MediaHelper::getShardedPath('providers', $providerId);
        
        if (Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->deleteDirectory($path);
        }

        return true;
    }

    public function deleteServiceMedia(int $serviceId): bool
    {
        $path = MediaHelper::getShardedPath('services', $serviceId);
        
        if (Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->deleteDirectory($path);
        }

        return true;
    }

    public function deleteReviewMedia(int $reviewId): bool
    {
        $path = MediaHelper::getShardedPath('reviews', $reviewId);
        
        if (Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->deleteDirectory($path);
        }

        return true;
    }

    public function optimize(string $path): bool
    {
        // TODO: Implementacja z Intervention Image
        // - Kompresja JPEG (85%)
        // - Strip EXIF (prywatność - GPS, camera model)
        // - Progressive JPEG
        return true;
    }

    public function generateThumbs(string $path, string $type): array
    {
        // TODO: Implementacja z Intervention Image
        // Rozmiary z MediaHelper::$sizes
        return [];
    }
}
