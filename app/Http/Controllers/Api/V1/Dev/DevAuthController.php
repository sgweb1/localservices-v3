<?php

namespace App\Http\Controllers\Api\V1\Dev;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DevAuthController extends Controller
{
    public function quickLogin(Request $request): JsonResponse
    {
        if (!app()->environment(['local', 'development'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|string|in:provider,customer,admin',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $query = User::query();
        if (!empty($validated['user_id'])) {
            $query->where('id', $validated['user_id']);
        } else {
            // Map role to user_type, treating admin as provider for dev purposes
            $roleMap = [
                'provider' => UserType::Provider,
                'customer' => UserType::Customer,
                'admin' => UserType::Provider, // Admin doesn't exist in enum, use provider
            ];
            
            $userType = $roleMap[$validated['role']] ?? null;
            if ($userType) {
                $query->where('user_type', $userType);
            }
        }

        $user = $query->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $token = $this->makeToken($user->id);

        // Ustaw usera w kontekście na potrzeby bieżącego requestu
        auth()->setUser($user);
        $request->setUserResolver(fn () => $user);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_type,
            ],
            'token' => $token,
            'note' => 'Zapisz token jako Authorization: Bearer <token> lub w localStorage auth_token',
        ]);
    }

    private function makeToken(int $userId): string
    {
        $sig = hash_hmac('sha256', (string) $userId, config('app.key'));
        return 'quick_' . $userId . ':' . $sig;
    }
}
