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
     * @param array $filters Filtry: page, per_page, category, city, search, min_price, max_price
     * @return LengthAwarePaginator
     */
    public function list(array $filters): LengthAwarePaginator
    {
        $query = Service::query()
            ->with(['provider:id,uuid,name,avatar,rating_average,rating_count'])
            ->where('status', 'active');

        // Filtr po kategorii
        if (isset($filters['category']) && $filters['category']) {
            $query->where('category', $filters['category']);
        }

        // Filtr po mieście
        if (isset($filters['city']) && $filters['city']) {
            $query->where('city', $filters['city']);
        }

        // Szukanie po nazwie lub opisie
        if (isset($filters['search']) && $filters['search']) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
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
            ->with(['provider:id,uuid,name,avatar,rating_average,rating_count']);

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
            ->with(['provider:id,uuid,name,avatar,rating_average,rating_count'])
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
            ->with(['provider:id,uuid,name,avatar,rating_average,rating_count']);

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
            ->with(['provider:id,uuid,name,avatar,rating_average,rating_count']);

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
