<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Services\Api\ServiceApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla usług (Services)
 */
class ServiceController extends Controller
{
    public function __construct(private ServiceApiService $service)
    {
    }

    /**
     * GET /api/v1/services
     * Lista usług z paginacją i filtrowaniem
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'category_id' => 'integer|exists:service_categories,id',
            'location_id' => 'integer|exists:locations,id',
            'search' => 'string',
            'min_price' => 'numeric|min:0',
            'max_price' => 'numeric|min:0',
            'rating_min' => 'numeric|min:0|max:5',
            'trust_min' => 'numeric|min:0|max:100',
            'instant_only' => 'boolean',
            'sort' => 'string|in:newest,price_asc,price_desc,rating,popular',
        ]);

        $services = $this->service->list($validated);

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
     * GET /api/v1/services/{id}
     * Szczegóły usługi
     */
    public function show(int $id): JsonResponse
    {
        $service = $this->service->getById($id);

        if (!$service) {
            return response()->json(['error' => 'Usługa nie znaleziona'], 404);
        }

        return response()->json(['data' => new ServiceResource($service)]);
    }

    /**
     * GET /api/v1/providers/{providerId}/services
     * Usługi dla providera
     */
    public function providerServices(int $providerId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'sort_by' => 'string|in:created_at,base_price,rating_average,bookings_count',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $services = $this->service->getProviderServices($providerId, $validated);

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
     * GET /api/v1/services/by-category/{category}
     * Usługi po kategorii
     */
    public function byCategory(string $category, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'sort_by' => 'string|in:created_at,base_price,rating_average,bookings_count',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $services = $this->service->getByCategory($category, $validated);

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
     * GET /api/v1/services/by-city/{city}
     * Usługi po mieście
     */
    public function byCity(string $city, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'sort_by' => 'string|in:created_at,base_price,rating_average,bookings_count',
            'sort_order' => 'string|in:asc,desc',
        ]);

        $services = $this->service->getByCity($city, $validated);

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
}
