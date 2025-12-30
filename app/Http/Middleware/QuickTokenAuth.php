<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Uwierzytelnianie przez szybki token (dev only) dla realnych użytkowników z bazy.
 * Token format: quick_{userId}:{signature}, gdzie signature = HMAC_SHA256(userId, APP_KEY)
 */
class QuickTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Tylko local/dev
        if (!app()->environment(['local', 'development'])) {
            return $next($request);
        }

        $authHeader = $request->header('Authorization');
        if (!$authHeader || !Str::startsWith($authHeader, 'Bearer quick_')) {
            return $next($request);
        }

        $raw = substr($authHeader, 7); // usuń 'Bearer '
        // Oczekiwany format quick_{id}:{sig}
        if (!Str::startsWith($raw, 'quick_') || !str_contains($raw, ':')) {
            return $next($request);
        }

        [$prefixId, $sig] = explode(':', $raw, 2);
        $userId = (int) str_replace('quick_', '', $prefixId);
        if ($userId <= 0 || empty($sig)) {
            return $next($request);
        }

        $expected = hash_hmac('sha256', (string) $userId, config('app.key'));
        if (!hash_equals($expected, $sig)) {
            return $next($request);
        }

        $user = User::find($userId);
        if (!$user) {
            return $next($request);
        }

        auth()->setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
