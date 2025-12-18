<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model elementu portfolio (przykład pracy)
 */
class PortfolioItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'image_paths',
        'thumbnail_path',
        'completed_at',
        'project_value',
        'duration_days',
        'views',
        'likes',
        'is_visible',
        'is_verified',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'image_paths' => 'array',
        'completed_at' => 'date',
        'project_value' => 'decimal:2',
        'duration_days' => 'integer',
        'views' => 'integer',
        'likes' => 'integer',
        'is_visible' => 'boolean',
        'is_verified' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->uuid)) {
                $item->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Użytkownik (provider)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Komentarze do tego elementu
     */
    public function comments(): HasMany
    {
        return $this->hasMany(PortfolioComment::class);
    }

    /**
     * Scope - widoczne
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope - zweryfikowane
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Średnia ocena z komentarzy
     */
    public function getAverageRating(): float
    {
        return $this->comments()
            ->whereNotNull('rating')
            ->avg('rating') ?? 0;
    }

    /**
     * Liczba komentarzy
     */
    public function getCommentsCount(): int
    {
        return $this->comments()->where('is_approved', true)->count();
    }
}
