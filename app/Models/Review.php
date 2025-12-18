<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model opinii/recenzji usługi
 * 
 * Każda recenzja jest powiązana z konkretnym booking.
 * Reviewer ocenia reviewed_id (zazwyczaj provider).
 */
class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'reviewer_id',
        'reviewed_id',
        'rating',
        'comment',
        'categories',
        'is_visible',
        'is_reported',
        'helpful_votes',
        'published_at',
    ];

    protected $casts = [
        'booking_id' => 'integer',
        'reviewer_id' => 'integer',
        'reviewed_id' => 'integer',
        'rating' => 'integer',
        'categories' => 'array',
        'is_visible' => 'boolean',
        'is_reported' => 'boolean',
        'helpful_votes' => 'integer',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($review) {
            if (empty($review->uuid)) {
                $review->uuid = (string) Str::uuid();
            }
            // Automatycznie opublikuj przy tworzeniu
            if (empty($review->published_at)) {
                $review->published_at = now();
            }
        });
    }

    /**
     * Booking powiązany z recenzją
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Użytkownik, który napisał recenzję
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Użytkownik, który jest recenzowany
     */
    public function reviewed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }

    /**
     * Odpowiedzi na tę recenzję
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ReviewResponse::class);
    }

    /**
     * Scope - widoczne recenzje (nie ukryte przez admina)
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true)->whereNull('deleted_at');
    }

    /**
     * Scope - opublikowane recenzje
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /**
     * Scope - recenzje dla danego providera
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('reviewed_id', $providerId);
    }

    /**
     * Scope - recenzje danego użytkownika
     */
    public function scopeByReviewer($query, $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    /**
     * Średnia ocena dla providera
     */
    public static function averageRatingForProvider($providerId)
    {
        return self::visible()->published()->forProvider($providerId)->avg('rating') ?? 0;
    }

    /**
     * Liczba recenzji dla providera
     */
    public static function countForProvider($providerId)
    {
        return self::visible()->published()->forProvider($providerId)->count();
    }

    /**
     * Czy reviewer może edytować tę recenzję
     */
    public function canBeEditedBy($user): bool
    {
        return $this->reviewer_id === $user->id && $this->is_visible;
    }

    /**
     * Czy recenzja może być usunięta
     */
    public function canBeDeleted($user): bool
    {
        return $this->reviewer_id === $user->id || $user->isAdmin();
    }
}
