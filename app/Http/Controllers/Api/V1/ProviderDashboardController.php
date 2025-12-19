<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Api\ProviderDashboardApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Kontroler API dla dashboardu providera
 */
class ProviderDashboardController extends Controller
{
    public function __construct(
        protected ProviderDashboardApiService $dashboardService
    ) {
    }

    /**
     * Pobiera wszystkie widgety dashboardu providera
     * 
     * GET /api/v1/provider/dashboard/widgets
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function widgets(Request $request): JsonResponse
    {
        $user = $request->user();

        // Sprawdź czy użytkownik jest providerem
        if (! $user || $user->user_type !== 'provider') {
            return response()->json([
                'message' => 'Tylko providery mają dostęp do tego dashboardu',
            ], 403);
        }

        $widgets = $this->dashboardService->getDashboardWidgets($user);

        return response()->json([
            'data' => $widgets,
        ]);
    }
}
