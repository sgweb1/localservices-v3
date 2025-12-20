<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * NotificationEvent - Event powiadomień systemowych
 * 
 * Definiuje eventy systemowe jak booking.created, booking.cancelled, itp.
 * 
 * @property int $id
 * @property string $key - Unikalny klucz eventu
 * @property string $name - Nazwa wyświetlana w UI
 * @property string|null $description - Opis eventu
 * @property array $available_variables - Zmienne dostępne do interpolacji
 * @property bool $is_active - Czy event jest aktywny
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class NotificationEvent extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'available_variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'available_variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Szablony powiadomień dla tego eventu
     */
    public function templates(): HasMany
    {
        return $this->hasMany(NotificationTemplate::class, 'event_id');
    }

    /**
     * Logi powiadomień
     */
    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'notification_event_id');
    }

    /**
     * Preferencje użytkowników
     */
    public function userPreferences(): HasMany
    {
        return $this->hasMany(UserNotificationPreference::class, 'event_id');
    }

    /**
     * Znajdź event po kluczu
     */
    public static function findByKey(string $key): ?self
    {
        return static::where('key', $key)->where('is_active', true)->first();
    }
}
