<?php

namespace App\Services\Api;

use App\Models\Service;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * API Service dla usług (Services)
 */
class ServiceApiService
{
    /**
     * Lista usług z paginacją i filtrowaniem
     *
     * @param array $filters Filtry: page, per_page, category, location_id, search, min_price, max_price, rating_min, trust_min, instant_only, sort
     * @return LengthAwarePaginator
     */
    public function list(array $filters): LengthAwarePaginator
    {
        $query = Service::query()
            ->with([
                'provider:id,uuid,name,avatar,rating_average,rating_count',
                'provider.providerProfile:user_id,trust_score',
                'photos' => function ($q) {
                    $q->orderByDesc('is_primary')->orderBy('position')->limit(1);
                },
            ])
            ->where('status', 'active');

        // Filtr po kategorii
        if (isset($filters['category_id']) && $filters['category_id']) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filtr po lokalizacji (location_id)
        if (isset($filters['location_id']) && $filters['location_id']) {
            $query->where('location_id', $filters['location_id']);
        }

        // Szukanie po nazwie lub opisie
        if (isset($filters['search']) && $filters['search']) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filtr cena min
        if (isset($filters['min_price']) && $filters['min_price']) {
            $query->where('base_price', '>=', $filters['min_price']);
        }

        // Filtr cena max
        if (isset($filters['max_price']) && $filters['max_price']) {
            $query->where('base_price', '<=', $filters['max_price']);
        }

        // Filtr ocena min (rating_min)
        if (isset($filters['rating_min']) && $filters['rating_min']) {
            $query->whereHas('provider', function ($q) use ($filters) {
                $q->where('rating_average', '>=', $filters['rating_min']);
            });
        }

        // Filtr Trust Score min (trust_min)
        if (isset($filters['trust_min']) && $filters['trust_min']) {
            $query->whereHas('provider.providerProfile', function ($q) use ($filters) {
                $q->where('trust_score', '>=', $filters['trust_min']);
            });
        }

        // Filtr instant booking (instant_only)
        if (isset($filters['instant_only']) && $filters['instant_only']) {
            $query->where('instant_booking', true);
        }

        // Sortowanie
        $sort = $filters['sort'] ?? 'newest';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('base_price', 'desc');
                break;
            case 'rating':
                $query->leftJoin('users as providers', 'services.provider_id', '=', 'providers.id')
                    ->orderBy('providers.rating_average', 'desc')
                    ->select('services.*');
                break;
            case 'popular':
                $query->orderBy('bookings_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginacja
        $perPage = min($filters['per_page'] ?? 12, 50);
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Usługi usługodawcy
     *
     * @param int $providerId ID usługodawcy
     * @param array $filters Filtry: page, per_page, sort_by, sort_order
     * @return Paginator
     */
    public function getProviderServices(int $providerId, array $filters = []): Paginator
    {
        $query = Service::query()
            ->where('provider_id', $providerId)
            ->where('status', 'active')
            ->with([
                'provider:id,uuid,name,avatar,rating_average,rating_count',
                'photos' => function ($q) {
                    $q->orderByDesc('is_primary')->orderBy('position')->limit(1);
                },
            ]);

        // Sortowanie
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginacja
        $perPage = min($filters['per_page'] ?? 12, 50);
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Szczegóły usługi
     *
     * @param int $id ID usługi
     * @return Service|null
     */
    public function getById(int $id): ?Service
    {
        return Service::query()
            ->with([
                'provider:id,uuid,name,avatar,rating_average,rating_count',
                'photos' => function ($q) {
                    $q->orderBy('position');
                },
            ])
            ->where('status', 'active')
            ->find($id);
    }

    /**
     * Usługi po kategorii
     *
     * @param string $category Kategoria
     * @param array $filters Filtry: page, per_page, sort_by, sort_order
     * @return Paginator
     */
    public function getByCategory(string $category, array $filters = []): Paginator
    {
        $query = Service::query()
            ->where('category', $category)
            ->where('status', 'active')
            ->with([
                'provider:id,uuid,name,avatar,rating_average,rating_count',
                'photos' => function ($q) {
                    $q->orderByDesc('is_primary')->orderBy('position')->limit(1);
                },
            ]);

        // Sortowanie
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginacja
        $perPage = min($filters['per_page'] ?? 12, 50);
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Usługi po mieście
     *
     * @param string $city Miasto
     * @param array $filters Filtry: page, per_page, sort_by, sort_order
     * @return Paginator
     */
    public function getByCity(string $city, array $filters = []): Paginator
    {
        $query = Service::query()
            ->where('city', $city)
            ->where('status', 'active')
            ->with([
                'provider:id,uuid,name,avatar,rating_average,rating_count',
                'photos' => function ($q) {
                    $q->orderByDesc('is_primary')->orderBy('position')->limit(1);
                },
            ]);

        // Sortowanie
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginacja
        $perPage = min($filters['per_page'] ?? 12, 50);
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}
