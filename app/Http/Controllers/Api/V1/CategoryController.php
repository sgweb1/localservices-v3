<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller dla kategorii usług.
 */
class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories
     * Lista głównych kategorii z ikoną i kolorami.
     */
    public function index(Request $request): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->whereNull('parent_id')
            ->when($request->string('search')->toString(), function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'icon', 'color', 'order', 'is_featured', 'listings_count', 'providers_count']);

        return response()->json(['data' => $categories]);
    }

    /**
     * GET /api/v1/categories/{slug}
     * Szczegóły kategorii po slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = ServiceCategory::query()
            ->whereNull('parent_id')
            ->where('slug', $slug)
            ->first(['id', 'name', 'slug', 'description', 'icon', 'color', 'order', 'is_featured', 'listings_count', 'providers_count']);

        if (!$category) {
            return response()->json(['error' => 'Kategoria nie znaleziona'], 404);
        }

        return response()->json(['data' => $category]);
    }
}
