<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

/**
 * Model płatności / transakcji
 */
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_id',
        'booking_id',
        'payment_method',
        'payment_type',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'reference',
        'metadata',
        'failure_reason',
        'completed_at',
        'refunded_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'subscription_id' => 'integer',
        'booking_id' => 'integer',
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'completed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = (string) Str::uuid();
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
     * Subskrypcja
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Rezerwacja
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Faktura
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Scope - ukończone
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
     * Czy płatność jest ważna
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->completed_at !== null;
    }
}
