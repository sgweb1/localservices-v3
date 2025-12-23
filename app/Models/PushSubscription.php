<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Push subscription dla Web Push notifications (VAPID)
 *
 * @property int $id
 * @property int $user_id
 * @property string $endpoint
 * @property string $p256dh_key
 * @property string $auth_key
 * @property bool $is_active
 * @property \Carbon\Carbon|null $last_sent_at
 * @property \Carbon\Carbon|null $failed_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read \App\Models\User $user
 */
class PushSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh_key',
        'auth_key',
        'is_active',
        'last_sent_at',
        'failed_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    /**
     * Relacja do użytkownika
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Konwersja do formatu wymaganego przez web-push library
     */
    public function toWebPushFormat(): array
    {
        return [
            'endpoint' => $this->endpoint,
            'keys' => [
                'p256dh' => $this->p256dh_key,
                'auth' => $this->auth_key,
            ],
        ];
    }

    /**
     * Scope: tylko aktywne subskrypcje
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->whereNull('failed_at');
    }

    /**
     * Oznacz subskrypcję jako nieaktywną (po błędzie 410 Gone)
     */
    public function markAsFailed(): void
    {
        $this->update([
            'is_active' => false,
            'failed_at' => now(),
        ]);
    }
}
