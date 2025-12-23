<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model wyświetlenia profilu providera
 * 
 * Trackuje każde wyświetlenie profilu wraz ze źródłem ruchu
 */
class ProfileView extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'viewer_id',
        'source',
        'referrer',
        'user_agent',
        'ip_address',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Provider którego profil został wyświetlony
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Użytkownik który wyświetlił profil (może być null dla gości)
     */
    public function viewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'viewer_id');
    }

    /**
     * Określ źródło na podstawie referrera
     */
    public static function determineSource(?string $referrer): string
    {
        if (!$referrer) {
            return 'direct';
        }

        $referrerLower = strtolower($referrer);

        if (str_contains($referrerLower, 'google') && str_contains($referrerLower, 'ads')) {
            return 'google_ads';
        }

        if (str_contains($referrerLower, 'google') || str_contains($referrerLower, 'bing') || str_contains($referrerLower, 'yahoo')) {
            return 'search';
        }

        if (str_contains($referrerLower, 'facebook') || str_contains($referrerLower, 'instagram') || 
            str_contains($referrerLower, 'twitter') || str_contains($referrerLower, 'linkedin') ||
            str_contains($referrerLower, 'tiktok')) {
            return 'social_media';
        }

        return 'referral';
    }
}
