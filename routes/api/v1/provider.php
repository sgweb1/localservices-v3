<?php

use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\Dev\DevEventController;
use App\Http\Controllers\Api\V1\ProviderBookingController;
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

Route::middleware(['auth:sanctum'])->prefix('provider')->group(function () {
    // Dashboard widgets
    Route::get('/dashboard/widgets', [ProviderDashboardController::class, 'widgets'])->name('api.provider.dashboard.widgets');
    
    // Bookings management
    Route::get('/bookings', [ProviderBookingController::class, 'index'])->name('api.provider.bookings.index');
    Route::post('/bookings/complete-overdue', [ProviderBookingController::class, 'completeOverdue'])->name('api.provider.bookings.complete-overdue');
    Route::post('/bookings/{id}/accept', [ProviderBookingController::class, 'accept'])->name('api.provider.bookings.accept');
    Route::post('/bookings/{id}/reject', [ProviderBookingController::class, 'reject'])->name('api.provider.bookings.reject');
    Route::post('/bookings/{id}/complete', [ProviderBookingController::class, 'complete'])->name('api.provider.bookings.complete');
    Route::delete('/bookings/{id}', [ProviderBookingController::class, 'destroy'])->name('api.provider.bookings.destroy');
    
    // Calendar & Availability
    Route::get('/calendar', [CalendarController::class, 'index'])->name('api.provider.calendar.index');
    Route::post('/calendar/slots', [CalendarController::class, 'storeSlot'])->name('api.provider.calendar.slots.store');
    Route::put('/calendar/slots/{id}', [CalendarController::class, 'updateSlot'])->name('api.provider.calendar.slots.update');
    Route::delete('/calendar/slots/{id}', [CalendarController::class, 'deleteSlot'])->name('api.provider.calendar.slots.delete');
});

// DEV ONLY: Symulacja eventów (tylko w local/dev)
if (app()->environment(['local', 'development'])) {
    Route::middleware(['auth:sanctum'])->prefix('dev')->group(function () {
        Route::post('/simulate-events', [DevEventController::class, 'simulateEvents'])->name('api.dev.simulate-events');
    });
}
