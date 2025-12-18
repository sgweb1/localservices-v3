<?php

namespace App\Services\TrustScore;

use App\Models\ProviderProfile;

/**
 * Serwis przeliczania Trust Score providera
 * 
 * Algorytm punktacji (0-100):
 * - ID verified: +20 pkt
 * - Background check passed: +20 pkt
 * - Portfolio ≥3 zdjęcia: +5 pkt (TODO: gdy będzie portfolio)
 * - Ubezpieczenie: +5 pkt (TODO: gdy będzie insurance field)
 * 
 * Pozostałe punkty z metryk (response time, completion rate, etc.)
 * zostaną dodane w przyszłości.
 */
class RecalculateTrustScoreService
{
    /**
     * Przelicza i zapisuje Trust Score providera
     * 
     * @param ProviderProfile $profile Profil providera
     * @return int Nowy Trust Score (0-100)
     */
    public function __invoke(ProviderProfile $profile): int
    {
        $score = 0;

        // ID verified: +20 pkt
        if ($profile->id_verified) {
            $score += 20;
        }

        // Background check passed: +20 pkt
        if ($profile->background_check_passed) {
            $score += 20;
        }

        // TODO: Portfolio ≥3 zdjęcia: +5 pkt
        // TODO: Ubezpieczenie: +5 pkt
        // TODO: Szybka odpowiedź (<6h): +10 pkt
        // TODO: Wysoki completion rate (90%+): +15 pkt
        // TODO: Niski cancellation rate (<5%): +10 pkt

        // Zapisz wynik
        $profile->update(['trust_score' => $score]);

        return $score;
    }
}
