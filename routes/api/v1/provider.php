<?php

use App\Http\Controllers\Api\V1\ProviderDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Provider Dashboard API Routes
|--------------------------------------------------------------------------
|
| Endpointy dla dashboardu providera (widgety, statystyki, akcje)
|
*/

Route::middleware(['auth:sanctum'])->prefix('provider/dashboard')->group(function () {
    // Pobierz wszystkie widgety dashboardu
    Route::get('/widgets', [ProviderDashboardController::class, 'widgets'])->name('api.provider.dashboard.widgets');
});
