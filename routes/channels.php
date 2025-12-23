<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/**
 * Prywatny kanał użytkownika
 * Używany do powiadomień toast, chat, live updates
 * 
 * Użytkownik może nasłuchiwać tylko swojego kanału
 */
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

/**
 * Kanał providera - dashboard updates, nowe bookings, wiadomości
 * Tylko provider może nasłuchiwać swojego kanału
 */
Broadcast::channel('provider.{providerId}', function ($user, $providerId) {
    return $user->provider && (int) $user->provider->id === (int) $providerId;
});

/**
 * Kanał konkretnego bookingu - live status updates
 * Dostęp mają tylko customer i provider związani z tym bookingiem
 */
Broadcast::channel('booking.{bookingId}', function ($user, $bookingId) {
    $booking = \App\Models\Booking::find($bookingId);
    
    if (!$booking) {
        return false;
    }
    
    // Customer lub provider związany z tym bookingiem
    return (int) $user->id === (int) $booking->customer_id 
        || ($user->provider && (int) $user->provider->id === (int) $booking->provider_id);
});
