<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Zdjęcie usługi (service listing photo/gallery).
 *
 * Przechowuje zdjęcia dla każdej usługi. Każda usługa może mieć wiele zdjęć,
 * jedno z nich jest marked as primary (używane w listach).
 *
 * @property int $id
 * @property string $uuid
 * @property int $service_id
 * @property string $image_path
 * @property string|null $alt_text
 * @property bool $is_primary
 * @property int $position
 * @property-read Service $service
 */
class ServicePhoto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'service_photos';

    protected $fillable = [
        'uuid',
        'service_id',
        'image_path',
        'alt_text',
        'is_primary',
        'position',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'position' => 'integer',
    ];

    /**
     * Boot model lifecycle hooks.
     *
     * Automatyczne usunięcie pliku z dysku gdy zdjęcie jest usuwane.
     */
    protected static function boot(): void
    {
        parent::boot();

        // Upewnij się, że uuid jest ustawione przed zapisaniem
        static::creating(function (ServicePhoto $photo) {
            if (empty($photo->uuid)) {
                $photo->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Relacja do usługi.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
