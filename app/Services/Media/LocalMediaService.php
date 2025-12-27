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

        [$processedPath, $width, $height] = $this->processAvatar($file);

        $storedPath = $path . '/' . $filename;
        Storage::disk($this->disk)->put($storedPath, file_get_contents($processedPath));

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
                'width' => $width,
                'height' => $height,
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
        $paths = [
            // Aktualny schemat (floor(userId/100))
            MediaHelper::getShardedPath('avatars', $userId),
            // Legacy modulo 100 (dawne shardowanie)
            sprintf('avatars/%03d/%d', $userId % 100, $userId),
            // Legacy modulo 1000 (starszy MediaHelper)
            sprintf('avatars/%03d/%d', $userId % 1000, $userId),
        ];

        foreach ($paths as $path) {
            if (Storage::disk($this->disk)->exists($path)) {
                Storage::disk($this->disk)->deleteDirectory($path);
            }
        }

        return true;
    }

    /**
     * Przetwarza avatar do kwadratu 150x150 bez zniekształceń (crop + resize)
     */
    private function processAvatar(UploadedFile $file): array
    {
        $tmpPath = tempnam(sys_get_temp_dir(), 'avatar_');
        $image = $this->createImageFromFile($file);

        $width = imagesx($image);
        $height = imagesy($image);
        $square = min($width, $height);
        $srcX = (int) floor(($width - $square) / 2);
        $srcY = (int) floor(($height - $square) / 2);

        $canvas = imagecreatetruecolor(150, 150);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        imagecopyresampled($canvas, $image, 0, 0, $srcX, $srcY, 150, 150, $square, $square);

        $mime = $file->getMimeType();
        switch ($mime) {
            case 'image/png':
                imagepng($canvas, $tmpPath, 6);
                break;
            case 'image/webp':
                imagewebp($canvas, $tmpPath, 90);
                break;
            default:
                imagejpeg($canvas, $tmpPath, 90);
        }

        imagedestroy($image);
        imagedestroy($canvas);

        return [$tmpPath, 150, 150];
    }

    private function createImageFromFile(UploadedFile $file)
    {
        $mime = $file->getMimeType();
        $path = $file->getRealPath();

        return match ($mime) {
            'image/png' => imagecreatefrompng($path),
            'image/webp' => imagecreatefromwebp($path),
            default => imagecreatefromjpeg($path),
        };
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
