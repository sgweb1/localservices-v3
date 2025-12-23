<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserType;
use App\Exceptions\Profile\AvatarUploadException;
use App\Exceptions\Profile\InvalidPasswordException;
use App\Exceptions\Profile\ProfileUpdateException;
use App\Http\Controllers\Controller;
use App\Services\Profile\UpdatePasswordService;
use App\Services\Profile\UpdateUserProfileService;
use App\Services\Profile\UploadAvatarService;
use App\Services\Profile\UploadProviderLogoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Kontroler API v1 dla zarządzania profilem użytkownika
 * 
 * Endpointy:
 * - PATCH /api/v1/profile - Aktualizacja danych profilu
 * - POST /api/v1/profile/avatar - Upload avatara (customer)
 * - POST /api/v1/provider/logo - Upload logo (provider)
 * - PUT /api/v1/profile/password - Zmiana hasła
 */
class ProfileController extends Controller
{
    public function __construct(
        private UpdateUserProfileService $updateProfileService,
        private UploadAvatarService $uploadAvatarService,
        private UploadProviderLogoService $uploadLogoService,
        private UpdatePasswordService $updatePasswordService
    ) {}

    /**
     * Aktualizuj profil użytkownika
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        // Walidacja inline z różnymi regułami dla customer/provider
        $bioRules = ['sometimes', 'string'];
        if ($user->isProvider()) {
            $bioRules[] = 'min:50';
            $bioRules[] = 'max:1000';
        } else {
            $bioRules[] = 'max:500';
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'bio' => $bioRules,
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'preferred_language' => 'sometimes|string|in:pl,en',
            'timezone' => 'sometimes|string|max:50',
            'languages' => 'sometimes|array',
            'languages.*' => 'string|in:pl,en',
            // Provider-specific fields
            'business_name' => ['sometimes', 'required_if:user_type,provider', 'string', 'max:255'],
            'service_description' => 'nullable|string|max:2000',
            'website_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
        ]);

        try {
            $user = $this->updateProfileService->__invoke($user, $validated);

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $this->formatUserResponse($user),
            ]);

        } catch (ProfileUpdateException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Upload avatara użytkownika
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB
        ]);

        try {
            $url = $this->uploadAvatarService->__invoke($user, $request->file('avatar'));

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'user' => $this->formatUserResponse($user->fresh(['profile', 'providerProfile'])),
            ]);

        } catch (AvatarUploadException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Upload logo providera
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $user = $request->user();

        // Tylko providery
        abort_unless($user->isProvider(), 403, 'Only providers can upload logo');

        $request->validate([
            'logo' => 'required|image|max:5120', // 5MB
        ]);

        try {
            $url = $this->uploadLogoService->__invoke($user, $request->file('logo'));

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'user' => $this->formatUserResponse($user->fresh(['profile', 'providerProfile'])),
            ]);

        } catch (AvatarUploadException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Zmień hasło użytkownika
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $this->updatePasswordService->__invoke(
                $user,
                $validated['current_password'],
                $validated['new_password']
            );

            return response()->json([
                'message' => 'Password updated successfully',
            ]);

        } catch (InvalidPasswordException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Awansuje customera do roli providera (tworzy profil i przypisuje rolę)
     */
    public function upgradeToProvider(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isProvider()) {
            return response()->json([
                'message' => 'Jesteś już providerem',
            ], 400);
        }

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'service_description' => 'required|string|min:50|max:2000',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->providerProfile()->create([
                'business_name' => $validated['business_name'],
                'service_description' => $validated['service_description'],
                'trust_score' => 10,
                'verification_level' => 1,
            ]);

            // Zapewnij istnienie ról i przypisz je użytkownikowi
            Role::findOrCreate('provider');
            Role::findOrCreate('customer');

            $user->assignRole('provider');

            if (!$user->hasRole('customer')) {
                $user->assignRole('customer');
            }

            // Ustaw typ użytkownika na provider (enum cast)
            $user->update([
                'user_type' => UserType::Provider,
            ]);
        });

        return response()->json([
            'message' => 'Gratulacje! Jesteś teraz providerem. Możesz dodać pierwsze usługi.',
            'user' => $this->formatUserResponse($user->fresh(['profile', 'providerProfile'])),
        ]);
    }

    /**
     * Formatuj user object dla response API
     * 
     * @param \App\Models\User $user
     * @return array
     */
    private function formatUserResponse($user): array
    {
        $response = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type->value,
            'avatar_url' => $user->getAvatarUrlAttribute(),
            'profile' => null,
        ];

        if ($user->profile) {
            $response['profile'] = [
                'first_name' => $user->profile->first_name,
                'last_name' => $user->profile->last_name,
                'bio' => $user->profile->bio,
                'city' => $user->profile->city,
                'avatar_url' => $user->profile->avatar_url,
                'profile_completion_percentage' => $user->profile->profile_completion_percentage,
            ];
        }

        if ($user->isProvider() && $user->providerProfile) {
            $response['provider_profile'] = [
                'business_name' => $user->providerProfile->business_name,
                'service_description' => $user->providerProfile->service_description,
                'trust_score' => $user->providerProfile->trust_score,
                'verification_level' => $user->providerProfile->verification_level,
            ];
        }

        return $response;
    }
}
