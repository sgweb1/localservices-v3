<?php

use App\Http\Controllers\Api\V1\SubscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Subscription API Routes
|--------------------------------------------------------------------------
|
| Publiczne i authenticated endpointy dla subskrypcji
|
*/

// Publiczne - lista dostępnych planów (bez auth)
Route::prefix('subscription-plans')->group(function () {
    Route::get('', [SubscriptionController::class, 'plans'])->name('subscription-plans.index');
});

// Authenticated - zarządzanie subskrypcjami użytkownika
Route::middleware('auth:sanctum')->prefix('subscriptions')->group(function () {
    Route::get('', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('{subscription}', [SubscriptionController::class, 'show'])->name('subscriptions.show');
    Route::put('{subscription}/renew', [SubscriptionController::class, 'renew'])->name('subscriptions.renew');
    Route::delete('{subscription}', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
});
