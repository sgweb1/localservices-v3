<?php

namespace App\Services;

use App\Models\ProfileView;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Service do trackowania wyświetleń profilu providerów
 */
class ProfileViewTracker
{
    /**
     * Zapisz wyświetlenie profilu
     */
    public function track(int $providerId, ?Request $request = null): void
    {
        $request = $request ?? request();

        $referrer = $request->header('referer');
        $source = ProfileView::determineSource($referrer);

        ProfileView::create([
            'provider_id' => $providerId,
            'viewer_id' => auth()->id(),
            'source' => $source,
            'referrer' => $referrer,
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'viewed_at' => Carbon::now(),
        ]);
    }

    /**
     * Sprawdź czy użytkownik już wyświetlił ten profil w ciągu ostatnich X minut
     * (żeby nie duplikować przy odświeżaniu strony)
     */
    public function hasRecentView(int $providerId, int $minutesThreshold = 30): bool
    {
        $query = ProfileView::where('provider_id', $providerId)
            ->where('viewed_at', '>=', Carbon::now()->subMinutes($minutesThreshold));

        if (auth()->check()) {
            $query->where('viewer_id', auth()->id());
        } else {
            $query->where('ip_address', request()->ip());
        }

        return $query->exists();
    }

    /**
     * Zapisz view tylko jeśli nie było ostatnio
     */
    public function trackOnce(int $providerId, int $minutesThreshold = 30): void
    {
        if (!$this->hasRecentView($providerId, $minutesThreshold)) {
            $this->track($providerId);
        }
    }
}
