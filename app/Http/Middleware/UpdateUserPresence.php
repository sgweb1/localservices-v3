<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware do aktualizacji last_seen_at dla zalogowanego użytkownika
 */
class UpdateUserPresence
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            $user->timestamps = false; // Nie aktualizuj updated_at
            $user->last_seen_at = now();
            $user->save();
            $user->timestamps = true;
            \Log::info('UpdateUserPresence: User ' . $user->id . ' (' . $user->name . ') - last_seen_at: ' . $user->last_seen_at);
        }

        return $next($request);
    }
}
