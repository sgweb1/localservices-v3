<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProviderMetric - Metryki wydajności providera
 * 
 * @property int $id
 * @property string $uuid
 * @property int $provider_id
 * @property \Carbon\Carbon $metric_date
 * @property int $bookings_completed
 * @property int $bookings_cancelled
 * @property float $cancellation_rate
 * @property float|null $avg_response_time_minutes
 * @property int $reviews_count
 * @property float|null $avg_rating
 * @property int $slots_available
 * @property float $utilization_rate
 * @property float $total_revenue
 */
class ProviderMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'provider_id',
        'metric_date',
        'bookings_completed',
        'bookings_cancelled',
        'cancellation_rate',
        'avg_response_time_minutes',
        'reviews_count',
        'avg_rating',
        'ratings_distribution',
        'slots_available',
        'slots_booked',
        'utilization_rate',
        'total_revenue',
        'subscription_status',
    ];

    protected $casts = [
        'metric_date' => 'date',
    ];

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
