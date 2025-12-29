<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RenewSubscriptionRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * API Endpoint do zarządzania subskrypcjami
 * 
 * Routes:
 * - GET /api/v1/subscriptions - Lista subskrypcji użytkownika
 * - GET /api/v1/subscriptions/{subscription} - Szczegóły subskrypcji
 * - PUT /api/v1/subscriptions/{subscription}/renew - Przedłuż subskrypcję
 * - DELETE /api/v1/subscriptions/{subscription} - Anuluj subskrypcję
 */
class SubscriptionController extends Controller
{
    use ApiResponse;

    public function __construct(private SubscriptionService $subscriptionService)
    {
    }

    /**
     * GET /api/v1/subscriptions
     * 
     * Lista aktywnych i anulowanych subskrypcji użytkownika
     */
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Aktywne subskrypcje
        $activeSubscriptions = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan')
            ->orderByDesc('ends_at')
            ->get();

        // Anulowane subskrypcje (do celów historii)
        $cancelledSubscriptions = Subscription::where('user_id', $user->id)
            ->where('status', 'cancelled')
            ->with('plan')
            ->orderByDesc('cancelled_at')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'active_subscriptions' => $activeSubscriptions->map(fn (Subscription $s) => [
                'id' => $s->id,
                'plan_id' => $s->subscription_plan_id,
                'plan_name' => $s->plan->name,
                'plan_slug' => $s->plan->slug,
                'billing_period' => $s->billing_period,
                'status' => $s->status,
                'started_at' => $s->started_at?->toIso8601String(),
                'ends_at' => $s->ends_at?->toIso8601String(),
                'renews_at' => $s->renews_at?->toIso8601String(),
                'auto_renew' => $s->auto_renew,
            ]),
            'cancelled_subscriptions' => $cancelledSubscriptions->map(fn (Subscription $s) => [
                'id' => $s->id,
                'plan_name' => $s->plan->name,
                'cancelled_at' => $s->cancelled_at?->toIso8601String(),
                'reason' => $s->cancellation_reason,
            ]),
        ]);
    }

    /**
     * GET /api/v1/subscriptions/{subscription}
     * 
     * Szczegóły konkretnej subskrypcji
     */
    public function show(Subscription $subscription): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Sprawdzenie uprawnień
        if ($subscription->user_id !== $user->id) {
            return $this->unauthorizedResponse('Brak dostępu do tej subskrypcji');
        }

        $subscription->load('plan');

        return response()->json([
            'success' => true,
            'subscription' => [
                'id' => $subscription->id,
                'plan_id' => $subscription->subscription_plan_id,
                'plan' => [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'slug' => $subscription->plan->slug,
                    'description' => $subscription->plan->description,
                    'price_monthly' => $subscription->plan->price_monthly,
                    'price_yearly' => $subscription->plan->price_yearly,
                ],
                'billing_period' => $subscription->billing_period,
                'status' => $subscription->status,
                'started_at' => $subscription->started_at?->toIso8601String(),
                'ends_at' => $subscription->ends_at?->toIso8601String(),
                'renews_at' => $subscription->renews_at?->toIso8601String(),
                'cancelled_at' => $subscription->cancelled_at?->toIso8601String(),
                'cancellation_reason' => $subscription->cancellation_reason,
                'auto_renew' => $subscription->auto_renew,
                'created_at' => $subscription->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * PUT /api/v1/subscriptions/{subscription}/renew
     * 
     * Przedłużenie aktywnej subskrypcji
     */
    public function renew(RenewSubscriptionRequest $request, Subscription $subscription): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($subscription->user_id !== $user->id) {
            return $this->unauthorizedResponse('Brak dostępu do tej subskrypcji');
        }

        $validated = $request->validated();

        // Sprawdzenie czy subskrypcja jest aktywna
        if ($subscription->status !== 'active' || $subscription->ends_at <= now()) {
            return $this->errorResponse('Subskrypcja nie jest aktywna lub już wygasła', 409);
        }

        try {
            $renewed = $this->subscriptionService->renewSubscription(
                subscription: $subscription,
                newBillingPeriod: $validated['billing_period'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => 'Subskrypcja została przedłużona',
                'data' => [
                    'id' => $renewed->id,
                    'plan_name' => $renewed->plan->name,
                    'billing_period' => $renewed->billing_period,
                    'status' => $renewed->status,
                    'ends_at' => $renewed->ends_at?->toIso8601String(),
                    'renews_at' => $renewed->renews_at?->toIso8601String(),
                    'auto_renew' => $renewed->auto_renew,
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * DELETE /api/v1/subscriptions/{subscription}
     * 
     * Anulowanie aktywnej subskrypcji
     */
    public function cancel(Subscription $subscription): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($subscription->user_id !== $user->id) {
            return $this->unauthorizedResponse('Brak dostępu do tej subskrypcji');
        }

        // Sprawdzenie czy subskrypcja jest aktywna
        if ($subscription->status !== 'active' || $subscription->ends_at <= now()) {
            return $this->errorResponse('Subskrypcja nie jest aktywna lub już anulowana', 409);
        }

        try {
            $this->subscriptionService->cancelSubscription(
                subscription: $subscription,
                reason: 'user_initiated',
            );

            return response()->json([
                'success' => true,
                'message' => 'Subskrypcja została anulowana',
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Błąd podczas anulowania subskrypcji', $e->getMessage());
        }
    }

    /**
     * GET /api/v1/subscription-plans
     * 
     * Lista dostępnych planów subskrypcji (publiczny endpoint)
     */
    public function plans(): JsonResponse
    {
        try {
            $plans = $this->subscriptionService->getAvailablePlans();

            // Konwersja cen na float dla JSON response
            $formattedPlans = $plans->map(fn ($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => (float)$plan->price_monthly,
                'price_yearly' => (float)$plan->price_yearly,
                'features' => $plan->features ?? [],
                'max_services' => $plan->max_services,
                'max_bookings_per_month' => $plan->max_bookings_per_month,
                'is_popular' => $plan->is_popular,
                'display_order' => $plan->display_order,
            ])->all();

            return $this->successResponse($formattedPlans, 'Plany subskrypcji pobrane pomyślnie');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Błąd podczas pobierania planów', $e->getMessage());
        }
    }

    /**
     * GET /api/v1/provider/subscription
     * 
     * Aktualna subskrypcja zalogowanego providera
     */
    public function getProviderSubscription(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            // Pobierz aktywną subskrypcję
            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('plan')
                ->latest('starts_at')
                ->first();

            // Fallback do FREE planu jeśli brak
            if (!$subscription) {
                return $this->successResponse([
                    'plan' => 'free',
                    'expiresAt' => null,
                    'features' => [
                        'Do 5 usług',
                        '5 zdjęć',
                        'Podstawowe powiadomienia',
                        'Profil publiczny'
                    ],
                    'limits' => [
                        'maxServices' => 5,
                        'maxPhotosPerService' => 5,
                        'maxPortfolioPhotos' => 5,
                        'prioritySupport' => false,
                        'analytics' => false,
                        'subdomain' => false,
                        'customBranding' => false,
                        'apiAccess' => false,
                        'dedicatedManager' => false,
                    ]
                ], 'Subskrypcja FREE (domyślna)');
            }

            // Format aktualnej subskrypcji
            $planLimits = [
                'free' => ['maxServices' => 5, 'maxPhotosPerService' => 5, 'maxPortfolioPhotos' => 5, 'prioritySupport' => false, 'analytics' => false, 'subdomain' => false, 'customBranding' => false, 'apiAccess' => false, 'dedicatedManager' => false],
                'basic' => ['maxServices' => 25, 'maxPhotosPerService' => 50, 'maxPortfolioPhotos' => 50, 'prioritySupport' => true, 'analytics' => true, 'subdomain' => true, 'customBranding' => false, 'apiAccess' => false, 'dedicatedManager' => false],
                'pro' => ['maxServices' => 999, 'maxPhotosPerService' => 999, 'maxPortfolioPhotos' => 999, 'prioritySupport' => true, 'analytics' => true, 'subdomain' => true, 'customBranding' => true, 'apiAccess' => true, 'dedicatedManager' => false],
                'premium' => ['maxServices' => 999, 'maxPhotosPerService' => 999, 'maxPortfolioPhotos' => 999, 'prioritySupport' => true, 'analytics' => true, 'subdomain' => true, 'customBranding' => true, 'apiAccess' => true, 'dedicatedManager' => true],
            ];

            $planName = $subscription->plan->slug ?? 'basic';
            $limits = $planLimits[$planName] ?? $planLimits['basic'];

            return $this->successResponse([
                'plan' => $planName,
                'expiresAt' => $subscription->ends_at?->format('d.m.Y'),
                'features' => $subscription->plan->features ?? [],
                'limits' => $limits
            ], 'Aktualna subskrypcja pobrana pomyślnie');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Błąd podczas pobierania subskrypcji', $e->getMessage());
        }
    }
}
