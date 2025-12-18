<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * FeatureFlagEvent - Zdarzenia feature flags
 * 
 * @property int $id
 * @property int $feature_flag_id
 * @property int|null $user_id
 * @property string $event_type
 */
class FeatureFlagEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'feature_flag_id',
        'user_id',
        'event_type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function featureFlag(): BelongsTo
    {
        return $this->belongsTo(FeatureFlag::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
