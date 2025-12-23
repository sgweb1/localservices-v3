<?php

namespace App\Models;

use App\Services\Media\MediaServiceInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Media - tracking wszystkich uploadowanych plików
 * 
 * Polymorphic relationship - może być przypisany do:
 * - User (avatar)
 * - Provider (portfolio, documents)
 * - Service (main, gallery)
 * - Review (zdjęcia opinii)
 * 
 * Collections:
 * - avatar: Avatar użytkownika/providera
 * - portfolio: Galeria zdjęć providera
 * - service_main: Główne zdjęcie usługi
 * - service_gallery: Dodatkowe zdjęcia usługi
 * - review: Zdjęcia z opinii klienta
 */
class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'mediable_type',
        'mediable_id',
        'collection',
        'disk',
        'path',
        'filename',
        'mime_type',
        'size',
        'metadata',
        'order',
        'is_migrated',
        'migrated_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_migrated' => 'boolean',
        'migrated_at' => 'datetime',
        'size' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Relacja polymorphic do właściciela media
     */
    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Pobierz pełny URL do pliku
     * 
     * @param string $size Rozmiar (original, large, medium, thumb)
     */
    public function getUrl(string $size = 'original'): string
    {
        return app(MediaServiceInterface::class)->getUrl($this->path, $size);
    }

    /**
     * Scope - tylko obrazy
     */
    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    /**
     * Scope - według collection
     */
    public function scopeCollection($query, string $collection)
    {
        return $query->where('collection', $collection);
    }

    /**
     * Scope - posortowane według order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at');
    }

    /**
     * Accessor - rozmiar w czytelnej formie
     */
    public function getHumanSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}

