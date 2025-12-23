<?php

namespace App\Observers;

use App\Models\Booking;
use App\Models\Availability;
use App\Services\Notifications\NotificationDispatcher;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * BookingObserver - Obserwuje zmiany w rezerwacjach
 * 
 * Automatyczne akcje:
 * - Przy confirmed: rezerwuje slot w kalendarzu
 * - Przy cancelled: zwalnia slot w kalendarzu
 * - Wysyła powiadomienia o zmianach slotu
 */
class BookingObserver
{
    public function __construct(
        private NotificationDispatcher $notifications
    ) {}

    /**
     * Nowa rezerwacja → powiadom providera.
     */
    public function created(Booking $booking): void
    {
        if ($booking->provider) {
            $this->notifications->send(
                eventKey: 'booking.created',
                user: $booking->provider,
                recipientType: 'provider',
                variables: [
                    'booking_id' => $booking->id,
                    'customer_name' => $booking->customer->name ?? '',
                    'service_name' => $booking->service->name ?? '',
                    'scheduled_date' => optional($booking->booking_date)->toDateString(),
                    'start_time' => $booking->start_time,
                ],
            );
        }
    }

    /**
     * Po aktualizacji rezerwacji
     */
    public function updated(Booking $booking): void
    {
        // Sprawdź czy status się zmienił
        if ($booking->isDirty('status')) {
            $oldStatus = $booking->getOriginal('status');
            $newStatus = $booking->status;

            Log::info('Booking status changed', [
                'booking_id' => $booking->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);

            // Jeśli rezerwacja została potwierdzona
            if ($newStatus === 'confirmed' && $oldStatus === 'pending') {
                $this->reserveSlot($booking);
                if ($booking->customer) {
                    $this->notifications->send(
                        'booking.accepted',
                        $booking->customer,
                        'customer',
                        [
                            'booking_id' => $booking->id,
                            'provider_name' => $booking->provider->name ?? '',
                        ]
                    );
                }
            }

            // Jeśli rezerwacja została anulowana lub odrzucona
            if (in_array($newStatus, ['cancelled', 'rejected']) && $oldStatus !== $newStatus) {
                $this->releaseSlot($booking);
                foreach ([$booking->customer, $booking->provider] as $user) {
                    if ($user) {
                        $this->notifications->send(
                            'booking.cancelled',
                            $user,
                            $user->isProvider() ? 'provider' : 'customer',
                            [
                                'booking_id' => $booking->id,
                                'status' => $newStatus,
                            ]
                        );
                    }
                }
            }

            // Jeśli rezerwacja została ukończona
            if ($newStatus === 'completed' && $oldStatus === 'confirmed') {
                $this->releaseSlot($booking);
                foreach ([$booking->customer, $booking->provider] as $user) {
                    if ($user) {
                        $this->notifications->send(
                            'booking.completed',
                            $user,
                            $user->isProvider() ? 'provider' : 'customer',
                            [
                                'booking_id' => $booking->id,
                            ]
                        );
                    }
                }
            }
        }
    }

    /**
     * Zarezerwuj slot w kalendarzu
     */
    private function reserveSlot(Booking $booking): void
    {
        if (!$booking->booking_date || !$booking->provider_id) {
            return;
        }

        // Oblicz dzień tygodnia (1-7, gdzie 1=poniedziałek)
        $dayOfWeek = Carbon::parse($booking->booking_date)->dayOfWeekIso;

        // Znajdź slot w kalendarzu
        $slot = Availability::where('provider_id', $booking->provider_id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where(function ($query) use ($booking) {
                $query->where('start_time', '<=', $booking->start_time ?? '00:00:00')
                      ->where('end_time', '>=', $booking->end_time ?? '23:59:59');
            })
            ->first();

        if ($slot) {
            // Zwiększ licznik rezerwacji w tym slocie
            $slot->increment('current_bookings');

            Log::info('Slot reserved', [
                'slot_id' => $slot->id,
                'booking_id' => $booking->id,
                'current_bookings' => $slot->current_bookings,
                'max_bookings' => $slot->max_bookings,
            ]);

            // Wyślij powiadomienie do providera o zajętym slocie
            if ($booking->provider) {
                $this->notificationService->send(
                    'availability.slot_booked',
                    $booking->provider,
                    'provider',
                    [
                        'provider_name' => $booking->provider->name,
                        'day_of_week' => $this->getDayName($dayOfWeek),
                        'time_slot' => substr($booking->start_time ?? '00:00:00', 0, 5) . '-' . substr($booking->end_time ?? '00:00:00', 0, 5),
                        'booking_id' => $booking->id,
                    ]
                );
            }

            // Sprawdź czy slot jest pełny
            if ($slot->current_bookings >= $slot->max_bookings) {
                Log::warning('Slot is full', [
                    'slot_id' => $slot->id,
                    'current_bookings' => $slot->current_bookings,
                    'max_bookings' => $slot->max_bookings,
                ]);
            }
        } else {
            Log::warning('No matching slot found for booking', [
                'booking_id' => $booking->id,
                'provider_id' => $booking->provider_id,
                'day_of_week' => $dayOfWeek,
                'start_time' => $booking->start_time,
                'end_time' => $booking->end_time,
            ]);
        }
    }

    /**
     * Zwolnij slot w kalendarzu
     */
    private function releaseSlot(Booking $booking): void
    {
        if (!$booking->booking_date || !$booking->provider_id) {
            return;
        }

        // Oblicz dzień tygodnia
        $dayOfWeek = Carbon::parse($booking->booking_date)->dayOfWeekIso;

        // Znajdź slot w kalendarzu
        $slot = Availability::where('provider_id', $booking->provider_id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where(function ($query) use ($booking) {
                $query->where('start_time', '<=', $booking->start_time ?? '00:00:00')
                      ->where('end_time', '>=', $booking->end_time ?? '23:59:59');
            })
            ->first();

        if ($slot && $slot->current_bookings > 0) {
            // Zmniejsz licznik rezerwacji
            $slot->decrement('current_bookings');

            Log::info('Slot released', [
                'slot_id' => $slot->id,
                'booking_id' => $booking->id,
                'current_bookings' => $slot->current_bookings,
            ]);
        }
    }

    /**
     * Pomocnicza funkcja - nazwa dnia tygodnia
     */
    private function getDayName(int $dayOfWeek): string
    {
        $days = [
            1 => 'Poniedziałek',
            2 => 'Wtorek',
            3 => 'Środa',
            4 => 'Czwartek',
            5 => 'Piątek',
            6 => 'Sobota',
            7 => 'Niedziela',
        ];

        return $days[$dayOfWeek] ?? 'Nieznany';
    }
}
