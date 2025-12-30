<?php

use App\Http\Controllers\Api\V1\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('subscriptions')->group(function () {
    // GET /api/v1/subscriptions - Lista subskrypcji użytkownika
    Route::get('', [SubscriptionController::class, 'index'])->name('subscriptions.index');

    // GET /api/v1/subscriptions/{subscription} - Szczegóły subskrypcji
    Route::get('{subscription}', [SubscriptionController::class, 'show'])->name('subscriptions.show');

    // PUT /api/v1/subscriptions/{subscription}/renew - Przedłuż subskrypcję
    Route::put('{subscription}/renew', [SubscriptionController::class, 'renew'])->name('subscriptions.renew');

    // DELETE /api/v1/subscriptions/{subscription} - Anuluj subskrypcję
    Route::delete('{subscription}', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
});
