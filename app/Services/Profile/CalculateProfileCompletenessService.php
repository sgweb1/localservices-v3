<?php

namespace App\Services\Profile;

use App\Models\UserProfile;

/**
 * Serwis kalkulacji kompletności profilu
 * 
 * Oblicza % wypełnienia profilu na podstawie obecności kluczowych pól.
 * Wagi pól:
 * - first_name: 15%
 * - last_name: 15%
 * - phone: 15%
 * - bio (≥50 znaków): 20%
 * - address: 15%
 * - GPS (lat+lng): 10%
 * - avatar_url: 10%
 */
class CalculateProfileCompletenessService
{
    /**
     * Oblicza i zapisuje % kompletności profilu
     * 
     * @param UserProfile $profile Profil do kalkulacji
     * @return int Procent kompletności (0-100)
     */
    public function __invoke(UserProfile $profile): int
    {
        $score = 0;

        // first_name: 15%
        if (!empty($profile->first_name)) {
            $score += 15;
        }

        // last_name: 15%
        if (!empty($profile->last_name)) {
            $score += 15;
        }

        // phone: 15%
        if (!empty($profile->phone)) {
            $score += 15;
        }

        // bio ≥50 znaków: 20%
        if (!empty($profile->bio) && mb_strlen($profile->bio) >= 50) {
            $score += 20;
        }

        // address: 15%
        if (!empty($profile->address)) {
            $score += 15;
        }

        // GPS (latitude i longitude): 10%
        if (!empty($profile->latitude) && !empty($profile->longitude)) {
            $score += 10;
        }

        // avatar_url: 10%
        if (!empty($profile->avatar_url)) {
            $score += 10;
        }

        // Zapisz wynik
        $profile->update(['profile_completion_percentage' => $score]);

        return $score;
    }
}
