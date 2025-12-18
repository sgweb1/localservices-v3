<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Model weryfikacji (tożsamość, bank, telefon)
 */
class Verification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'value',
        'metadata',
        'document_path',
        'status',
        'rejection_reason',
        'verified_at',
        'expires_at',
        'verified_by',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'metadata' => 'array',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
        'verified_by' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($verification) {
            if (empty($verification->uuid)) {
                $verification->uuid = (string) Str::uuid();
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
     * Admin, który zweryfikował
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope - zweryfikowane
     */
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /**
     * Scope - oczekujące
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Czy weryfikacja jest ważna
     */
    public function isValid(): bool
    {
        if ($this->status !== 'verified') {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        return true;
    }
}
