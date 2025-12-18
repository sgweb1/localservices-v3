<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model odpowiedzi na recenzję
 * 
 * Provider lub admin mogą odpowiedzieć na recenzję.
 */
class ReviewResponse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'review_id',
        'user_id',
        'response',
        'is_visible',
    ];

    protected $casts = [
        'review_id' => 'integer',
        'user_id' => 'integer',
        'is_visible' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($response) {
            if (empty($response->uuid)) {
                $response->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Recenzja, na którą odpowiadamy
     */
    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Użytkownik, który napisał odpowiedź
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Czy odpowiedź może być edytowana
     */
    public function canBeEditedBy($user): bool
    {
        return $this->user_id === $user->id && $this->is_visible;
    }

    /**
     * Czy odpowiedź może być usunięta
     */
    public function canBeDeleted($user): bool
    {
        return $this->user_id === $user->id || $user->isAdmin();
    }
}
