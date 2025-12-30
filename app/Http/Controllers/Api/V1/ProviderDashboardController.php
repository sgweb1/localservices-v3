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

        $bookings = $user->provider_bookings()
            ->with(['customer:id,name,avatar', 'service:id,name'])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($booking) => [
                'id' => $booking->id,
                'customer_name' => $booking->customer->name,
                'service' => $booking->service->name,
                'date' => $booking->scheduled_at->format('Y-m-d'),
                'time' => $booking->scheduled_at->format('H:i'),
                'status' => $booking->status->value,
                'location' => $booking->location,
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

        $reviews = \App\Models\Review::where('provider_id', $user->id)
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
        $profile = $user->providerProfile;

        $data = [
            'response_time' => $profile->response_time_hours ?? 0,
            'completion_rate' => $profile->completion_rate ?? 0,
            'cancellation_rate' => $profile->cancellation_rate ?? 0,
            'customer_satisfaction' => $profile->average_rating ?? 0,
        ];

        return response()->json(['data' => $data]);
    }
}
