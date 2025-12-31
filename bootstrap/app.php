<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Register API v1 routes
            Route::middleware('web')
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/auth.php'));

            // DEV routes - NO auth:sanctum (public access in dev/local only)
            Route::middleware('api')
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/dev.php'));
            
            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/profile.php'));

            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/provider.php'));

            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/provider-services.php'));

            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/boosts.php'));

            // Public subscription endpoints (no auth required)
            Route::prefix('api/v1')
                ->group(base_path('routes/api/v1/subscriptions-public.php'));

            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/subscriptions.php'));

            // Marketplace - public routes, NO AUTH - MUST BE LAST to override provider-services.php GET /providers/{providerId}/services
            Route::prefix('api/v1')
                ->group(base_path('routes/api/v1/marketplace.php'));

            Route::prefix('api/v1')
                ->group(base_path('routes/api/v1/push.php'));

            Route::middleware('web')
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1/notifications.php'));
        }
    )
            ->withMiddleware(function (Middleware $middleware): void {
        // API bez przekierowania do login – zwracaj 401
        $middleware->redirectTo(fn () => null);
        
        // Force HTTPS for Vite dev server w dev mode
        $middleware->append(\App\Http\Middleware\ForceViteHttpsMiddleware::class);
        
        // Quick token auth for dev (real users without password)
        $middleware->append(\App\Http\Middleware\QuickTokenAuth::class);
        // Update user presence on every API request
        $middleware->append(\App\Http\Middleware\UpdateUserPresence::class);
    })
            ->withExceptions(function (Exceptions $exceptions): void {
        // API powinno zawsze zwracać JSON (np. 401 zamiast redirect do 'login')
                $exceptions->shouldRenderJsonWhen(function (Request $request) {
                    return $request->is('api/*') || $request->expectsJson();
        });
    })
    ->create();
