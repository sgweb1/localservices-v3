<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Profil providera (dostawcy usług)
 * 
 * Przechowuje informacje biznesowe:
 * - Nazwa firmy i opis usług
 * - Website i social media
 * - Trust Score i poziom weryfikacji
 * - Statusy weryfikacji (ID, background check)
 */
class ProviderProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'business_name',
        'service_description',
        'website_url',
        'social_media',
        'subdomain',
        'trust_score',
        'verification_level',
        'id_verified',
        'background_check_passed',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'social_media' => 'array',
            'id_verified' => 'boolean',
            'background_check_passed' => 'boolean',
            'trust_score' => 'integer',
            'verification_level' => 'integer',
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
