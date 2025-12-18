<?php

use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Profile API Routes (v1)
|--------------------------------------------------------------------------
|
| Endpointy zarządzania profilem użytkownika:
| - Update profilu (PATCH)
| - Upload avatara/logo (POST)
| - Zmiana hasła (PUT)
|
| Wszystkie wymagają auth:sanctum middleware
| Upload endpointy mają rate limiting (10 requestów/minutę)
|
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Update profilu użytkownika
    Route::patch('/profile', [ProfileController::class, 'update']);
    
    // Upload avatara (customer/provider) - rate limited
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])
        ->middleware('throttle:10,1');
    
    // Upload logo providera - rate limited, tylko providery
    Route::post('/provider/logo', [ProfileController::class, 'uploadLogo'])
        ->middleware('throttle:10,1');
    
    // Zmiana hasła
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    
});
