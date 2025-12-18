<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model certyfikatu zawodowego
 */
class Certification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'issuer',
        'credential_id',
        'description',
        'issue_date',
        'expiry_date',
        'document_path',
        'credential_url',
        'is_active',
        'is_verified',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certification) {
            if (empty($certification->uuid)) {
                $certification->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Użytkownik
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope - aktywne
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope - zweryfikowane
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Czy certyfikat jest ważny
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }
        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }
        return true;
    }
}
