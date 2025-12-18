<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * FeatureFlag - Feature flags dla A/B testingu
 * 
 * @property int $id
 * @property string $uuid
 * @property string $flag_name
 * @property bool $is_enabled
 * @property int $rollout_percentage
 */
class FeatureFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'flag_name',
        'description',
        'is_enabled',
        'rollout_percentage',
        'target_users',
        'target_roles',
        'target_cities',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'target_users' => 'array',
        'target_roles' => 'array',
        'target_cities' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(FeatureFlagEvent::class);
    }

    /**
     * Czy user ma dostęp do tej feature'u?
     */
    public function isAvailableForUser(?int $userId = null): bool
    {
        if (!$this->is_enabled) {
            return false;
        }

        // Rollout percentage
        if ($userId && rand(0, 100) > $this->rollout_percentage) {
            return false;
        }

        // Target users
        if ($this->target_users && $userId && !in_array($userId, $this->target_users)) {
            return false;
        }

        return true;
    }
}
