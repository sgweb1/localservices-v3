<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * NotificationTemplate - Szablon powiadomienia
 * 
 * Definiuje jak powiadomienie wygląda dla danego typu odbiorcy i kanału
 * 
 * @property int $id
 * @property int $event_id
 * @property string $recipient_type - customer/provider/admin
 * @property array $channels - Aktywne kanały
 * @property bool $email_enabled
 * @property string|null $email_subject
 * @property string|null $email_body
 * @property string|null $email_view
 * @property bool $push_enabled
 * @property string|null $push_title
 * @property string|null $push_body
 * @property bool $toast_enabled
 * @property string|null $toast_type
 * @property string|null $toast_title
 * @property string|null $toast_message
 * @property int|null $toast_duration
 * @property bool $database_enabled
 * @property string|null $database_title
 * @property string|null $database_body
 * @property string|null $database_action_url
 * @property bool $is_active
 * @property bool $user_configurable
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class NotificationTemplate extends Model
{
    protected $fillable = [
        'event_id',
        'recipient_type',
        'channels',
        'email_enabled',
        'email_subject',
        'email_body',
        'email_view',
        'push_enabled',
        'push_title',
        'push_body',
        'toast_enabled',
        'toast_type',
        'toast_title',
        'toast_message',
        'toast_duration',
        'database_enabled',
        'database_title',
        'database_body',
        'database_action_url',
        'is_active',
        'user_configurable',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'toast_enabled' => 'boolean',
            'toast_duration' => 'integer',
            'database_enabled' => 'boolean',
            'is_active' => 'boolean',
            'user_configurable' => 'boolean',
        ];
    }

    /**
     * Event tego szablonu
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(NotificationEvent::class, 'event_id');
    }

    /**
     * Logi powiadomień
     */
    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'notification_template_id');
    }

    /**
     * Interpoluje zmienne w tekście
     */
    public function interpolate(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace("{{" . $key . "}}", $value, $text);
        }
        return $text;
    }

    /**
     * Sprawdza czy kanał jest włączony
     */
    public function isChannelEnabled(string $channel): bool
    {
        $property = $channel . '_enabled';
        return $this->$property ?? false;
    }
}
