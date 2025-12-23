<?php

use App\Http\Controllers\Api\V1\PushSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/push/subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('/push/subscriptions/{subscription}', [PushSubscriptionController::class, 'destroy']);
    
    // Dev/service endpoints
    Route::post('/push/enable', [PushSubscriptionController::class, 'enable'])->name('api.push.enable');
    Route::get('/push/status', [PushSubscriptionController::class, 'status'])->name('api.push.status');
});
