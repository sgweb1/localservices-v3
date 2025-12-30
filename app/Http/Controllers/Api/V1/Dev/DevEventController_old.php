<?php

namespace App\Http\Controllers\Api\V1\Dev;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DevEventController extends Controller
{
    public function simulateEvents(Request $request): JsonResponse
    {
        // Zabezpieczenie: tylko w dev/local
        if (!app()->environment(['local', 'development'])) {
            abort(403, 'Endpoint dostępny tylko w trybie dev');
        }

        // Pobierz user z auth (session lub guard)
        $user = auth('sanctum')->user() ?? auth()->user();
        
        \Log::info('[DevEventController] simulateEvents called', [
            'user_id' => $user?->id,
            'user_type' => $user?->user_type,
        ]);

        if (!$user || $user->user_type !== UserType::Provider) {
            \Log::warning('[DevEventController] Unauthorized request');
            return response()->json([
                'success' => false,
                'message' => 'Musisz być zalogowany jako provider',
            ], 401);
        }

        $created = [
            'bookings' => [],
            'reviews' => [],
        ];

        try {
            // Pobierz services i customers
            $services = Service::where('provider_id', $user->id)->limit(10)->pluck('id')->toArray();
            $customers = User::where('user_type', UserType::Customer)->limit(10)->pluck('id')->toArray();

            \Log::info('[DevEventController] Data check', [
                'services' => count($services),
                'customers' => count($customers),
            ]);

            // Utwórz 3 bookings
            if (!empty($services) && !empty($customers)) {
                Booking::withoutEvents(function () use ($services, $customers, $user, &$created) {
                    for ($i = 0; $i < 3; $i++) {
                        try {
                            $booking = Booking::forceCreate([
                                'uuid' => Str::uuid(),
                                'booking_number' => 'BK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
                                'customer_id' => Arr::random($customers),
                                'provider_id' => $user->id,
                                'service_id' => Arr::random($services),
                                'booking_date' => now()->addDays(rand(1, 14))->toDateString(),
                                'start_time' => Arr::random(['08:00:00', '10:00:00', '14:00:00', '16:00:00', '18:00:00']),
                                'end_time' => Arr::random(['09:00:00', '11:00:00', '15:00:00', '17:00:00', '19:00:00']),
                                'duration_minutes' => 60,
                                'service_address' => json_encode([
                                    'street' => Arr::random(['ul. Marszałkowska 15', 'ul. Grodzka 25', 'ul. Świdnicka 40']),
                                    'city' => Arr::random(['Warszawa', 'Kraków', 'Wrocław']),
                                    'postal_code' => '00-000',
                                ]),
                                'service_price' => Arr::random([100, 150, 200, 250]),
                                'travel_fee' => rand(0, 50),
                                'platform_fee' => rand(5, 20),
                                'total_price' => rand(100, 300),
                                'currency' => 'PLN',
                                'payment_status' => 'pending',
                                'status' => 'confirmed',
                                'confirmed_at' => now(),
                                'customer_notes' => Arr::random([
                                    'Potrzebuję pomocy z matematyką dla klasy 8.',
                                    'Przygotowanie do matury z angielskiego.',
                                    'Egzamin za 2 tygodnie - pilne!',
                                    'Wsparcie w chemii - weekend by się przydał.',
                                    'Lekcja próbna z programowania.',
                                ]),
                            ]);

                            $created['bookings'][] = [
                                'id' => $booking->id,
                                'booking_number' => $booking->booking_number,
                                'booking_date' => $booking->booking_date,
                            ];

                            \Log::info('[DevEventController] Created booking', ['id' => $booking->id]);
                        } catch (\Exception $e) {
                            \Log::error('[DevEventController] Error creating booking', ['error' => $e->getMessage()]);
                        }
                    }
                });
            }

            // Utwórz 2 reviews
            $completedBookings = Booking::where('provider_id', $user->id)
                ->where('status', 'completed')
                ->limit(5)
                ->pluck('id')
                ->toArray();

            if (!empty($customers) && !empty($completedBookings)) {
                for ($i = 0; $i < 2; $i++) {
                    try {
                        $review = Review::create([
                            'uuid' => Str::uuid(),
                            'booking_id' => Arr::random($completedBookings),
                            'reviewer_id' => Arr::random($customers),
                            'reviewed_id' => $user->id,
                            'rating' => rand(4, 5),
                            'comment' => Arr::random([
                                'Świetne podejście do ucznia! Polecam.',
                                'Profesjonalne przygotowanie lekcji. Widać efekty.',
                                'Bardzo pomocny nauczyciel. Córka poprawiła oceny.',
                                'Doskonała komunikacja i dostosowanie materiałów do poziomu.',
                                'Zajęcia ciekawe i merytoryczne. Na pewno wrócimy!',
                            ]),
                            'is_visible' => true,
                            'published_at' => now(),
                        ]);

                        $created['reviews'][] = [
                            'id' => $review->id,
                            'rating' => $review->rating,
                        ];
                    } catch (\Exception $e) {
                        \Log::error('[DevEventController] Error creating review', ['error' => $e->getMessage()]);
                    }
                }
            }

        } catch (\Exception $e) {
            \Log::error('[DevEventController] Top-level error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Utworzono testowe rezerwacje',
            'created' => $created,
            'summary' => [
                'bookings' => count($created['bookings']),
                'reviews' => count($created['reviews']),
            ],
        ]);
    }
}
