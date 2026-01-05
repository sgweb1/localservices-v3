<?php

namespace App\Services\Api;

use App\Models\Booking;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service do obsługi API rezerwacji
 */
class BookingApiService
{
    /**
     * Pobierz rezerwacje z filtrowaniem i paginacją
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 20, 50);
        $page = max($filters['page'] ?? 1, 1);

        $query = Booking::query();

        // Filtry
        if (!empty($filters['provider_id'])) {
            $query->where('provider_id', $filters['provider_id']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filtr po widoczności (hidden_by_provider)
        if (isset($filters['hidden'])) {
            if ($filters['hidden'] === 'visible') {
                $query->where(function($q) {
                    $q->where('hidden_by_provider', false)
                      ->orWhereNull('hidden_by_provider');
                });
            } elseif ($filters['hidden'] === 'hidden') {
                $query->where('hidden_by_provider', true);
            }
            // 'all' - nie dodajemy żadnego filtra
        }

        if (!empty($filters['service_id'])) {
            $query->where('service_id', $filters['service_id']);
        }

        // Wyszukiwanie - po nazwie klienta lub usługi
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('customer', fn($cq) => $cq->where('name', 'LIKE', "%{$search}%"))
                  ->orWhereHas('service', fn($sq) => $sq->where('title', 'LIKE', "%{$search}%"));
            });
        }

        // Sortowanie
        $sortBy = $filters['sort_by'] ?? 'booking_date';
        $sortOrderRaw = $filters['sort_order'] ?? 'desc';
        $sortOrder = in_array($sortOrderRaw, ['asc', 'desc']) ? $sortOrderRaw : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Eager load relacje
        $query->with(['service', 'customer', 'provider']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pobierz pojedynczą rezerwację
     */
    public function getById(int $id): ?Booking
    {
        return Booking::with(['service', 'customer', 'provider', 'reviews'])->find($id);
    }

    /**
     * Pobierz rezerwacje dla providera
     */
    public function getProviderBookings(int $providerId, array $filters = []): LengthAwarePaginator
    {
        $filters['provider_id'] = $providerId;
        return $this->list($filters);
    }

    /**
     * Pobierz rezerwacje dla customera
     */
    public function getCustomerBookings(int $customerId, array $filters = []): LengthAwarePaginator
    {
        $filters['customer_id'] = $customerId;
        return $this->list($filters);
    }
}
