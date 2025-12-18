<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model komentarza do portfolio
 */
class PortfolioComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'portfolio_item_id',
        'user_id',
        'comment',
        'rating',
        'is_approved',
    ];

    protected $casts = [
        'portfolio_item_id' => 'integer',
        'user_id' => 'integer',
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($comment) {
            if (empty($comment->uuid)) {
                $comment->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Element portfolio
     */
    public function portfolioItem(): BelongsTo
    {
        return $this->belongsTo(PortfolioItem::class);
    }

    /**
     * Użytkownik, który napisał komentarz
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope - zatwierdzone
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }
}
