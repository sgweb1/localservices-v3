<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * NotificationLog - Log wysłanych powiadomień
 * 
 * Przechowuje historię wszystkich wysłanych powiadomień
 * 
 * @property int $id
 * @property int $notification_event_id
 * @property int $notification_template_id
 * @property int $user_id
 * @property string $recipient_type
 * @property string $event_key
 * @property array|null $data
 * @property array|null $channels_sent
 * @property array|null $channels_result
 * @property bool $success
 * @property string|null $error_message
 * @property \Carbon\Carbon|null $sent_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class NotificationLog extends Model
{
    protected $fillable = [
        'notification_event_id',
        'notification_template_id',
        'user_id',
        'recipient_type',
        'event_key',
        'data',
        'channels_sent',
        'channels_result',
        'success',
        'read',
        'read_at',
        'error_message',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'channels_sent' => 'array',
            'channels_result' => 'array',
            'success' => 'boolean',
            'read' => 'boolean',
            'read_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    /**
     * Event
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(NotificationEvent::class, 'notification_event_id');
    }

    /**
     * Szablon
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'notification_template_id');
    }

    /**
     * Użytkownik
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Oznacz jako wysłane pomyślnie
     */
    public function markAsSent(array $channelsResult): void
    {
        $this->update([
            'success' => true,
            'channels_result' => $channelsResult,
            'sent_at' => now(),
        ]);
    }

    /**
     * Oznacz jako failed
     */
    public function markAsFailed(string $errorMessage, array $channelsResult = []): void
    {
        $this->update([
            'success' => false,
            'error_message' => $errorMessage,
            'channels_result' => $channelsResult,
            'sent_at' => now(),
        ]);
    }

    /**
     * Oznacz jako przeczytane
     */
    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Scope - nieprzeczytane powiadomienia
     */
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    /**
     * Scope - powiadomienia dla użytkownika
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
