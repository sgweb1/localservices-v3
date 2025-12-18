<?php

namespace App\Services\Api;

use App\Models\Verification;
use App\Models\Certification;
use App\Models\PortfolioItem;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service do obsługi API weryfikacji
 */
class VerificationApiService
{
    /**
     * Pobierz weryfikacje providera
     */
    public function getProviderVerifications(int $providerId): array
    {
        $verifications = Verification::where('user_id', $providerId)
            ->where('status', 'verified')
            ->get()
            ->groupBy('type');

        return [
            'identity' => $verifications->get('identity', collect())->count() > 0,
            'phone' => $verifications->get('phone', collect())->count() > 0,
            'email' => $verifications->get('email', collect())->count() > 0,
            'bank_account' => $verifications->get('bank_account', collect())->count() > 0,
        ];
    }

    /**
     * Pobierz certyfikaty providera
     */
    public function listCertifications(int $providerId, array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 20, 50);
        $page = max($filters['page'] ?? 1, 1);

        $query = Certification::where('user_id', $providerId)
            ->where('is_active', true);

        if ($filters['verified_only'] ?? false) {
            $query->where('is_verified', true);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pobierz portfolio providera
     */
    public function listPortfolio(int $providerId, array $filters = []): LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? 20, 50);
        $page = max($filters['page'] ?? 1, 1);

        $query = PortfolioItem::where('user_id', $providerId)
            ->where('is_visible', true);

        if ($filters['verified_only'] ?? false) {
            $query->where('is_verified', true);
        }

        $query->orderBy('created_at', 'desc')
            ->with(['comments']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pobierz pojedynczy element portfolio
     */
    public function getPortfolioItem(int $portfolioId): ?PortfolioItem
    {
        return PortfolioItem::where('is_visible', true)
            ->with(['comments' => function ($q) {
                $q->where('is_approved', true)->orderBy('created_at', 'desc');
            }, 'user'])
            ->find($portfolioId);
    }

    /**
     * Pobierz trust score providera (based na weryfikacjach + certyfikatach + portfolio)
     */
    public function getTrustScore(int $providerId): int
    {
        $score = 50; // Base score

        // Weryfikacje (0-20 pkt)
        $verifications = Verification::where('user_id', $providerId)
            ->where('status', 'verified')
            ->get();
        $score += min($verifications->count() * 5, 20);

        // Certyfikaty (0-15 pkt)
        $certifications = Certification::where('user_id', $providerId)
            ->where('is_active', true)
            ->where('is_verified', true)
            ->count();
        $score += min($certifications * 3, 15);

        // Portfolio (0-15 pkt)
        $portfolio = PortfolioItem::where('user_id', $providerId)
            ->where('is_visible', true)
            ->where('is_verified', true)
            ->count();
        $score += min($portfolio * 3, 15);

        return min($score, 100);
    }
}
