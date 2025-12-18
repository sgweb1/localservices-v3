<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model oferty usługi (Service Listing).
 *
 * @property int $id
 * @property string $uuid
 * @property int $provider_id
 * @property int|null $location_id
 * @property int $category_id
 * @property string $title
 * @property string $slug
 * @property string $description
 * @property string|null $what_included
 * @property string $pricing_type
 * @property float|null $base_price
 * @property float|null $price_range_low
 * @property float|null $price_range_high
 * @property string $price_currency
 * @property string|null $pricing_unit
 * @property bool $instant_booking
 * @property bool $accepts_quote_requests
 * @property int $min_notice_hours
 * @property int $max_advance_days
 * @property int|null $duration_minutes
 * @property array|null $service_locations
 * @property float|null $latitude
 * @property float|null $longitude
 * @property int $max_distance_km
 * @property bool $willing_to_travel
 * @property float|null $travel_fee_per_km
 * @property array|null $requirements
 * @property array|null $tools_provided
 * @property string|null $cancellation_policy
 * @property float $rating_average
 * @property int $reviews_count
 * @property int $bookings_count
 * @property int $views_count
 * @property \Illuminate\Support\Carbon|null $last_booked_at
 * @property string $status
 * @property bool $is_featured
 * @property bool $is_promoted
 * @property \Illuminate\Support\Carbon|null $promoted_until
 * @property string|null $rejection_reason
 * @property int|null $moderated_by
 * @property \Illuminate\Support\Carbon|null $moderated_at
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property \Illuminate\Support\Carbon|null $published_at
 * @property-read User $provider
 * @property-read Location|null $location
 * @property-read ServiceCategory $category
 */
class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'provider_id',
        'location_id',
        'category_id',
        'title',
        'slug',
        'description',
        'what_included',
        'pricing_type',
        'base_price',
        'price_range_low',
        'price_range_high',
        'price_currency',
        'pricing_unit',
        'instant_booking',
        'accepts_quote_requests',
        'min_notice_hours',
        'max_advance_days',
        'duration_minutes',
        'service_locations',
        'latitude',
        'longitude',
        'max_distance_km',
        'willing_to_travel',
        'travel_fee_per_km',
        'requirements',
        'tools_provided',
        'cancellation_policy',
        'rating_average',
        'reviews_count',
        'bookings_count',
        'views_count',
        'last_booked_at',
        'status',
        'is_featured',
        'is_promoted',
        'promoted_until',
        'rejection_reason',
        'moderated_by',
        'moderated_at',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'price_range_low' => 'decimal:2',
        'price_range_high' => 'decimal:2',
        'travel_fee_per_km' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'rating_average' => 'decimal:2',
        'service_locations' => 'array',
        'requirements' => 'array',
        'tools_provided' => 'array',
        'instant_booking' => 'boolean',
        'accepts_quote_requests' => 'boolean',
        'willing_to_travel' => 'boolean',
        'is_featured' => 'boolean',
        'is_promoted' => 'boolean',
        'promoted_until' => 'datetime',
        'last_booked_at' => 'datetime',
        'moderated_at' => 'datetime',
        'published_at' => 'datetime',
        'min_notice_hours' => 'integer',
        'max_advance_days' => 'integer',
        'duration_minutes' => 'integer',
        'max_distance_km' => 'integer',
        'reviews_count' => 'integer',
        'bookings_count' => 'integer',
        'views_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($service) {
            if (empty($service->uuid)) {
                $service->uuid = (string) Str::uuid();
            }
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->title);
            }
        });

        static::updating(function ($service) {
            if ($service->isDirty('title') && ! $service->isDirty('slug')) {
                $service->slug = Str::slug($service->title);
            }
        });
    }

    /**
     * Relacja do providera (użytkownik).
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Relacja do lokalizacji.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Relacja do kategorii.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    /**
     * Relacja do rezerwacji instant booking
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relacja do zapytań ofertowych
     */
    public function bookingRequests(): HasMany
    {
        return $this->hasMany(BookingRequest::class);
    }

    /**
     * Scope dla aktywnych usług.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope dla opublikowanych usług.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'active')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope dla wyróżnionych usług.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope dla promowanych usług.
     */
    public function scopePromoted($query)
    {
        return $query->where('is_promoted', true)
            ->where(function ($q) {
                $q->whereNull('promoted_until')
                    ->orWhere('promoted_until', '>', now());
            });
    }
}
