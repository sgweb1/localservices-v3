<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Kontroler autoryzacji (Sanctum SPA cookie-based).
 * 
 * Obsługuje rejestrację, logowanie, wylogowanie oraz pobieranie aktualnego użytkownika.
 */
class AuthController extends Controller
{
    /**
     * Rejestracja nowego użytkownika.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            'user_type' => 'required|in:customer,provider',
        ]);

        $user = User::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['user_type'],
        ]);

        // Stwórz profile
        $user->profile()->create([
            'languages' => ['pl'],
        ]);

        if ($user->user_type === 'provider') {
            $user->providerProfile()->create([
                'verification_level' => 1,
                'trust_score' => 10,
            ]);
        } else {
            $user->customerProfile()->create();
        }

        Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $this->formatUserResponse($user),
        ], 201);
    }

    /**
     * Logowanie użytkownika (cookie-based dla SPA).
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $this->formatUserResponse(Auth::user()),
        ]);
    }

    /**
     * Wylogowanie użytkownika.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Pobranie aktualnie zalogowanego użytkownika.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $this->formatUserResponse($request->user()),
        ]);
    }

    /**
     * Formatowanie odpowiedzi użytkownika z relacjami.
     * 
     * @param User $user
     * @return array
     */
    private function formatUserResponse(User $user): array
    {
        $user->load(['profile', 'providerProfile', 'customerProfile']);

        return [
            'id' => $user->id,
            'uuid' => $user->uuid,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'city' => $user->city,
            'address' => $user->address,
            'latitude' => $user->latitude,
            'longitude' => $user->longitude,
            'profile' => $user->profile ? [
                'languages' => $user->profile->languages,
                'profile_completion_percentage' => $user->profile->profile_completion_percentage,
            ] : null,
            'provider_profile' => $user->providerProfile ? [
                'business_name' => $user->providerProfile->business_name,
                'verification_level' => $user->providerProfile->verification_level,
                'trust_score' => $user->providerProfile->trust_score,
                'logo' => $user->providerProfile->logo,
                'social_media' => $user->providerProfile->social_media,
            ] : null,
            'customer_profile' => $user->customerProfile ? [
                'id' => $user->customerProfile->id,
            ] : null,
        ];
    }
}
