<?php

namespace App\Services\Api;

use App\Models\Review;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service do obsługi API recenzji
 */
class ReviewApiService
{
    /**
     * Pobierz recenzje z filtrowaniem i paginacją
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 20, 50);
        $page = max($filters['page'] ?? 1, 1);

        $query = Review::where('is_visible', true);

        // Filtry
        if (!empty($filters['provider_id'])) {
            $query->where('reviewed_user_id', $filters['provider_id']);
        }

        if (!empty($filters['service_id'])) {
            $query->where('service_id', $filters['service_id']);
        }

        if (!empty($filters['rating_min'])) {
            $query->where('rating', '>=', $filters['rating_min']);
        }

        if (!empty($filters['rating_max'])) {
            $query->where('rating', '<=', $filters['rating_max']);
        }

        // Sortowanie
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrderRaw = $filters['sort_order'] ?? 'desc';
        $sortOrder = in_array($sortOrderRaw, ['asc', 'desc']) ? $sortOrderRaw : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Eager load relacje
        $query->with(['reviewer', 'reviewed', 'booking', 'responses']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pobierz pojedynczą recenzję
     */
    public function getById(int $id): ?Review
    {
        return Review::with(['reviewer', 'reviewed', 'booking', 'responses'])->find($id);
    }

    /**
     * Pobierz średnią ocenę dla providera
     */
    public function getProviderRating(int $providerId): array
    {
        $reviews = Review::where('reviewed_user_id', $providerId)
            ->where('is_visible', true)
            ->get();

        $count = $reviews->count();
        $average = $count > 0 ? $reviews->avg('rating') : 0;

        return [
            'average' => round($average, 2),
            'count' => $count,
            'distribution' => [
                '5' => $reviews->where('rating', 5)->count(),
                '4' => $reviews->where('rating', 4)->count(),
                '3' => $reviews->where('rating', 3)->count(),
                '2' => $reviews->where('rating', 2)->count(),
                '1' => $reviews->where('rating', 1)->count(),
            ],
        ];
    }

    /**
     * Pobierz recenzje dla providera
     */
    public function getProviderReviews(int $providerId, array $filters = []): LengthAwarePaginator
    {
        $filters['provider_id'] = $providerId;
        return $this->list($filters);
    }
}
