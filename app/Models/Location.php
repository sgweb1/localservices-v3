<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Model lokalizacji geograficznej.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property float $latitude
 * @property float $longitude
 * @property string|null $region
 * @property int|null $population
 * @property bool $is_major_city
 */
class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'latitude',
        'longitude',
        'region',
        'population',
        'is_major_city',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'population' => 'integer',
        'is_major_city' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($location) {
            if (empty($location->slug)) {
                $location->slug = Str::slug($location->name);
            }
        });
    }

    /**
     * Scope dla głównych miast.
     */
    public function scopeMajorCities($query)
    {
        return $query->where('is_major_city', true);
    }
}
