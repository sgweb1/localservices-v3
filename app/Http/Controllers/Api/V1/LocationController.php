<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

/**
 * API Controller dla lokalizacji (Locations)
 */
class LocationController extends Controller
{
    /**
     * GET /api/v1/locations
     * Lista wszystkich lokalizacji (miast)
     */
    public function index(): JsonResponse
    {
        $locations = Location::query()
            ->orderBy('is_major_city', 'desc')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'latitude', 'longitude', 'is_major_city']);

        return response()->json([
            'data' => $locations,
        ]);
    }

    /**
     * GET /api/v1/locations/major-cities
     * Lista głównych miast
     */
    public function majorCities(): JsonResponse
    {
        $cities = Location::query()
            ->where('is_major_city', true)
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'latitude', 'longitude', 'is_major_city']);

        return response()->json([
            'data' => $cities,
        ]);
    }

    /**
     * GET /api/v1/locations/{id}
     * Szczegóły lokalizacji
     */
    public function show(int $id): JsonResponse
    {
        $location = Location::find($id);

        if (!$location) {
            return response()->json(['error' => 'Lokalizacja nie znaleziona'], 404);
        }

        return response()->json(['data' => $location]);
    }

    /**
     * GET /api/v1/locations/by-slug/{slug}
     * Lokalizacja po slug
     */
    public function bySlug(string $slug): JsonResponse
    {
        $location = Location::where('slug', $slug)->first();

        if (!$location) {
            return response()->json(['error' => 'Lokalizacja nie znaleziona'], 404);
        }

        return response()->json(['data' => $location]);
    }
}
