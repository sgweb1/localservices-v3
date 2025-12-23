<?php

use App\Http\Controllers\Api\V1\Provider\ServiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Provider Services API Routes
|--------------------------------------------------------------------------
|
| Endpointy dla zarządzania usługami (CRUD, galeria, status)
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    // Self-provider shorthand (bez providerId w URL)
    Route::get('/provider/services', [ServiceController::class, 'indexSelf'])->name('api.provider.services.self-index');
    Route::get('/provider/services/{serviceId}', [ServiceController::class, 'showSelf'])->name('api.provider.services.self-show');
    Route::post('/provider/services', [ServiceController::class, 'storeSelf'])->name('api.provider.services.self-store');
    Route::patch('/provider/services/{serviceId}', [ServiceController::class, 'updateSelf'])->name('api.provider.services.self-update');
    Route::delete('/provider/services/{serviceId}', [ServiceController::class, 'destroySelf'])->name('api.provider.services.self-destroy');
    Route::post('/provider/services/{serviceId}/toggle-status', [ServiceController::class, 'toggleSelf'])->name('api.provider.services.self-toggle');

    // Services CRUD
    Route::get('/providers/{providerId}/services', [ServiceController::class, 'index'])->name('api.provider.services.index');
    Route::post('/providers/{providerId}/services', [ServiceController::class, 'store'])->name('api.provider.services.store');
    Route::get('/providers/{providerId}/services/{serviceId}', [ServiceController::class, 'show'])->name('api.provider.services.show');
    Route::patch('/providers/{providerId}/services/{serviceId}', [ServiceController::class, 'update'])->name('api.provider.services.update');
    Route::delete('/providers/{providerId}/services/{serviceId}', [ServiceController::class, 'destroy'])->name('api.provider.services.destroy');
    
    // Status toggle (active ↔ paused)
    Route::post('/providers/{providerId}/services/{serviceId}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('api.provider.services.toggle-status');

    // Gallery endpoints
    Route::post('/providers/{providerId}/services/{serviceId}/photos', [ServiceController::class, 'uploadPhoto'])->name('api.provider.services.photos.upload');
    Route::delete('/providers/{providerId}/services/{serviceId}/photos/{photoId}', [ServiceController::class, 'deletePhoto'])->name('api.provider.services.photos.delete');
    Route::post('/providers/{providerId}/services/{serviceId}/photos/reorder', [ServiceController::class, 'reorderPhotos'])->name('api.provider.services.photos.reorder');
    Route::post('/providers/{providerId}/services/{serviceId}/photos/{photoId}/primary', [ServiceController::class, 'setPrimaryPhoto'])->name('api.provider.services.photos.primary');
});
