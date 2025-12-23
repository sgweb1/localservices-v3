<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Helpers\StorageHelper;
use App\Models\Service;
use App\Models\ServicePhoto;
use App\Models\User;
use App\Services\ServiceGalleryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

/**
 * API Controller dla zarządzania usługami providera.
 *
 * Obsługuje CRUD operacje (Create, Read, Update, Delete) dla usług
 * oraz zarządzanie statusem (toggle pause/active).
 *
 * Tylko zalogowany provider może zarządzać swoimi usługami.
 * Wszystkie operacje wymagają auth:sanctum middleware.
 *
 * @author Claude AI Assistant
 */
class ServiceController extends Controller
{
    public function __construct(public ServiceGalleryService $gallery) {}

    /**
     * Lista usług providera (dla zalogowanego providera bez przekazywania ID w URL).
     */
    public function indexSelf(Request $request): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();
        return $this->index($request, $providerId);
    }

    /**
     * Utworzenie usługi dla zalogowanego providera (bez providerId w URL).
     */
    public function storeSelf(Request $request): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();
        return $this->store($request, $providerId);
    }

    /**
     * Pobranie usługi dla zalogowanego providera.
     */
    public function showSelf(int $serviceId): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();

        $service = Service::where('provider_id', $providerId)
            ->with(['photos', 'category', 'location'])
            ->findOrFail($serviceId);

        return response()->json(['data' => new ServiceResource($service)]);
    }

    /**
     * Aktualizacja usługi dla zalogowanego providera.
     */
    public function updateSelf(Request $request, int $serviceId): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();
        return $this->update($request, $providerId, $serviceId);
    }

    /**
     * Usunięcie usługi dla zalogowanego providera.
     */
    public function destroySelf(int $serviceId): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();
        return $this->destroy($providerId, $serviceId);
    }

    /**
     * Zmiana statusu (toggle) dla zalogowanego providera.
     */
    public function toggleSelf(int $serviceId): JsonResponse
    {
        $providerId = (int) auth('sanctum')->id();
        return $this->toggleStatus($providerId, $serviceId);
    }
    /**
     * Lista usług providera.
     *
     * Zwraca paginowaną listę usług należących do zalogowanego providera.
     * Domyślnie 12 usług na stronę.
     *
     * @example
     * GET /api/v1/providers/{providerId}/services?page=1&per_page=20
     */
    public function index(Request $request, int $providerId): JsonResponse
    {
        // Autoryzacja: tylko swoje usługi
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 12);

        $services = Service::where('provider_id', $providerId)
            ->with(['photos', 'category', 'location'])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => ServiceResource::collection($services),
            'meta' => [
                'current_page' => $services->currentPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'last_page' => $services->lastPage(),
            ],
        ]);
    }

    /**
     * Szczegóły pojedynczej usługi.
     *
     * Zwraca pełne informacje o usłudze wraz z gallerią zdjęć.
     *
     * @example
     * GET /api/v1/providers/{providerId}/services/{serviceId}
     */
    public function show(int $providerId, int $serviceId): JsonResponse
    {
        $service = Service::where('provider_id', $providerId)
            ->with(['photos', 'category', 'location'])
            ->findOrFail($serviceId);

        return response()->json([
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Tworzenie nowej usługi.
     *
     * Waliduje dane i tworzy nową usługę dla zalogowanego providera.
     *
     * @example
     * POST /api/v1/providers/{providerId}/services
     * {
     *   "title": "Naprawa rur",
     *   "description": "Profesjonalna naprawa rur wodociągowych i grzewczych",
     *   "category_id": 1,
     *   "pricing_type": "hourly",
     *   "base_price": 150,
     *   "pricing_unit": "hour"
     * }
     */
    public function store(Request $request, int $providerId): JsonResponse
    {
        // Autoryzacja
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:50',
            'category_id' => 'required|exists:service_categories,id',
            'pricing_type' => 'required|in:hourly,fixed,quote',
            'base_price' => 'nullable|numeric|min:0',
            'price_range_low' => 'nullable|numeric|min:0',
            'price_range_high' => 'nullable|numeric|gte:price_range_low',
            'pricing_unit' => 'nullable|string|in:hour,service,day,visit,sqm',
            'instant_booking' => 'boolean',
            'accepts_quote_requests' => 'boolean',
            'min_notice_hours' => 'integer|min:1',
            'max_advance_days' => 'integer|min:1',
            'duration_minutes' => 'nullable|integer|min:1',
            'location_id' => 'nullable|exists:locations,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'max_distance_km' => 'integer|min:1',
            'willing_to_travel' => 'boolean',
            'travel_fee_per_km' => 'nullable|numeric|min:0',
            'what_included' => 'nullable|string',
            'requirements' => 'nullable|array',
            'tools_provided' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        // Limit aktywnych usług
        $maxActive = (int) config('provider.limits.max_active_services', 5);
        $activeCount = Service::where('provider_id', $providerId)->where('status', 'active')->count();
        if ($activeCount >= $maxActive) {
            return response()->json([
                'error' => 'Osiągnięto limit aktywnych usług dla Twojego planu',
                'limit' => $maxActive,
            ], 422);
        }

        $service = Service::create([
            'uuid' => (string) Str::uuid(),
            'provider_id' => $providerId,
            'slug' => Str::slug($validated['title']),
            'status' => 'active',
            ...$validated,
        ]);

        $service->load(['photos', 'category']);

        return response()->json([
            'data' => new ServiceResource($service),
            'message' => 'Usługa utworzona pomyślnie',
        ], 201);
    }

    /**
     * Aktualizacja usługi.
     *
     * @example
     * PATCH /api/v1/providers/{providerId}/services/{serviceId}
     * {
     *   "title": "Naprawa rur - NOWA",
     *   "description": "Zaktualizowany opis"
     * }
     */
    public function update(Request $request, int $providerId, int $serviceId): JsonResponse
    {
        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string|min:50',
            'category_id' => 'exists:service_categories,id',
            'pricing_type' => 'in:hourly,fixed,quote',
            'base_price' => 'nullable|numeric|min:0',
            'price_range_low' => 'nullable|numeric|min:0',
            'price_range_high' => 'nullable|numeric|gte:price_range_low',
            'pricing_unit' => 'string|in:hour,service,day,visit,sqm',
            'instant_booking' => 'boolean',
            'accepts_quote_requests' => 'boolean',
            'min_notice_hours' => 'integer|min:1',
            'max_advance_days' => 'integer|min:1',
            'duration_minutes' => 'nullable|integer|min:1',
            'location_id' => 'nullable|exists:locations,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'max_distance_km' => 'integer|min:1',
            'willing_to_travel' => 'boolean',
            'travel_fee_per_km' => 'nullable|numeric|min:0',
            'what_included' => 'nullable|string',
            'requirements' => 'nullable|array',
            'tools_provided' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        // Auto-update slug jeśli zmienił się title
        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $service->update($validated);

        return response()->json([
            'data' => new ServiceResource($service->load(['photos', 'category'])),
            'message' => 'Usługa zaktualizowana pomyślnie',
        ]);
    }

    /**
     * Usunięcie usługi (soft-delete).
     *
     * @example
     * DELETE /api/v1/providers/{providerId}/services/{serviceId}
     */
    public function destroy(int $providerId, int $serviceId): JsonResponse
    {
        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);

        $service->delete(); // Soft-delete

        return response()->json([
            'message' => 'Usługa usunięta pomyślnie',
        ]);
    }

    /**
     * Zmiana statusu usługi (active ↔ paused).
     *
     * Jeśli zmiana na 'active':
     *   - Sprawdzenie limitów subskrypcji
     *   - Jeśli osiągnięty limit → 422 error
     *   - Jeśli OK → zmiana statusu na 'active'
     *
     * Jeśli zmiana na 'paused':
     *   - Zmiana statusu na 'paused'
     *   - Set paused_reason = 'manual'
     *   - Set paused_at = now()
     *
     * @example
     * POST /api/v1/providers/{providerId}/services/{serviceId}/toggle-status
     */
    public function toggleStatus(int $providerId, int $serviceId): JsonResponse
    {
        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);

        $newStatus = $service->status === 'active' ? 'paused' : 'active';

        // Limit przy aktywacji
        if ($newStatus === 'active') {
            $maxActive = (int) config('provider.limits.max_active_services', 5);
            $activeCount = Service::where('provider_id', $providerId)
                ->where('status', 'active')
                ->where('id', '!=', $serviceId)
                ->count();
            if ($activeCount >= $maxActive) {
                return response()->json([
                    'error' => 'Osiągnięto limit aktywnych usług dla Twojego planu',
                    'limit' => $maxActive,
                ], 422);
            }
        }

        $service->update([
            'status' => $newStatus,
            'paused_reason' => $newStatus === 'paused' ? 'manual' : null,
            'paused_at' => $newStatus === 'paused' ? now() : null,
        ]);

        return response()->json([
            'data' => new ServiceResource($service),
            'message' => "Usługa {$newStatus}",
        ]);
    }

    /**
     * Upload zdjęcia do galerii usługi.
     *
     * @example
     * POST /api/v1/providers/{providerId}/services/{serviceId}/photos
     * Form-Data: photo (image), alt_text (string, opcjonalne)
     */
    public function uploadPhoto(Request $request, int $providerId, int $serviceId): JsonResponse
    {
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'], // 5MB
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $photo = $this->gallery->uploadPhoto($service, $validated['photo'], $validated['alt_text'] ?? null);

        return response()->json([
            'message' => 'Zdjęcie dodane',
            'photo' => [
                'id' => $photo->id,
                'uuid' => $photo->uuid,
                'image_path' => $photo->image_path,
                'url' => StorageHelper::getPublicUrl($photo->image_path),
                'alt_text' => $photo->alt_text,
                'is_primary' => $photo->is_primary,
                'position' => $photo->position,
            ],
        ], 201);
    }

    /**
     * Usunięcie zdjęcia z galerii.
     */
    public function deletePhoto(int $providerId, int $serviceId, int $photoId): JsonResponse
    {
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);
        $photo = ServicePhoto::findOrFail($photoId);

        $this->gallery->deletePhoto($service, $photo);

        return response()->json(['message' => 'Zdjęcie usunięte']);
    }

    /**
     * Zmiana kolejności zdjęć w galerii.
     *
     * @example
     * POST /api/v1/providers/{providerId}/services/{serviceId}/photos/reorder
     * { "ordered_ids": [3,1,2] }
     */
    public function reorderPhotos(Request $request, int $providerId, int $serviceId): JsonResponse
    {
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);

        $validated = $request->validate([
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['integer'],
        ]);

        $this->gallery->reorderPhotos($service, $validated['ordered_ids']);

        return response()->json(['message' => 'Kolejność zapisana']);
    }

    /**
     * Ustawienie zdjęcia głównego.
     */
    public function setPrimaryPhoto(int $providerId, int $serviceId, int $photoId): JsonResponse
    {
        if ((int) auth('sanctum')->id() !== $providerId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::where('provider_id', $providerId)->findOrFail($serviceId);
        $photo = ServicePhoto::findOrFail($photoId);

        $this->gallery->setPrimary($service, $photo);

        return response()->json(['message' => 'Zdjęcie ustawione jako główne']);
    }
}
