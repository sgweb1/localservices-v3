<?php

use App\Http\Controllers\Api\V1\Dev\CalendarDevController;
use App\Http\Controllers\Api\V1\Dev\DevEventController;
use App\Http\Controllers\Api\V1\Dev\DevAuthController;
use App\Http\Controllers\Api\V1\Dev\DevUsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DEV API Routes
|--------------------------------------------------------------------------
|
| Development only routes for testing and debugging.
| Only available in local/development environments.
|
*/

if (app()->environment(['local', 'development'])) {
    Route::prefix('dev')->group(function () {
        Route::post('/quick-login', [DevAuthController::class, 'quickLogin'])->name('api.dev.quick-login');
        Route::post('/simulate-events', [DevEventController::class, 'simulateEvents'])->name('api.dev.simulate-events');
        Route::get('/users', [DevUsersController::class, 'index'])->name('api.dev.users');
        
        // Calendar DEV Tools
        Route::post('/calendar/generate-bookings', [CalendarDevController::class, 'generateBookings'])->name('api.dev.calendar.generate-bookings');
        Route::delete('/calendar/clear-test-bookings', [CalendarDevController::class, 'clearTestBookings'])->name('api.dev.calendar.clear-test-bookings');
    });
}
