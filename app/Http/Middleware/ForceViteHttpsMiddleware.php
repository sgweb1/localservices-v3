<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceViteHttpsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // W dev mode - replace HTTP://ls.test z HTTPS://ls.test w HTML
        if (config('app.env') === 'local' && $response->headers->get('content-type') && 
            str_contains($response->headers->get('content-type'), 'text/html')) {
            $content = $response->getContent();
            // Zamień http://ls.test (all assets) na https://ls.test
            $content = str_replace('http://ls.test', 'https://ls.test', $content);
            $response->setContent($content);
        }
        
        return $response;
    }
}
