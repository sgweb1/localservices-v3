<?php

use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\ProviderController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ServiceController;
use Illuminate\Support\Facades\Route;

/**
 * API v1 - Marketplace routes
 */

Route::middleware(['api'])->group(function () {
    // Usługi - publiczne
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::get('/services/by-category/{category}', [ServiceController::class, 'byCategory']);
    Route::get('/services/by-city/{city}', [ServiceController::class, 'byCity']);
    Route::get('/providers/{providerId}/services', [ServiceController::class, 'providerServices']);

    // Rezerwacje - publiczne
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::get('/providers/{providerId}/bookings', [BookingController::class, 'providerBookings']);
    Route::get('/customers/{customerId}/bookings', [BookingController::class, 'customerBookings']);

    // Recenzje - publiczne
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::get('/providers/{providerId}/reviews', [ReviewController::class, 'providerReviews']);
    Route::get('/providers/{providerId}/rating', [ReviewController::class, 'providerRating']);

    // Chat - wymaga autoryzacji
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/conversations', [ChatController::class, 'conversations']);
        Route::get('/conversations/{conversationId}', [ChatController::class, 'show']);
        Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'messages']);
        Route::get('/unread-count', [ChatController::class, 'unreadCount']);
    });

    // Provider profile - publiczne
    Route::get('/providers/{providerId}/verification', [ProviderController::class, 'verifications']);
    Route::get('/providers/{providerId}/trust-score', [ProviderController::class, 'trustScore']);
    Route::get('/providers/{providerId}/certifications', [ProviderController::class, 'certifications']);
    Route::get('/providers/{providerId}/portfolio', [ProviderController::class, 'portfolio']);
    Route::get('/providers/{providerId}/schedule', [ProviderController::class, 'schedule']);
    Route::get('/providers/{providerId}/available-slots', [ProviderController::class, 'availableSlots']);

    // Analytics - publiczne (będzie chronione w produkcji)
    Route::get('/analytics/providers/{providerId}/metrics', [AnalyticsController::class, 'providerMetrics']);
    Route::get('/analytics/providers/{providerId}/today', [AnalyticsController::class, 'providerTodayMetrics']);
    Route::get('/analytics/endpoints', [AnalyticsController::class, 'endpointMetrics']);
    Route::get('/analytics/funnel', [AnalyticsController::class, 'funnelMetrics']);
    Route::get('/analytics/search', [AnalyticsController::class, 'searchMetrics']);
    Route::get('/analytics/search-stats', [AnalyticsController::class, 'searchStats']);
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
});
