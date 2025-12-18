<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Model wypłaty dla providera
 */
class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payout_number',
        'status',
        'payout_method',
        'amount',
        'currency',
        'platform_fee',
        'net_amount',
        'description',
        'requested_at',
        'approved_at',
        'processed_at',
        'transaction_id',
        'failure_reason',
        'payment_count',
        'payment_ids',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'payment_count' => 'integer',
        'payment_ids' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payout) {
            if (empty($payout->uuid)) {
                $payout->uuid = (string) Str::uuid();
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
     * Scope - zawierające
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope - oczekujące
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Czy wypłata została zrealizowana
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->processed_at !== null;
    }
}
