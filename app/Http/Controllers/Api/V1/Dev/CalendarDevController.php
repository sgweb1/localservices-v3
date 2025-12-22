<?php

namespace App\Http\Controllers\Api\V1\Dev;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * DEV Controller dla kalendarza - generowanie testowych rezerwacji
 * 
 * Tylko dla local/development environment
 */
class CalendarDevController extends Controller
{
    /**
     * Generuj testowe rezerwacje
     * 
     * POST /api/v1/dev/calendar/generate-bookings
     */
    public function generateBookings(Request $request): JsonResponse
    {
        if (!app()->environment(['local', 'development'])) {
            return response()->json(['error' => 'Dostępne tylko w środowisku deweloperskim'], 403);
        }

        $providerId = $request->user()->id;
        
        $slotId = $request->input('slotId');
        $count = min($request->input('count', 5), 50); // Max 50
        $dateRange = $request->input('dateRange', 'thisWeek');
        $status = $request->input('status', 'confirmed');

        // Pobierz sloty providera
        $query = Availability::where('provider_id', $providerId)
            ->where('is_available', true);
        
        if ($slotId) {
            $query->where('id', $slotId);
        }
        
        $slots = $query->get();

        if ($slots->isEmpty()) {
            return response()->json(['error' => 'Brak dostępnych slotów'], 404);
        }

        // Pobierz jedną usługę providera (do rezerwacji)
        $service = Service::where('provider_id', $providerId)->first();
        
        if (!$service) {
            return response()->json(['error' => 'Provider nie ma żadnych usług'], 404);
        }

        // Utwórz testowego customera jeśli nie istnieje
        $customer = User::firstOrCreate(
            ['email' => 'test-customer@localservices.dev'],
            [
                'name' => 'Test Customer (DEV)',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'role' => 'customer',
            ]
        );

        // Oblicz zakres dat
        $dates = $this->getDateRange($dateRange);

        $created = 0;
        $errors = [];
        
        for ($i = 0; $i < $count; $i++) {
            // Losowy slot
            $slot = $slots->random();
            
            // Losowa data z zakresu
            $date = $dates[array_rand($dates)];
            
            // Sprawdź czy data pasuje do day_of_week slotu
            $dayOfWeek = date('N', strtotime($date)); // 1-7 (poniedziałek-niedziela)
            
            if ($dayOfWeek != $slot->day_of_week) {
                // Znajdź najbliższą datę pasującą do day_of_week
                $date = $this->getNextDateForDayOfWeek($date, $slot->day_of_week);
            }

            // Utwórz rezerwację
            try {
                $servicePrice = $service->base_price ?? 100;
                $travelFee = 0;
                $platformFee = 0;
                $totalPrice = $servicePrice + $travelFee + $platformFee;
                
                // Oblicz duration_minutes z różnicy między start_time i end_time
                $startTime = \Carbon\Carbon::parse($slot->start_time);
                $endTime = \Carbon\Carbon::parse($slot->end_time);
                $durationMinutes = $startTime->diffInMinutes($endTime);
                
                Booking::create([
                    'uuid' => Str::uuid(),
                    'booking_number' => 'BK-DEV-' . strtoupper(Str::random(6)),
                    'provider_id' => $providerId,
                    'customer_id' => $customer->id,
                    'service_id' => $service->id,
                    'booking_date' => $date,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'duration_minutes' => $durationMinutes,
                    'status' => $status,
                    'service_price' => $servicePrice,
                    'travel_fee' => $travelFee,
                    'platform_fee' => $platformFee,
                    'total_price' => $totalPrice,
                    'service_address' => 'Test Address (DEV)',
                    'is_test_data' => true,
                ]);
                
                $created++;
            } catch (\Exception $e) {
                // Zapisz błąd do logów
                \Log::warning('DEV: Failed to create booking', [
                    'error' => $e->getMessage(),
                    'date' => $date,
                    'slot_id' => $slot->id,
                ]);
                $errors[] = $e->getMessage();
                continue;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Wygenerowano {$created} rezerwacji",
            'count' => $created,
            'errors' => array_unique($errors), // Unikalne błędy dla debugowania
        ]);
    }

    /**
     * Usuń testowe rezerwacje
     * 
     * DELETE /api/v1/dev/calendar/clear-test-bookings
     */
    public function clearTestBookings(Request $request): JsonResponse
    {
        if (!app()->environment(['local', 'development'])) {
            return response()->json(['error' => 'Dostępne tylko w środowisku deweloperskim'], 403);
        }

        $providerId = $request->user()->id;

        // Usuń tylko rezerwacje oznaczone jako testowe
        $deleted = Booking::where('provider_id', $providerId)
            ->where('is_test_data', true)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "Usunięto {$deleted} testowych rezerwacji",
            'deleted' => $deleted,
        ]);
    }

    /**
     * Oblicz zakres dat na podstawie parametru
     */
    private function getDateRange(string $range): array
    {
        $dates = [];
        
        switch ($range) {
            case 'thisWeek':
                $start = now()->startOfWeek();
                $end = now()->endOfWeek();
                break;
            case 'nextWeek':
                $start = now()->addWeek()->startOfWeek();
                $end = now()->addWeek()->endOfWeek();
                break;
            case 'thisMonth':
                $start = now()->startOfMonth();
                $end = now()->endOfMonth();
                break;
            default:
                $start = now();
                $end = now()->addWeek();
        }

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dates[] = $date->format('Y-m-d');
        }

        return $dates;
    }

    /**
     * Znajdź następną datę pasującą do day_of_week
     */
    private function getNextDateForDayOfWeek(string $startDate, int $targetDayOfWeek): string
    {
        $date = new \DateTime($startDate);
        $currentDayOfWeek = (int) $date->format('N');
        
        // Oblicz różnicę dni
        $diff = $targetDayOfWeek - $currentDayOfWeek;
        
        if ($diff <= 0) {
            $diff += 7; // Następny tydzień
        }
        
        $date->modify("+{$diff} days");
        
        return $date->format('Y-m-d');
    }
}
