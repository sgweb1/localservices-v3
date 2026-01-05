<?php

use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\Provider\AvailabilityExceptionController;
use App\Http\Controllers\Api\V1\Provider\SettingsController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ProviderDashboardController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ReviewResponseController;
use App\Http\Controllers\Api\V1\AnalyticsController;
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
    Route::get('/dashboard/bookings', [ProviderDashboardController::class, 'bookings'])->name('api.provider.dashboard.bookings');
    Route::get('/dashboard/conversations', [ProviderDashboardController::class, 'conversations'])->name('api.provider.dashboard.conversations');
    Route::get('/dashboard/reviews', [ProviderDashboardController::class, 'reviews'])->name('api.provider.dashboard.reviews');
    Route::get('/dashboard/performance', [ProviderDashboardController::class, 'performance'])->name('api.provider.dashboard.performance');

    // Provider reviews (current authenticated provider)
    Route::get('/reviews', [ReviewController::class, 'selfReviews'])->name('api.provider.reviews.self');
    Route::post('/reviews/{review}/response', [ReviewResponseController::class, 'store'])->name('api.provider.reviews.response.store');
    Route::delete('/reviews/{review}/response', [ReviewResponseController::class, 'destroy'])->name('api.provider.reviews.response.destroy');
    
    // Bookings management (CONSOLIDATED - using BookingController)
    Route::get('/bookings', [BookingController::class, 'index'])->name('api.provider.bookings.index');
    Route::get('/bookings/{id}', [BookingController::class, 'show'])->name('api.provider.bookings.show');
    Route::get('/statistics', [BookingController::class, 'statistics'])->name('api.provider.statistics');
    Route::post('/bookings/complete-overdue', [BookingController::class, 'completeOverdue'])->name('api.provider.bookings.complete-overdue');
    Route::post('/bookings/{id}/accept', [BookingController::class, 'accept'])->name('api.provider.bookings.accept');
    Route::post('/bookings/{id}/decline', [BookingController::class, 'reject'])->name('api.provider.bookings.decline');
    Route::post('/bookings/{id}/send-quote', [BookingController::class, 'sendQuote'])->name('api.provider.bookings.send-quote');
    Route::post('/bookings/{id}/start', [BookingController::class, 'start'])->name('api.provider.bookings.start');
    Route::post('/bookings/{id}/complete', [BookingController::class, 'complete'])->name('api.provider.bookings.complete');
    Route::patch('/bookings/{id}/confirm', [BookingController::class, 'confirm'])->name('api.provider.bookings.confirm');
    Route::patch('/bookings/{id}/reject-booking', [BookingController::class, 'reject'])->name('api.provider.bookings.reject-booking');
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy'])->name('api.provider.bookings.destroy');
    Route::post('/bookings/{id}/restore', [BookingController::class, 'restore'])->name('api.provider.bookings.restore');
    
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
    
    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'providerDashboard'])->name('api.provider.analytics');

    // Subscription (current plan)
    Route::get('/subscription', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'getProviderSubscription'])->name('api.provider.subscription');
    
    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('api.provider.settings.index');
        Route::put('/business', [SettingsController::class, 'updateBusiness'])->name('api.provider.settings.business');
        Route::post('/logo', [SettingsController::class, 'uploadLogo'])->name('api.provider.settings.logo');
        Route::delete('/logo', [SettingsController::class, 'deleteLogo'])->name('api.provider.settings.logo.delete');
        Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('api.provider.settings.notifications');
        Route::put('/password', [SettingsController::class, 'updatePassword'])->name('api.provider.settings.password');
        Route::put('/subdomain', [SettingsController::class, 'updateSubdomain'])->name('api.provider.settings.subdomain');
    });
});
