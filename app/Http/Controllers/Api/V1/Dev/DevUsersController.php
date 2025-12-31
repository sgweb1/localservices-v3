<?php

namespace App\Http\Controllers\Api\V1\Dev;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DevUsersController extends Controller
{
    /**
     * Pobierz listę użytkowników do testów
     * GET /api/v1/dev/users?type=customer&limit=10
     */
    public function index(Request $request): JsonResponse
    {
        if (!app()->environment(['local', 'development'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'type' => 'nullable|string|in:customer,provider',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = User::query();

        // Filtruj po typie użytkownika
        if (!empty($validated['type'])) {
            $userType = $validated['type'] === 'customer' ? UserType::Customer : UserType::Provider;
            $query->where('user_type', $userType);
        }

        $limit = $validated['limit'] ?? 10;
        
        $users = $query
            ->orderBy('id')
            ->limit($limit)
            ->get(['id', 'name', 'email', 'user_type']);

        return response()->json([
            'success' => true,
            'data' => $users,
            'count' => $users->count()
        ]);
    }
}
