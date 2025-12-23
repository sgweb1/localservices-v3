<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Services\Notifications\SubscribeToPushService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushSubscriptionController extends Controller
{
    public function __construct(private SubscribeToPushService $subscribeToPushService)
    {
        $this->middleware('auth:web');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ]);

        $subscription = $this->subscribeToPushService->handle(
            $request->user(),
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
        );

        return response()->json([
            'id' => $subscription->id,
            'endpoint' => $subscription->endpoint,
            'is_active' => $subscription->is_active,
        ], Response::HTTP_CREATED);
    }

    public function destroy(PushSubscription $subscription)
    {
        $this->authorize('delete', $subscription);

        $subscription->delete();

        return response()->noContent();
    }

    /**
     * Zasubskrybuj urządzenie do push notifications z serwera
     * Umożliwia włączenie push bez interakcji UI (np. podczas testowania)
     * 
     * POST /api/v1/push/enable
     */
    public function enable(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
            'auth' => 'required|string',
            'p256dh' => 'required|string',
        ]);

        $user = $request->user();

        // Sprawdź czy już istnieje taka subskrypcja
        $existing = PushSubscription::where('user_id', $user->id)
            ->where('endpoint', $validated['endpoint'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Subskrypcja już istnieje',
                'data' => $existing,
            ]);
        }

        $subscription = PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $validated['endpoint'],
            'auth' => $validated['auth'],
            'p256dh' => $validated['p256dh'],
            'last_used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subskrypcja włączona',
            'data' => $subscription,
        ]);
    }

    /**
     * Pobierz stan push subscriptions
     * 
     * GET /api/v1/push/status
     */
    public function status(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $subscriptions = $user->pushSubscriptions()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'has_subscription' => $subscriptions > 0,
                'count' => $subscriptions,
            ],
        ]);
    }}