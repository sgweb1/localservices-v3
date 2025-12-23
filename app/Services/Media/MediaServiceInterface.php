<?php

namespace App\Services\Media;

use App\Models\Media;
use App\Models\Provider;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;

/**
 * Interfejs MediaService - abstrakcja dla lokalnego i cloudowego storage
 * 
 * Umożliwia łatwą migrację z lokalnego storage do chmury (S3/R2)
 * przez zmianę tylko implementacji, bez modyfikacji kodu aplikacji.
 */
interface MediaServiceInterface
{
    /**
     * Upload avatara użytkownika
     * Automatycznie: usuwanie starego, generowanie thumbów, sharding
     */
    public function uploadAvatar(User $user, UploadedFile $file): Media;

    /**
     * Upload zdjęcia do portfolio providera
     * Galeria wielozdjęciowa, thumbs, kolejność
     */
    public function uploadPortfolio(Provider $provider, UploadedFile $file): Media;

    /**
     * Upload zdjęcia usługi
     * Może być main (pierwsze) lub gallery (dodatkowe)
     */
    public function uploadServicePhoto(Service $service, UploadedFile $file, bool $isMain = false): Media;

    /**
     * Upload zdjęcia w opinii
     * Klient dodaje zdjęcia jako dowód wykonanej usługi
     */
    public function uploadReviewPhoto(Review $review, UploadedFile $file): Media;

    /**
     * Pobierz URL do pliku (działa lokalnie i w chmurze)
     * 
     * @param string $path Ścieżka do pliku
     * @param string $size Rozmiar (original, large, medium, thumb)
     * @return string Pełny URL
     */
    public function getUrl(string $path, string $size = 'original'): string;

    /**
     * Usuń wszystkie media użytkownika (avatar)
     */
    public function deleteUserMedia(int $userId): bool;

    /**
     * Usuń wszystkie media providera (portfolio, dokumenty)
     */
    public function deleteProviderMedia(int $providerId): bool;

    /**
     * Usuń wszystkie media usługi (main + gallery)
     */
    public function deleteServiceMedia(int $serviceId): bool;

    /**
     * Usuń wszystkie media opinii
     */
    public function deleteReviewMedia(int $reviewId): bool;

    /**
     * Optymalizuj obraz (kompresja, strip EXIF)
     */
    public function optimize(string $path): bool;

    /**
     * Wygeneruj thumbnails dla obrazu
     * 
     * @return array Tablica ścieżek do thumbnails
     */
    public function generateThumbs(string $path, string $type): array;
}
