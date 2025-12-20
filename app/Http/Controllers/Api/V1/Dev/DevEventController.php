<?php

namespace App\Http\Controllers\Api\V1\Dev;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\BookingRequest;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * DevEventController - endpoint dla developerów do symulacji eventów
 * 
 * TYLKO W DEV MODE!
 */
class DevEventController extends Controller
{
    /**
     * Symuluje nowe wydarzenia dla providera
     * 
     * Tworzy:
     * - 3 booking requests
     * - 2 reviews
     * - Opcjonalnie powiadomienia
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function simulateEvents(Request $request): JsonResponse
    {
        // Zabezpieczenie: tylko w dev/local
        if (!app()->environment(['local', 'development'])) {
            abort(403, 'Endpoint dostępny tylko w trybie dev');
        }

        $user = $request->user();

        if (!$user || $user->user_type !== UserType::Provider) {
            return response()->json([
                'success' => false,
                'message' => 'Musisz być zalogowany jako provider',
            ], 403);
        }

        $created = [
            'booking_requests' => [],
            'reviews' => [],
        ];

        // 1. Symuluj 3 nowe booking requests
        $services = Service::where('provider_id', $user->id)->pluck('id')->toArray();
        $customers = User::where('user_type', UserType::Customer)->limit(5)->pluck('id')->toArray();

        if (!empty($services) && !empty($customers)) {
            for ($i = 0; $i < 3; $i++) {
                $request = BookingRequest::create([
                    'provider_id' => $user->id,
                    'customer_id' => Arr::random($customers),
                    'service_id' => Arr::random($services),
                    'description' => Arr::random([
                        'Potrzebuję pomocy z matematyką dla klasy 8. Termin: przyszły tydzień.',
                        'Czy możesz pomóc mojemu synowi przygotować się do matury z angielskiego?',
                        'Szukam korepetycji z fizyki. Pilne - egzamin za 2 tygodnie!',
                        'Córka potrzebuje wsparcia w chemii. Czy masz dostępny termin w weekend?',
                        'Chciałbym umówić się na lekcję próbną z programowania dla dziecka.',
                    ]),
                    'service_address' => Arr::random([
                        'Warszawa, ul. Marszałkowska 15',
                        'Kraków, ul. Grodzka 25',
                        'Wrocław, ul. Świdnicka 40',
                        'Poznań, ul. Święty Marcin 30',
                    ]),
                    'status' => 'pending',
                    'request_number' => 'RQ-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
                    'created_at' => now()->subMinutes(rand(1, 30)),
                ]);

                $created['booking_requests'][] = [
                    'id' => $request->id,
                    'request_number' => $request->request_number,
                    'created_at' => $request->created_at->diffForHumans(),
                ];
            }
        }

        // 2. Symuluj 2 nowe reviews
        // Pobierz completed bookings dla tego providera
        $completedBookings = \App\Models\Booking::where('provider_id', $user->id)
            ->where('status', 'completed')
            ->pluck('id')
            ->toArray();

        if (!empty($customers) && !empty($completedBookings)) {
            for ($i = 0; $i < 2; $i++) {
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
                    'created_at' => now()->subMinutes(rand(5, 60)),
                ]);

                $created['reviews'][] = [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'created_at' => $review->created_at->diffForHumans(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Utworzono testowe wydarzenia',
            'created' => $created,
            'summary' => [
                'booking_requests' => count($created['booking_requests']),
                'reviews' => count($created['reviews']),
            ],
        ]);
    }
}
