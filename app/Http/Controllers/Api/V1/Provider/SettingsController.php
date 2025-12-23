<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Helpers\MediaHelper;
use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Services\Media\MediaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Controller do zarządzania ustawieniami providera
 * 
 * Endpointy:
 * - GET /api/v1/provider/settings - pobierz wszystkie ustawienia
 * - PUT /api/v1/provider/settings/business - aktualizuj profil biznesu
 * - POST /api/v1/provider/settings/logo - upload logo
 * - PUT /api/v1/provider/settings/notifications - aktualizuj preferencje powiadomień
 * - PUT /api/v1/provider/settings/password - zmień hasło
 */
class SettingsController extends Controller
{
    public function __construct(private MediaServiceInterface $mediaService)
    {
    }

    /**
     * Pobierz wszystkie ustawienia providera
     * 
     * GET /api/v1/provider/settings
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $provider = $user->providerProfile;

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Profil providera nie istnieje',
            ], 404);
        }

        // Notification preferences
        $notificationPrefs = $user->notificationPreferences()->first();

        return response()->json([
            'success' => true,
            'data' => [
                // Business Profile
                'business' => [
                    'name' => $provider->business_name ?? '',
                    'short_description' => $provider->service_description ?? null,
                    'bio' => $user->bio ?? null,
                    'logo' => $user->avatar ? Storage::url($user->avatar) : null,
                    'video_url' => $provider->video_introduction_url ?? null,
                    'website' => $provider->website_url ?? null,
                    'social_media' => $provider->social_media ?? [
                        'facebook' => null,
                        'instagram' => null,
                        'linkedin' => null,
                        'tiktok' => null,
                    ],
                ],
                
                // Notification Preferences
                'notifications' => [
                    'email' => [
                        'new_booking' => $notificationPrefs->email_booking_created ?? true,
                        'booking_cancelled' => $notificationPrefs->email_booking_cancelled ?? true,
                        'new_message' => $notificationPrefs->email_message_received ?? true,
                        'new_review' => $notificationPrefs->email_review_received ?? true,
                    ],
                    'push' => [
                        'new_booking' => $notificationPrefs->app_booking_created ?? true,
                        'new_message' => $notificationPrefs->app_message_received ?? true,
                        'new_review' => $notificationPrefs->app_review_received ?? true,
                    ],
                ],
                
                // Security
                'security' => [
                    'two_factor_enabled' => $user->two_factor_secret !== null,
                    'email' => $user->email,
                    'email_verified' => $user->email_verified_at !== null,
                ],
            ],
        ]);
    }

    /**
     * Aktualizuj profil biznesu providera
     * 
     * PUT /api/v1/provider/settings/business
     */
    public function updateBusiness(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|min:2|max:255',
            'short_description' => 'nullable|string|max:120',
            'bio' => 'nullable|string|max:1000',
            'video_url' => 'nullable|url|max:2048',
            'website' => 'nullable|url|max:2048',
            'social_media' => 'nullable|array',
            'social_media.facebook' => 'nullable|url|max:2048',
            'social_media.instagram' => 'nullable|url|max:2048',
            'social_media.linkedin' => 'nullable|url|max:2048',
            'social_media.tiktok' => 'nullable|url|max:2048',
        ]);

        $user = $request->user();
        $provider = $user->providerProfile;

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Profil providera nie istnieje',
            ], 404);
        }

        DB::transaction(function () use ($user, $provider, $validated) {
            $provider->update([
                'business_name' => $validated['business_name'],
                'service_description' => $validated['short_description'] ?? null,
                'video_introduction_url' => $validated['video_url'] ?? null,
                'website_url' => $validated['website'] ?? null,
                'social_media' => $validated['social_media'] ?? [],
            ]);

            $user->update([
                'bio' => $validated['bio'] ?? null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Profil biznesu zaktualizowany',
        ]);
    }

    /**
     * Upload logo providera
     * 
     * POST /api/v1/provider/settings/logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB
        ]);

        $user = $request->user();
        
        // MediaService automatycznie usuwa stare pliki i tworzy Media record
        $media = $this->mediaService->uploadAvatar($user, $request->file('logo'));

        return response()->json([
            'success' => true,
            'message' => 'Logo zaktualizowane',
            'data' => [
                'logo_url' => $media->getUrl('medium'),
            ],
        ]);
    }

    /**
     * Aktualizuj preferencje powiadomień
     * 
     * PUT /api/v1/provider/settings/notifications
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email.new_booking' => 'boolean',
            'email.booking_cancelled' => 'boolean',
            'email.new_message' => 'boolean',
            'email.new_review' => 'boolean',
            'push.new_booking' => 'boolean',
            'push.new_message' => 'boolean',
            'push.new_review' => 'boolean',
        ]);

        $user = $request->user();

        $preferences = $user->notificationPreferences()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        $preferences->update([
            'email_booking_created' => $validated['email']['new_booking'] ?? true,
            'email_booking_cancelled' => $validated['email']['booking_cancelled'] ?? true,
            'email_message_received' => $validated['email']['new_message'] ?? true,
            'email_review_received' => $validated['email']['new_review'] ?? true,
            'app_booking_created' => $validated['push']['new_booking'] ?? true,
            'app_message_received' => $validated['push']['new_message'] ?? true,
            'app_review_received' => $validated['push']['new_review'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Preferencje powiadomień zaktualizowane',
        ]);
    }

    /**
     * Zmień hasło użytkownika
     * 
     * PUT /api/v1/provider/settings/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
        ], [
            'current_password.current_password' => 'Podane hasło jest nieprawidłowe',
            'new_password.min' => 'Hasło musi zawierać co najmniej 8 znaków',
            'new_password.confirmed' => 'Hasła nie pasują do siebie',
            'new_password.different' => 'Nowe hasło musi się różnić od aktualnego',
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hasło zostało zmienione',
        ]);
    }
}
