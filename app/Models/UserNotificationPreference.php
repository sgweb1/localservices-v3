<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserNotificationPreference - Preferencje użytkownika dla powiadomień
 * 
 * Pozwala użytkownikowi kontrolować które powiadomienia chce otrzymywać
 * 
 * @property int $id
 * @property int $user_id
 * @property int $event_id
 * @property bool $email_enabled
 * @property bool $push_enabled
 * @property bool $toast_enabled
 * @property bool $database_enabled
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class UserNotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'email_enabled',
        'push_enabled',
        'toast_enabled',
        'database_enabled',
    ];

    protected function casts(): array
    {
        return [
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'toast_enabled' => 'boolean',
            'database_enabled' => 'boolean',
        ];
    }

    /**
     * Użytkownik
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Event
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(NotificationEvent::class, 'event_id');
    }

    /**
     * Sprawdza czy użytkownik ma włączony dany kanał dla eventu
     */
    public static function isChannelEnabledForUser(int $userId, int $eventId, string $channel): bool
    {
        $preference = static::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        if (!$preference) {
            return true; // Domyślnie wszystkie kanały są włączone
        }

        $property = $channel . '_enabled';
        return $preference->$property ?? true;
    }
}
