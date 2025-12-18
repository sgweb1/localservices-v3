<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Conversion - Funnel tracking (booking flow analytics)
 * 
 * @property int $id
 * @property string $uuid
 * @property int|null $customer_id
 * @property int|null $provider_id
 * @property int|null $booking_id
 * @property string $funnel_name
 * @property int $stage
 * @property string $stage_name
 * @property bool $completed
 */
class Conversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'customer_id',
        'provider_id',
        'booking_id',
        'funnel_name',
        'stage',
        'stage_name',
        'reached_at',
        'left_at',
        'completed',
        'drop_reason',
        'time_in_stage_seconds',
        'interactions_count',
        'metadata',
    ];

    protected $casts = [
        'reached_at' => 'datetime',
        'left_at' => 'datetime',
        'completed' => 'boolean',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
