<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Profil użytkownika z danymi osobowymi
 * 
 * Przechowuje rozszerzone informacje o użytkowniku:
 * - Dane osobowe (imię, nazwisko)
 * - Lokalizacja i kontakt
 * - Preferencje językowe
 * - Procent kompletności profilu
 */
class UserProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'phone',
        'phone_country_code',
        'bio',
        'avatar_url',
        'video_introduction_url',
        'city',
        'address',
        'latitude',
        'longitude',
        'preferred_language',
        'timezone',
        'languages',
        'profile_completion_percentage',
        'is_profile_public',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'is_profile_public' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'profile_completion_percentage' => 'integer',
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
