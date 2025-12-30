<?php

use App\Http\Controllers\Api\V1\BoostController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('boosts')->group(function () {
    // POST /api/v1/boosts/purchase - Inicjuj zakup boost'u
    Route::post('purchase', [BoostController::class, 'store'])->name('boosts.store');

    // GET /api/v1/boosts/success - Potwierdź płatność
    Route::get('success', [BoostController::class, 'success'])->name('boosts.success');

    // GET /api/v1/boosts - Lista boost'ów providera
    Route::get('', [BoostController::class, 'index'])->name('boosts.index');

    // GET /api/v1/boosts/{boost} - Szczegóły boost'u
    Route::get('{boost}', [BoostController::class, 'show'])->name('boosts.show');

    // PUT /api/v1/boosts/{boost}/renew - Przedłuż boost
    Route::put('{boost}/renew', [BoostController::class, 'renew'])->name('boosts.renew');

    // DELETE /api/v1/boosts/{boost} - Anuluj boost
    Route::delete('{boost}', [BoostController::class, 'cancel'])->name('boosts.cancel');
});
