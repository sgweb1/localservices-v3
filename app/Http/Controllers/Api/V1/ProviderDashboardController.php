<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Services\Api\ProviderDashboardApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Kontroler API dla dashboardu providera
 */
class ProviderDashboardController extends Controller
{
    public function __construct(
        protected ProviderDashboardApiService $dashboardService
    ) {
    }

    /**
     * Pobiera wszystkie widgety dashboardu providera
     * 
     * GET /api/v1/provider/dashboard/widgets
     * Query params:
     * - fields=pipeline,performance,insights,messages (opcjonalnie, default: wszystkie)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function widgets(Request $request): JsonResponse
    {
        $user = $request->user();

        // Sprawdź czy użytkownik jest providerem (porównanie z ENUMem)
        if (! $user || $user->user_type !== UserType::Provider) {
            return response()->json([
                'message' => 'Tylko providery mają dostęp do tego dashboardu',
            ], 403);
        }

        // Optymalizacja: pobierz tylko żądane widgety (fields query param)
        $requestedFields = $request->query('fields');
        if ($requestedFields) {
            $fields = array_filter(explode(',', $requestedFields));
            $widgets = $this->dashboardService->getDashboardWidgets($user, $fields);
        } else {
            // Default: wszystkie widgety
            $widgets = $this->dashboardService->getDashboardWidgets($user);
        }

        return response()->json([
            'data' => $widgets,
        ]);
    }

    /**
     * Pobiera ostatnie rezerwacje providera
     * 
     * GET /api/v1/provider/dashboard/bookings?limit=5&sort=-created_at
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function bookings(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 5);

        $bookings = $user->bookingsAsProvider()
            ->with(['customer:id,name,avatar', 'service:id,title'])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($booking) => [
                'id' => $booking->id,
                'customer_name' => $booking->customer->name,
                'service' => $booking->service->title,
                'date' => $booking->booking_date->format('Y-m-d'),
                'time' => $booking->start_time,
                'status' => $booking->status,
                'location' => $this->formatLocationAddress($booking->service_address),
            ]);

        return response()->json(['data' => $bookings]);
    }

    /**
     * Pobiera ostatnie wiadomości providera
     * 
     * GET /api/v1/provider/dashboard/conversations?limit=5&sort=-updated_at
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 5);

        // Pobierz konwersacje gdzie provider jest uczestnikiem
        $conversations = \App\Models\Conversation::where(function ($q) use ($user) {
            $q->where('customer_id', $user->id)
              ->orWhere('provider_id', $user->id);
        })
        ->with([
            'messages' => fn ($q) => $q->latest()->limit(1),
            'customer:id,name,avatar',
            'provider:id,name,avatar',
        ])
        ->latest('updated_at')
        ->limit($limit)
        ->get()
        ->map(function ($conv) use ($user) {
            $otherUser = $conv->customer_id === $user->id ? $conv->provider : $conv->customer;
            $lastMessage = $conv->messages->first();

            return [
                'id' => $conv->id,
                'customer_name' => $otherUser->name,
                'last_message' => $lastMessage?->content ?? 'Brak wiadomości',
                'time' => $lastMessage 
                    ? $lastMessage->created_at->diffForHumans()
                    : $conv->updated_at->diffForHumans(),
                'unread' => $conv->unread_count ?? 0,
            ];
        });

        return response()->json(['data' => $conversations]);
    }

    /**
     * Pobiera ostatnie recenzje providera
     * 
     * GET /api/v1/provider/dashboard/reviews?limit=4&sort=-created_at
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function reviews(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 4);

        $reviews = \App\Models\Review::where('reviewed_id', $user->id)
            ->with('reviewer:id,name,avatar')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'customer_name' => $review->reviewer->name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'date' => $review->created_at->format('Y-m-d'),
            ]);

        return response()->json(['data' => $reviews]);
    }

    /**
     * Pobiera metryki wydajności providera
     * 
     * GET /api/v1/provider/dashboard/performance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function performance(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Zbierz metryki wydajności z dostępnych danych
        $totalViews = $user->serviceListings()->sum('views_count') ?? 0;
        
        // Czas odpowiedzi i ocena
        $avgResponseTime = $user->providerProfile?->response_time_hours ?? 0;
        $avgRating = $user->reviewsReceived()
            ->whereNotNull('rating')
            ->avg('rating') ?? null;

        $data = [
            'views' => (int)$totalViews,
            'favorited' => 0, // TODO: Zaimplementować tracking ulubionych usług
            'avg_response_time' => $this->formatResponseTime($avgResponseTime),
            'rating' => $avgRating ? round($avgRating, 1) : null,
            'period_label' => 'Ostatnie 30 dni',
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * Formatuje czas odpowiedzi na czytelny tekst
     */
    private function formatResponseTime(mixed $hours): string
    {
        $hours = (float)$hours; // Konwertuj na float
        
        if ($hours === 0.0 || $hours === 0) {
            return '< 1h';
        }
        
        if ($hours < 1) {
            return (int)($hours * 60) . ' min';
        }
        
        if ($hours < 24) {
            return (int)$hours . 'h';
        }
        
        return round($hours / 24, 1) . ' dni';
    }

    /**
     * Formatuje adres usługi do standardowego formatu
     */
    private function formatLocationAddress(mixed $address): ?array
    {
        if (!$address) {
            return null;
        }

        $decoded = is_string($address)
            ? json_decode($address, true)
            : $address;

        return [
            'street' => $decoded['street'] ?? null,
            'city' => $decoded['city'] ?? null,
            'postal_code' => $decoded['postal_code'] ?? $decoded['postalCode'] ?? null,
        ];
    }
}
