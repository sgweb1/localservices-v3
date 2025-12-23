<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model preferencji powiadomień użytkownika
 * 
 * Przechowuje ustawienia powiadomień email i push dla każdego użytkownika.
 */
class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_booking_created',
        'email_booking_cancelled',
        'email_message_received',
        'email_review_received',
        'app_booking_created',
        'app_message_received',
        'app_review_received',
    ];

    protected $casts = [
        'email_booking_created' => 'boolean',
        'email_booking_cancelled' => 'boolean',
        'email_message_received' => 'boolean',
        'email_review_received' => 'boolean',
        'app_booking_created' => 'boolean',
        'app_message_received' => 'boolean',
        'app_review_received' => 'boolean',
    ];

    /**
     * Relacja do użytkownika
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
