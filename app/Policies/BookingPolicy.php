<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

/**
 * Policy autoryzacji dla Booking
 * 
 * Definiuje reguły dostępu do rezerwacji:
 * - Właściciele (customer lub provider) mogą przeglądać swoje rezerwacje
 * - Provider nie może rezerwować samego siebie (walidowane w kontrolerze)
 * - Customer może anulować do 24h przed booking_date
 * - Provider może zaktualizować status rezerwacji
 */
class BookingPolicy
{
    /**
     * Użytkownik może widzieć rezerwację jeśli jest customerem LUB providerem w tej rezerwacji
     */
    public function view(User $user, Booking $booking): bool
    {
        // Role administracyjne mogą zobaczyć wszystkie rezerwacje
        if ($user->hasAnyRole(['super_admin', 'ops_manager', 'support', 'admin'])) {
            return true;
        }

        // Legacy admin check
        if ($user->is_admin ?? false) {
            return true;
        }

        // Właściciele (klient lub provider) mogą zobaczyć swoją rezerwację
        return $booking->customer_id === $user->id 
            || $booking->provider_id === $user->id;
    }

    /**
     * Wszyscy zalogowani użytkownicy mogą tworzyć rezerwacje
     * (self-booking blokowany w walidacji kontrolera)
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Customer może anulować do 24h przed booking_date
     */
    public function cancel(User $user, Booking $booking): bool
    {
        // Admin może anulować zawsze
        if ($user->is_admin ?? false) {
            return true;
        }

        if ($booking->customer_id !== $user->id) {
            return false;
        }

        if ($booking->status !== 'confirmed') {
            return false;
        }

        // Minimalne 24h wyprzedzenie
        return $booking->booking_date->greaterThan(now()->addHours(24));
    }

    /**
     * Provider może zaktualizować status (confirmed → in_progress → completed)
     */
    public function updateStatus(User $user, Booking $booking): bool
    {
        // Admin może zawsze
        if ($user->is_admin ?? false) {
            return true;
        }

        return $booking->provider_id === $user->id;
    }

    /**
     * Właściciele mogą aktualizować swoją rezerwację w określonych statusach
     */
    public function update(User $user, Booking $booking): bool
    {
        // Admin może zawsze
        if ($user->is_admin ?? false) {
            return true;
        }

        // Właściciele mogą aktualizować swoją rezerwację w określonych statusach
        if ($booking->customer_id === $user->id || $booking->provider_id === $user->id) {
            return in_array($booking->status, ['pending', 'confirmed']);
        }

        return false;
    }

    /**
     * Tylko admin może usuwać rezerwacje
     */
    public function delete(User $user, Booking $booking): bool
    {
        return $user->is_admin ?? false;
    }
}
