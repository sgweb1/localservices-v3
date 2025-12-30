<?php

use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\ProviderController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\MonetizationController;
use App\Http\Controllers\Api\V1\VisibilityController;
use Illuminate\Support\Facades\Route;

/**
 * API v1 - Marketplace routes
 */

Route::middleware(['api'])->group(function () {
    // Monetyzacja i widoczność
    Route::get('/monetization/flags', [MonetizationController::class, 'flags']);
    Route::get('/visibility/preview', [VisibilityController::class, 'preview']);
    Route::get('/visibility/providers/{city}', [VisibilityController::class, 'providers']);

    // Lokalizacje - publiczne
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/locations/major-cities', [LocationController::class, 'majorCities']);
    Route::get('/locations/{id}', [LocationController::class, 'show']);
    Route::get('/locations/by-slug/{slug}', [LocationController::class, 'bySlug']);

    // Kategorie usług - publiczne
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

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
    
    // Tworzenie rezerwacji - wymaga autentykacji
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    });

    // Akcje providera na rezerwacjach - wymaga autentykacji
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/provider/bookings', [BookingController::class, 'providerIndex']);
        Route::post('/provider/bookings/{id}/accept', [BookingController::class, 'accept']);
        Route::post('/provider/bookings/{id}/decline', [BookingController::class, 'decline']);
        Route::post('/provider/bookings/{id}/send-quote', [BookingController::class, 'sendQuote']);
        Route::post('/provider/bookings/{id}/start', [BookingController::class, 'start']);
        Route::post('/provider/bookings/{id}/complete', [BookingController::class, 'complete']);
    });

    // Recenzje - publiczne
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::get('/providers/{providerId}/reviews', [ReviewController::class, 'providerReviews']);
    Route::get('/providers/{providerId}/rating', [ReviewController::class, 'providerRating']);

    // Chat - wymaga autoryzacji
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/conversations', [ChatController::class, 'conversations']);
        Route::post('/conversations', [ChatController::class, 'store']);
        Route::get('/conversations/{conversationId}', [ChatController::class, 'show']);
        Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'messages']);
        Route::post('/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
        Route::delete('/conversations/{conversationId}/messages/{messageId}', [ChatController::class, 'deleteMessage']);
        Route::post('/conversations/{conversationId}/mark-read', [ChatController::class, 'markAsRead']);
        Route::post('/conversations/{conversationId}/hide', [ChatController::class, 'hideConversation']);
        Route::post('/conversations/{conversationId}/unhide', [ChatController::class, 'unhideConversation']);
        Route::get('/unread-count', [ChatController::class, 'unreadCount']);
    });

    // Provider profile - publiczne
    Route::get('/providers/{providerId}/verification', [ProviderController::class, 'verifications']);
    Route::get('/providers/{providerId}/trust-score', [ProviderController::class, 'trustScore']);
    Route::get('/providers/{providerId}/certifications', [ProviderController::class, 'certifications']);
    Route::get('/providers/{providerId}/portfolio', [ProviderController::class, 'portfolio']);
    Route::get('/providers/{providerId}/service-areas', [ProviderController::class, 'serviceAreas']);
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
