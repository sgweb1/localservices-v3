<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model subskrypcji użytkownika (providera)
 */
class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'billing_period',
        'status',
        'started_at',
        'ends_at',
        'renews_at',
        'cancelled_at',
        'cancellation_reason',
        'paused_at',
        'auto_renew',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'subscription_plan_id' => 'integer',
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
        'renews_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'paused_at' => 'datetime',
        'auto_renew' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            if (empty($subscription->uuid)) {
                $subscription->uuid = (string) Str::uuid();
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
     * Plan subskrypcji
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Alias dla plan() - zgodność z kodem LocalServices
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->plan();
    }

    /**
     * Płatności przypisane do tej subskrypcji
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Scope - aktywne
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope - ważne (nie wygasłe)
     */
    public function scopeValid($query)
    {
        return $query->where('ends_at', '>', now());
    }

    /**
     * Czy subskrypcja jest aktywna
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->ends_at->isFuture();
    }

    /**
     * Czy wymaga odnowienia
     */
    public function needsRenewal(): bool
    {
        return $this->auto_renew && $this->renews_at->isPast();
    }
}
