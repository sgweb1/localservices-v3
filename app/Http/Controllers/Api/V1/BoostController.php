<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RenewBoostRequest;
use App\Http\Requests\StoreBoostRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Boost;
use App\Models\PlatformInvoice;
use App\Models\User;
use App\Services\BoostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Exception\ApiErrorException;

/**
 * API Endpoint do zarządzania boost'ami i ich kupowania
 * 
 * Routes:
 * - POST /api/v1/boosts - Inicjuj zakup
 * - GET /api/v1/boosts/success - Potwierdź płatność
 * - GET /api/v1/boosts - Lista boost'ów providera
 * - GET /api/v1/boosts/{boost} - Szczegóły boost'u
 * - PUT /api/v1/boosts/{boost}/renew - Przedłuż boost
 * - DELETE /api/v1/boosts/{boost} - Anuluj boost
 */
class BoostController extends Controller
{
    use ApiResponse;

    public function __construct(private BoostService $boostService)
    {
    }

    /**
     * POST /api/v1/boosts
     * 
     * Inicjuj zakup boost'a
     * 
     * @bodyParam type string required (city_boost|spotlight)
     * @bodyParam days int required (7|14|30)
     * @bodyParam city string (wymagane dla city_boost)
     * @bodyParam category string (wymagane dla spotlight)
     */
    public function store(StoreBoostRequest $request): JsonResponse
    {
        /** @var User $provider */
        $provider = Auth::user();
        $validated = $request->validated();

        try {
            $result = $this->boostService->initiateBoostPurchase(
                provider: $provider,
                type: $validated['type'],
                days: (int)$validated['days'],
                city: $validated['city'] ?? null,
                category: $validated['category'] ?? null,
            );

            return new JsonResponse($result, 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        } catch (\RuntimeException $e) {
            return $this->serverErrorResponse('Błąd podczas inicjowania zakupu', $e->getMessage());
        }
    }

    /**
     * GET /api/v1/boosts/success?session_id=<CHECKOUT_SESSION_ID>
     * 
     * Potwierdzenie boost'a po pomyślnej płatności (callback z Stripe)
     */
    public function success(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        try {
            $success = $this->boostService->confirmBoostAfterPayment($validated['session_id']);

            if (!$success) {
                return $this->errorResponse('Płatność nie została potwierdzona', 402);
            }

            // Pobierz fakturę i boost
            $invoice = PlatformInvoice::where('stripe_session_id', $validated['session_id'])->firstOrFail();
            $boost = $invoice->boost;

            return response()->json([
                'success' => true,
                'message' => 'Boost został aktywowany!',
                'id' => $boost->id,
                'type' => $boost->type,
                'city' => $boost->city,
                'category' => $boost->category,
                'expires_at' => $boost->expires_at->toIso8601String(),
                'days_remaining' => $boost->daysRemaining(),
                'is_active' => $boost->isActive(),
                'invoice' => [
                    'id' => $invoice->id,
                    'amount' => $invoice->amount,
                    'currency' => $invoice->currency,
                    'status' => $invoice->status,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Błąd podczas potwierdzania boost\'a', $e->getMessage());
        }
    }

    /**
     * GET /api/v1/boosts
     * 
     * Lista boost'ów providera
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $provider */
        $provider = Auth::user();

        // Aktywne boost'y
        $activeBoosts = Boost::where('provider_id', $provider->id)
            ->active()
            ->orderByDesc('expires_at')
            ->get();

        // Wygasłe boost'y (do celów historii)
        $expiredBoosts = Boost::where('provider_id', $provider->id)
            ->where('expires_at', '<=', now())
            ->orderByDesc('expires_at')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'active_boosts' => $activeBoosts->map(fn (Boost $b) => [
                'id' => $b->id,
                'type' => $b->type,
                'city' => $b->city,
                'category' => $b->category,
                'expires_at' => $b->expires_at?->toIso8601String(),
                'days_remaining' => $b->daysRemaining(),
                'is_active' => $b->is_active,
            ]),
            'expired_boosts' => $expiredBoosts->map(fn (Boost $b) => [
                'id' => $b->id,
                'type' => $b->type,
                'expired_at' => $b->expires_at?->toIso8601String(),
            ]),
        ]);
    }

    /**
     * GET /api/v1/boosts/{boost}
     * 
     * Szczegóły konkretnego boost'a
     */
    public function show(Boost $boost): JsonResponse
    {
        /** @var User $provider */
        $provider = Auth::user();

        // Sprawdzenie uprawnień
        if ($boost->provider_id !== $provider->id) {
            return $this->unauthorizedResponse('Brak dostępu do tego boost\'a');
        }

        $boost->load('invoice');

        return response()->json([
            'success' => true,
            'boost' => [
                'id' => $boost->id,
                'type' => $boost->type,
                'city' => $boost->city,
                'category' => $boost->category,
                'expires_at' => $boost->expires_at?->toIso8601String(),
                'is_active' => $boost->is_active,
                'created_at' => $boost->created_at?->toIso8601String(),
            ],
            'invoice' => $boost->invoice ? [
                'id' => $boost->invoice->id,
                'amount' => $boost->invoice->amount,
                'status' => $boost->invoice->status,
                'stripe_session_id' => $boost->invoice->stripe_session_id,
            ] : null,
        ]);
    }

    /**
     * PUT /api/v1/boosts/{boost}/renew
     * Przedłużenie aktywnego boost'a
     */
    public function renew(RenewBoostRequest $request, Boost $boost): JsonResponse
    {
        /** @var User $provider */
        $provider = Auth::user();

        if ($boost->provider_id !== $provider->id) {
            return $this->unauthorizedResponse('Brak dostępu do tego boost\'a');
        }

        $validated = $request->validated();

        $renewed = $this->boostService->renewBoost(
            provider: $provider,
            daysToAdd: (int)$validated['days'],
            city: $boost->city,
            category: $boost->category,
        );

        if (! $renewed) {
            return $this->errorResponse('Brak aktywnego boost\'a do przedłużenia', 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Boost został przedłużony',
            'data' => [
                'id' => $renewed->id,
                'type' => $renewed->type,
                'city' => $renewed->city,
                'category' => $renewed->category,
                'expires_at' => $renewed->expires_at?->toIso8601String(),
                'days_remaining' => $renewed->daysRemaining(),
                'is_active' => $renewed->is_active,
            ],
        ]);
    }

    /**
     * DELETE /api/v1/boosts/{boost}
     * Anulowanie aktywnego boost'a
     */
    public function cancel(Boost $boost): JsonResponse
    {
        /** @var User $provider */
        $provider = Auth::user();

        if ($boost->provider_id !== $provider->id) {
            return $this->unauthorizedResponse('Brak dostępu do tego boost\'a');
        }

        $cancelled = $this->boostService->cancelBoost(
            provider: $provider,
            city: $boost->city,
            category: $boost->category,
        );

        if (! $cancelled) {
            return $this->errorResponse('Boost nie jest aktywny lub już anulowany', 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Boost został anulowany',
        ]);
    }
}
