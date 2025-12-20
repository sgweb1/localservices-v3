<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * CalendarController - Zarządzanie kalendarzem dostępności providera
 * 
 * Endpoints:
 * - GET /provider/calendar - Pobierz kalendarz
 * - POST /provider/calendar/slots - Dodaj slot
 * - PUT /provider/calendar/slots/{id} - Edytuj slot  
 * - DELETE /provider/calendar/slots/{id} - Usuń slot
 */
class CalendarController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Pobierz kalendarz providera z rezerwacjami
     * 
     * GET /api/v1/provider/calendar
     */
    public function index(Request $request): JsonResponse
    {
        $providerId = $request->user()->id;

        // Pobierz sloty dostępności
        $slots = Availability::where('provider_id', $providerId)
            ->where('is_available', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($slot) {
                return [
                    'id' => $slot->id,
                    'day_of_week' => $slot->day_of_week,
                    'day_name' => $this->getDayName($slot->day_of_week),
                    'start_time' => substr($slot->start_time, 0, 5), // HH:MM
                    'end_time' => substr($slot->end_time, 0, 5),
                    'break_time_start' => $slot->break_time_start,
                    'break_time_end' => $slot->break_time_end,
                    'max_bookings' => $slot->max_bookings,
                    'current_bookings' => $slot->current_bookings,
                    'is_available' => $slot->is_available,
                ];
            });

        // Pobierz rezerwacje na najbliższe 2 tygodnie
        $startDate = now()->startOfWeek();
        $endDate = now()->addWeeks(2)->endOfWeek();

        $bookings = Booking::where('provider_id', $providerId)
            ->where('hidden_by_provider', false)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('booking_date', [$startDate, $endDate])
            ->with(['customer:id,name,email', 'service:id,name'])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_date' => $booking->booking_date,
                    'day_of_week' => date('N', strtotime($booking->booking_date)), // 1-7
                    'start_time' => substr($booking->start_time ?? '00:00:00', 0, 5),
                    'end_time' => substr($booking->end_time ?? '00:00:00', 0, 5),
                    'customer_name' => $booking->customer->name ?? 'Nieznany',
                    'service_name' => $booking->service->name ?? 'Nieznana usługa',
                    'status' => $booking->status,
                    'duration_minutes' => $booking->duration_minutes,
                ];
            });

        return response()->json([
            'slots' => $slots,
            'bookings' => $bookings,
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Dodaj nowy slot dostępności
     * 
     * POST /api/v1/provider/calendar/slots
     */
    public function storeSlot(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'day_of_week' => 'required|integer|min:1|max:7',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'max_bookings' => 'nullable|integer|min:1|max:100',
            'break_time_start' => 'nullable|date_format:H:i',
            'break_time_end' => 'nullable|date_format:H:i|after:break_time_start',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Nieprawidłowe dane',
                'errors' => $validator->errors(),
            ], 422);
        }

        $providerId = $request->user()->id;

        // Sprawdź konflikty
        $conflict = Availability::where('provider_id', $providerId)
            ->where('day_of_week', $request->day_of_week)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'error' => 'Konflikt czasowy - slot nachodzi na istniejącą dostępność',
            ], 422);
        }

        $slot = Availability::create([
            'provider_id' => $providerId,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'max_bookings' => $request->max_bookings ?? 10,
            'break_time_start' => $request->break_time_start,
            'break_time_end' => $request->break_time_end,
            'is_available' => true,
        ]);

        return response()->json([
            'message' => 'Slot dostępności został dodany',
            'slot' => [
                'id' => $slot->id,
                'day_of_week' => $slot->day_of_week,
                'day_name' => $this->getDayName($slot->day_of_week),
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
                'max_bookings' => $slot->max_bookings,
            ],
        ], 201);
    }

    /**
     * Edytuj slot dostępności
     * 
     * PUT /api/v1/provider/calendar/slots/{id}
     */
    public function updateSlot(Request $request, int $id): JsonResponse
    {
        $providerId = $request->user()->id;

        $slot = Availability::where('provider_id', $providerId)->find($id);

        if (!$slot) {
            return response()->json(['error' => 'Slot nie został znaleziony'], 404);
        }

        $validator = Validator::make($request->all(), [
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'max_bookings' => 'nullable|integer|min:1|max:100',
            'is_available' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Nieprawidłowe dane',
                'errors' => $validator->errors(),
            ], 422);
        }

        $slot->update($request->only(['start_time', 'end_time', 'max_bookings', 'is_available', 'break_time_start', 'break_time_end']));

        return response()->json([
            'message' => 'Slot został zaktualizowany',
            'slot' => [
                'id' => $slot->id,
                'day_of_week' => $slot->day_of_week,
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
                'max_bookings' => $slot->max_bookings,
                'is_available' => $slot->is_available,
            ],
        ]);
    }

    /**
     * Usuń slot dostępności
     * 
     * DELETE /api/v1/provider/calendar/slots/{id}
     */
    public function deleteSlot(Request $request, int $id): JsonResponse
    {
        $providerId = $request->user()->id;

        $slot = Availability::where('provider_id', $providerId)->find($id);

        if (!$slot) {
            return response()->json(['error' => 'Slot nie został znaleziony'], 404);
        }

        // Sprawdź czy są rezerwacje w tym slocie
        $hasBookings = Booking::where('provider_id', $providerId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereRaw('DAYOFWEEK(booking_date) = ?', [$slot->day_of_week + 1]) // MySQL DAYOFWEEK: 1=niedziela
            ->whereBetween(DB::raw('TIME(start_time)'), [$slot->start_time, $slot->end_time])
            ->exists();

        if ($hasBookings) {
            return response()->json([
                'error' => 'Nie można usunąć slotu z aktywnymi rezerwacjami',
            ], 422);
        }

        $slot->delete();

        return response()->json([
            'message' => 'Slot został usunięty',
        ]);
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
