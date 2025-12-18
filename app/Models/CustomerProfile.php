<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Profil customera (klienta)
 * 
 * Przechowuje preferencje i statystyki:
 * - Preferencje językowe
 * - Ustawienia powiadomień
 * - Reliability Score
 * - Statystyki rezerwacji
 */
class CustomerProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'preferred_language',
        'email_notifications',
        'push_notifications',
        'reliability_score',
        'total_bookings',
        'completed_bookings',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'reliability_score' => 'integer',
            'total_bookings' => 'integer',
            'completed_bookings' => 'integer',
        ];
    }

    /**
     * Relacja do użytkownika
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
