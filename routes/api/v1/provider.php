<?php

use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\Dev\CalendarDevController;
use App\Http\Controllers\Api\V1\Dev\DevEventController;
use App\Http\Controllers\Api\V1\Provider\AvailabilityExceptionController;
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
    Route::patch('/bookings/{id}/confirm', [\App\Http\Controllers\Api\V1\BookingController::class, 'confirm'])->name('api.provider.bookings.confirm');
    Route::patch('/bookings/{id}/reject-booking', [\App\Http\Controllers\Api\V1\BookingController::class, 'reject'])->name('api.provider.bookings.reject-booking');
    Route::delete('/bookings/{id}', [ProviderBookingController::class, 'destroy'])->name('api.provider.bookings.destroy');
    
    // Calendar & Availability
    Route::get('/calendar', [CalendarController::class, 'index'])->name('api.provider.calendar.index');
    Route::post('/calendar/slots', [CalendarController::class, 'storeSlot'])->name('api.provider.calendar.slots.store');
    Route::put('/calendar/slots/{id}', [CalendarController::class, 'updateSlot'])->name('api.provider.calendar.slots.update');
    Route::delete('/calendar/slots/{id}', [CalendarController::class, 'deleteSlot'])->name('api.provider.calendar.slots.delete');
    
    // Availability Exceptions (Bloki/Urlopy)
    Route::get('/calendar/exceptions', [AvailabilityExceptionController::class, 'index'])->name('api.provider.calendar.exceptions.index');
    Route::post('/calendar/exceptions', [AvailabilityExceptionController::class, 'store'])->name('api.provider.calendar.exceptions.store');
    Route::put('/calendar/exceptions/{id}', [AvailabilityExceptionController::class, 'update'])->name('api.provider.calendar.exceptions.update');
    Route::delete('/calendar/exceptions/{id}', [AvailabilityExceptionController::class, 'destroy'])->name('api.provider.calendar.exceptions.destroy');
});

// DEV ONLY: Symulacja eventów (tylko w local/dev)
if (app()->environment(['local', 'development'])) {
    Route::middleware(['auth:sanctum'])->prefix('dev')->group(function () {
        Route::post('/simulate-events', [DevEventController::class, 'simulateEvents'])->name('api.dev.simulate-events');
        
        // Calendar DEV Tools
        Route::post('/calendar/generate-bookings', [CalendarDevController::class, 'generateBookings'])->name('api.dev.calendar.generate-bookings');
        Route::delete('/calendar/clear-test-bookings', [CalendarDevController::class, 'clearTestBookings'])->name('api.dev.calendar.clear-test-bookings');
    });
}
