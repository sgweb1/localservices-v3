<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserNotificationPreference - Preferencje użytkownika dla powiadomień
 * 
 * Przechowuje nadpisane ustawienia użytkownika dla konkretnego szablonu powiadomienia.
 * Jeśli użytkownik nie ma preferencji, używane są domyślne z NotificationTemplate.
 * 
 * @property int $id
 * @property int $user_id
 * @property int $event_id - ID eventu powiadomienia
 * @property bool $email_enabled
 * @property bool $push_enabled
 * @property bool $toast_enabled
 * @property bool $database_enabled
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read \App\Models\User $user
 * @property-read \App\Models\NotificationTemplate $template
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
        'quiet_hours_start',
        'quiet_hours_end',
        'quiet_hours_enabled',
        'frequency',
        'batch_enabled',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'toast_enabled' => 'boolean',
            'database_enabled' => 'boolean',
            'quiet_hours_enabled' => 'boolean',
            'batch_enabled' => 'boolean',
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
}
