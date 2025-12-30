<?php

use App\Http\Controllers\Api\V1\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Publiczne endpointy (bez auth)
Route::prefix('subscription-plans')->group(function () {
    // GET /api/v1/subscription-plans - Lista dostępnych planów
    Route::get('', [SubscriptionController::class, 'plans'])->name('subscription-plans.index');
});
