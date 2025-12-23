<?php

namespace App\Helpers;

/**
 * Helper do zarządzania mediami i shardingiem
 */
class MediaHelper
{
    /**
     * Oblicz shard dla ID (modulo 1000)
     * Równomierne rozłożenie 000-999
     * 
     * Przykłady:
     * - getShard(1) → "001"
     * - getShard(123456) → "456"
     * - getShard(999999) → "999"
     * 
     * @param int $id User/Provider/Service/Review ID
     * @return string Trzycyfrowy shard (000-999)
     */
    public static function getShard(int $id): string
    {
        return str_pad((string)($id % 1000), 3, '0', STR_PAD_LEFT);
    }

    /**
     * Zbuduj ścieżkę shardowaną
     * 
     * Przykłady:
     * - getShardedPath('avatars', 123456) → "avatars/456/123456"
     * - getShardedPath('providers', 789, 'portfolio') → "providers/789/789/portfolio"
     * - getShardedPath('services', 5000, 'gallery') → "services/000/5000/gallery"
     * 
     * @param string $type Typ (avatars, providers, services, reviews)
     * @param int $id ID encji
     * @param string|null $subpath Podkatalog (portfolio, gallery, etc.)
     * @return string Pełna ścieżka
     */
    public static function getShardedPath(string $type, int $id, ?string $subpath = null): string
    {
        $shard = self::getShard($id);
        $path = "{$type}/{$shard}/{$id}";

        return $subpath ? "{$path}/{$subpath}" : $path;
    }

    /**
     * Dozwolone typy plików dla różnych kategorii
     */
    public const ALLOWED_MIMES = [
        'avatar' => ['jpeg', 'jpg', 'png', 'webp'],
        'portfolio' => ['jpeg', 'jpg', 'png', 'webp'],
        'service' => ['jpeg', 'jpg', 'png', 'webp'],
        'review' => ['jpeg', 'jpg', 'png', 'webp'],
        'document' => ['jpeg', 'jpg', 'png', 'pdf'],
    ];

    /**
     * Maksymalne rozmiary plików (w KB)
     */
    public const MAX_SIZES = [
        'avatar' => 5120,      // 5MB
        'portfolio' => 10240,  // 10MB
        'service' => 10240,    // 10MB
        'review' => 5120,      // 5MB
        'document' => 10240,   // 10MB
    ];

    /**
     * Walidacja formatu MIME
     */
    public static function getAllowedMimes(string $type): array
    {
        return self::ALLOWED_MIMES[$type] ?? self::ALLOWED_MIMES['avatar'];
    }

    /**
     * Walidacja rozmiaru
     */
    public static function getMaxSize(string $type): int
    {
        return self::MAX_SIZES[$type] ?? self::MAX_SIZES['avatar'];
    }
}
