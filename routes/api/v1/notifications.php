<?php

use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\NotificationPreferenceController;
use App\Http\Controllers\Api\V1\NotificationTestController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Notification history
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Notification preferences
    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'index']);
    Route::put('/notification-preferences/{eventId}', [NotificationPreferenceController::class, 'update']);
    Route::post('/notification-preferences/reset', [NotificationPreferenceController::class, 'reset']);
    
    // Test notifications (dev only)
    Route::post('/notifications/{eventId}/test', [NotificationTestController::class, 'test']);
});
