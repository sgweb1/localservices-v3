<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

/**
 * Middleware dla mock autoryzacji w dev środowisku
 * Pozwala testować API z mock tokenami z React frontend
 */
class MockAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Tylko w dev środowisku
        if (app()->environment() !== 'local' && app()->environment() !== 'testing') {
            return $next($request);
        }

        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $next($request);
        }

        $token = substr($authHeader, 7); // Usuń "Bearer "

        // Sprawdź czy to mock token (format: dev_mock_{userId}_...)
        if (str_starts_with($token, 'dev_mock_')) {
            // Wyciągnij userId z tokenu: dev_mock_{userId}_timestamp_random
            $parts = explode('_', $token);
            if (isset($parts[2]) && is_numeric($parts[2])) {
                $userId = (int) $parts[2];
                
                // Spróbuj znaleźć użytkownika - jeśli nie istnieje, stwórz mock user na lotu
                $user = User::find($userId);
                if (!$user) {
                    // Dla dev - zaloguj generycznie
                    // W rzeczywistym scenariuszu, użytkownik powinien istnieć
                    $request->setUserResolver(function () use ($userId) {
                        $user = new User();
                        $user->id = $userId;
                        $user->email = "mock_user_{$userId}@dev.local";
                        $user->name = "Mock User {$userId}";
                        return $user;
                    });
                } else {
                    auth()->setUser($user);
                }
            }
        }

        return $next($request);
    }
}
