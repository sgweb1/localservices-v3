<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model obszaru serwisu
 * 
 * Definiuje obszary geograficzne, gdzie provider świadczy usługi
 */
class ServiceArea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_id',
        'location_id',
        'name',
        'latitude',
        'longitude',
        'radius_km',
        'travel_fee_per_km',
        'min_travel_fee',
        'is_active',
    ];

    protected $casts = [
        'provider_id' => 'integer',
        'location_id' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_km' => 'decimal:2',
        'travel_fee_per_km' => 'decimal:2',
        'min_travel_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($area) {
            if (empty($area->uuid)) {
                $area->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Provider
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lokalizacja
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Scope - aktywne obszary
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope - dla danego providera
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Czy punkt znajduje się w tym obszarze (simplyfied - bez haversine)
     */
    public function coversLocation($lat, $lng): bool
    {
        $distance = $this->calculateDistance($this->latitude, $this->longitude, $lat, $lng);
        return $distance <= $this->radius_km;
    }

    /**
     * Kalkuluj dystans między dwoma punktami (Haversine - uproszczona)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earth_radius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earth_radius * $c;
    }
}
