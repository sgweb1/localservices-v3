<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Helper do zarządzania plikami w storage
 * 
 * Implementuje system shardingu (100 katalogów) dla równomiernego
 * rozłożenia plików i lepszej wydajności systemu plików.
 */
class StorageHelper
{
    /**
     * Generuje ścieżkę z shardingiem na podstawie user_id
     * 
     * Algorytm: userId % 100 daje shard 0-99
     * Format: {type}/{shard}/{userId}/
     * 
     * @param int $userId ID użytkownika
     * @param string $type Typ pliku (avatars, provider-logos, portfolio, etc.)
     * @return string Ścieżka do katalogu
     */
    public static function generateShardedPath(int $userId, string $type): string
    {
        $shard = $userId % 100;
        return "{$type}/{$shard}/{$userId}";
    }

    /**
     * Upload avatara customera/providera z shardingiem
     * 
     * @param UploadedFile $file Plik do uploadu
     * @param int $userId ID użytkownika
     * @return string Względna ścieżka do pliku w storage
     * @throws \Exception Gdy upload się nie powiedzie
     */
    public static function uploadAvatar(UploadedFile $file, int $userId): string
    {
        $path = self::generateShardedPath($userId, 'avatars');
        $extension = $file->getClientOriginalExtension();
        $filename = sprintf(
            'avatar_%d_%d_%s.%s',
            $userId,
            time(),
            bin2hex(random_bytes(8)),
            $extension
        );

        $fullPath = Storage::disk('public')->putFileAs($path, $file, $filename);

        if (!$fullPath) {
            throw new \Exception('Failed to upload avatar');
        }

        return $fullPath;
    }

    /**
     * Upload logo providera z shardingiem
     * 
     * @param UploadedFile $file Plik do uploadu
     * @param int $userId ID użytkownika
     * @return string Względna ścieżka do pliku w storage
     * @throws \Exception Gdy upload się nie powiedzie
     */
    public static function uploadProviderLogo(UploadedFile $file, int $userId): string
    {
        $path = self::generateShardedPath($userId, 'provider-logos');
        $extension = $file->getClientOriginalExtension();
        $filename = sprintf(
            'logo_%d_%d_%s.%s',
            $userId,
            time(),
            bin2hex(random_bytes(8)),
            $extension
        );

        $fullPath = Storage::disk('public')->putFileAs($path, $file, $filename);

        if (!$fullPath) {
            throw new \Exception('Failed to upload provider logo');
        }

        return $fullPath;
    }

    /**
     * Usuwa plik z storage
     * 
     * @param string|null $path Względna ścieżka do pliku
     * @return bool True jeśli usunięto lub plik nie istniał
     */
    public static function deleteFile(?string $path): bool
    {
        if (!$path) {
            return true;
        }

        return Storage::disk('public')->delete($path);
    }

    /**
     * Generuje publiczny URL do pliku
     * 
     * @param string|null $path Względna ścieżka w storage
     * @return string|null Pełny URL lub null
     */
    public static function getPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return asset('storage/' . $path);
    }
}
