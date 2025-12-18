<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Model planu subskrypcji
 */
class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price_monthly',
        'price_yearly',
        'max_services',
        'max_bookings_per_month',
        'featured_listing',
        'priority_support',
        'analytics_dashboard',
        'features',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'max_services' => 'integer',
        'max_bookings_per_month' => 'integer',
        'featured_listing' => 'boolean',
        'priority_support' => 'boolean',
        'analytics_dashboard' => 'boolean',
        'features' => 'array',
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($plan) {
            if (empty($plan->uuid)) {
                $plan->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Subskrypcje tego planu
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Scope - aktywne
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope - po kolejności wyświetlania
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('price_monthly');
    }
}
