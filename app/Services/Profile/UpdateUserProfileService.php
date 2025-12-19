<?php

namespace App\Services\Profile;

use Illuminate\Cache\TaggableStore;
use App\Events\ProfileUpdated;
use App\Exceptions\Profile\ProfileUpdateException;
use App\Models\User;
use App\Services\TrustScore\RecalculateTrustScoreService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Serwis aktualizacji profilu użytkownika
 * 
 * Główna logika biznesowa update profilu:
 * - Mapuje pola do odpowiednich tabel (users, user_profiles, provider_profiles)
 * - Przelicza profile completeness i trust score
 * - Invaliduje cache
 * - Loguje zmiany
 * - Dispatchuje eventy
 * 
 * Wszystko w transakcji dla spójności danych.
 */
class UpdateUserProfileService
{
    public function __construct(
        private CalculateProfileCompletenessService $completeness,
        private RecalculateTrustScoreService $trustScore
    ) {}

    /**
     * Aktualizuj profil użytkownika
     * 
     * @param User $user Użytkownik
     * @param array $data Dane do aktualizacji (flat array)
     * @return User Zaktualizowany user z relacjami
     * @throws ProfileUpdateException Gdy update się nie powiedzie
     */
    public function __invoke(User $user, array $data): User
    {
        try {
            DB::transaction(function () use ($user, $data) {
                // Mapowanie pól do tabeli users
                $userFields = array_intersect_key($data, array_flip([
                    'name', 'email', 'phone', 'bio', 'city', 'address', 'latitude', 'longitude'
                ]));

                if (!empty($userFields)) {
                    $user->update($userFields);
                }

                // Mapowanie pól do user_profiles
                $profileFields = array_intersect_key($data, array_flip([
                    'first_name', 'last_name', 'phone', 'bio', 'city', 'address',
                    'latitude', 'longitude', 'preferred_language', 'timezone', 'languages'
                ]));

                if (!empty($profileFields) && $user->profile) {
                    $user->profile->update($profileFields);
                }

                // Mapowanie pól provider_profiles (tylko dla providerów)
                if ($user->isProvider()) {
                    $providerFields = array_intersect_key($data, array_flip([
                        'business_name', 'service_description', 'website_url', 'facebook_url', 'instagram_url'
                    ]));

                    // Social media jako JSON
                    if (isset($data['facebook_url']) || isset($data['instagram_url'])) {
                        $socialMedia = $user->providerProfile->social_media ?? [];
                        if (isset($data['facebook_url'])) {
                            $socialMedia['facebook'] = $data['facebook_url'];
                        }
                        if (isset($data['instagram_url'])) {
                            $socialMedia['instagram'] = $data['instagram_url'];
                        }
                        $providerFields['social_media'] = $socialMedia;
                        unset($providerFields['facebook_url'], $providerFields['instagram_url']);
                    }

                    if (!empty($providerFields) && $user->providerProfile) {
                        $user->providerProfile->update($providerFields);
                    }
                }

                // Przelicz profile completeness
                if ($user->profile) {
                    $this->completeness->__invoke($user->profile);
                }

                // Przelicz trust score dla providera
                if ($user->isProvider() && $user->providerProfile) {
                    $this->trustScore->__invoke($user->providerProfile);
                }
            });

            // Invalidacja cache (po commit transakcji)
            Cache::forget("user.profile.{$user->id}");
            if ($user->isProvider()) {
                $store = Cache::getStore();
                if ($store instanceof TaggableStore) {
                    Cache::tags(['providers', "provider.{$user->id}"])->flush();
                }
            }

            // Log zmian
            Log::info('Profile updated', [
                'user_id' => $user->id,
                'changes' => array_keys($data),
            ]);

            // Dispatch event
            ProfileUpdated::dispatch($user->fresh(['profile', 'providerProfile', 'customerProfile']));

            return $user->fresh(['profile', 'providerProfile', 'customerProfile']);

        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw new ProfileUpdateException('Failed to update profile: ' . $e->getMessage());
        }
    }
}
