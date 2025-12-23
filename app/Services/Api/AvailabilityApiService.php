<?php

namespace App\Services\Api;

use App\Models\Availability;
use App\Models\ServiceArea;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service do obsługi API dostępności
 */
class AvailabilityApiService
{
    /**
     * Pobierz dostępność providera
     */
    public function getProviderSchedule(int $providerId): array
    {
        $availabilities = Availability::where('provider_id', $providerId)
            ->where('is_available', true)
            ->get()
            ->groupBy('day_of_week');

        $schedule = [];
        $days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

        for ($i = 0; $i < 7; $i++) {
            $schedule[$days[$i]] = $availabilities->get($i, collect())->map(function ($av) {
                return [
                    'start_time' => $av->start_time,
                    'end_time' => $av->end_time,
                    'max_bookings' => $av->max_bookings,
                    'break_start' => $av->break_start,
                    'break_end' => $av->break_end,
                ];
            })->toArray();
        }

        return $schedule;
    }

    /**
     * Pobierz obszary serwisu providera
     */
    public function getServiceAreas(int $providerId, int $perPage = 50): LengthAwarePaginator
    {
        $perPage = $perPage > 0 ? min($perPage, 100) : 50;

        return ServiceArea::where('provider_id', $providerId)
            ->with('provider')
            ->paginate($perPage);
    }

    /**
     * Sprawdź dostępność dla daty i godziny
     */
    public function isAvailable(int $providerId, string $date, string $startTime, int $durationMinutes = 120): bool
    {
        $dayOfWeek = (int) date('w', strtotime($date));
        if ($dayOfWeek === 0) {
            $dayOfWeek = 7; // Niedziela
        } else {
            $dayOfWeek -= 1; // Konwertuj do 0-6 (Pon-Sob, Niedz=6)
        }

        $availability = Availability::where('provider_id', $providerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $startTime)
            ->where('end_time', '>=', date('H:i', strtotime("+$durationMinutes minutes", strtotime($startTime))))
            ->first();

        return $availability !== null;
    }

    /**
     * Pobierz dostępne sloty dla providera na wybrany dzień
     */
    public function getAvailableSlots(int $providerId, string $date, int $durationMinutes = 120): array
    {
        $dayOfWeek = (int) date('w', strtotime($date));
        if ($dayOfWeek === 0) {
            $dayOfWeek = 7;
        } else {
            $dayOfWeek -= 1;
        }

        $availabilities = Availability::where('provider_id', $providerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->get();

        $slots = [];

        foreach ($availabilities as $av) {
            $current = strtotime($av->start_time);
            $end = strtotime($av->end_time);
            $breakStart = $av->break_start ? strtotime($av->break_start) : null;
            $breakEnd = $av->break_end ? strtotime($av->break_end) : null;

            while ($current + ($durationMinutes * 60) <= $end) {
                $slotEnd = $current + ($durationMinutes * 60);

                // Sprawdź czy slot nie przecina przerwy
                $crossesBreak = false;
                if ($breakStart && $breakEnd) {
                    if (($current < $breakEnd && $slotEnd > $breakStart)) {
                        $crossesBreak = true;
                    }
                }

                if (!$crossesBreak) {
                    $slots[] = date('H:i', $current);
                }

                $current += 30 * 60; // 30-minutowe sloty
            }
        }

        return array_unique($slots);
    }
}
