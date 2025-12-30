<?php

namespace App\Services;

use App\Models\Location;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * VisibilityService - Ranking i widoczność providerów z boost'ami
 *
 * Odpowiedzialny za:
 * - Ranking providerów po mieście z uwzględnieniem boost'ów
 * - Kalkulacja rank_score (boost multiplier + plan multiplier + trust multiplier)
 * - Sortowanie po aktywnych boost'ach i rank_score
 */
class VisibilityService
{
    /**
     * Pobiera ranking providerów dla danego miasta (GŁÓWNY INTERFEJS)
     *
     * Zwraca paginated listę providerów posortowaną po:
     * 1. Aktywnych boost'ach (malejąco po expires_at)
     * 2. Rank score (boost multiplier + plan multiplier + trust multiplier)
     *
     * @param  string  $city  Slug miasta (np. warszawa)
     * @param  string|null  $category  Opcjonalnie: slug kategorii
     * @param  int  $perPage  Ilość wyników na stronę (default: 20)
     * @param  int  $page  Numer strony (default: 1)
     * @return array{success: bool, message: string, data: array, pagination: array}
     */
    public function rankProviders(
        string|Collection $city,
        ?string $category = null,
        int|string $perPage = 20,
        int|string $page = 1
    ): array|Collection {
        // Obsługa starego interfejsu z Collection (dla VisibilityPreviewService)
        if ($city instanceof Collection) {
            return $this->rankProvidersFromCollection($city, $category, (int) $perPage);
        }

        // Nowy interfejs z slug'ami miast
        $perPage = (int) $perPage;
        $page = (int) $page;

        $location = Location::where('slug', $city)->first();

        if (! $location) {
            return [
                'success' => true,
                'message' => 'Brak usługodawców dla danego miasta',
                'data' => [],
                'pagination' => [
                    'total' => 0,
                    'per_page' => $perPage,
                    'current_page' => 1,
                    'last_page' => 1,
                ],
            ];
        }

        $query = User::query()
            ->where('user_type', User::TYPE_PROVIDER)
            ->whereHas('services', fn ($sq) => $sq->where('location_id', $location->id));

        if ($category) {
            $query->whereHas('services', fn ($q) => $q->whereHas('category', fn ($cq) => $cq->where('slug', $category))
                ->where('location_id', $location->id)
            );
        }

        $providers = $query
            ->with('providerProfile', 'boosts')
            ->paginate($perPage, ['*'], 'page', $page);

        $data = $providers->map(fn (User $provider, int $index) => $this->scoreProvider($provider, $city, $index));
        $sorted = $data->sortByDesc('rank_score');
        $sorted = $sorted->values()->map(function ($item, $index) {
            $item['position'] = $index + 1;
            return $item;
        });

        return [
            'success' => true,
            'message' => 'Ranking usługodawców dla miasta '.$city,
            'data' => $sorted->values()->all(),
            'pagination' => [
                'total' => $providers->total(),
                'per_page' => $providers->perPage(),
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
            ],
        ];
    }

    /**
     * Stary interfejs dla VisibilityPreviewService
     * Używa Collection zamiast DB query
     *
     * @param  Collection<int, array{provider_id:int, trust_score:int|null, plan:string, boost:?string, boost_expires_at:?string, last_active_at:?string}>  $providers
     * @param  string  $city
     * @param  string  $category
     * @param  int  $limit
     * @return Collection<int, array{provider_id:int, score:float, position:int, tags:array, boost_expires_at:?string}>
     */
    private function rankProvidersFromCollection(
        Collection $providers,
        string $city,
        string $category,
        int $limit = 20
    ): Collection {
        $tsGating = config('features.visibility.trust_score_gating', true);

        $ranked = $providers
            ->map(fn (array $p) => $this->buildScoreForCollection($p, $tsGating))
            ->sortByDesc('boost_expires_at')
            ->sortByDesc('score')
            ->values()
            ->map(function (array $item, int $index) {
                $item['position'] = $index + 1;
                return $item;
            })
            ->take($limit);

        return $ranked;
    }

    /**
     * Buduje score dla Collection interface'u
     */
    private function buildScoreForCollection(array $provider, bool $tsGating): array
    {
        $plan = $provider['plan'] ?? 'free';
        $trustScore = (int) ($provider['trust_score'] ?? 0);
        $boost = $provider['boost'] ?? null;
        $boostExpiresAt = $provider['boost_expires_at'] ?? null;

        $trustMultiplier = $tsGating ? $this->trustMultiplierForCollection($trustScore) : 1.0;
        $planMultiplier = $this->planMultiplierForCollection($plan);
        $boostMultiplier = $this->boostMultiplierForCollection($boost);
        $recencyMultiplier = 1.0;

        $score = $trustMultiplier * $planMultiplier * $boostMultiplier * $recencyMultiplier;

        $tags = [];
        if ($plan !== 'free') {
            $tags[] = strtoupper($plan);
        } else {
            $tags[] = 'FREE';
        }
        if ($boost) {
            $tags[] = 'BOOSTED';
        }
        if ($trustScore >= 70) {
            $tags[] = 'TS≥70';
        } elseif ($trustScore >= 50) {
            $tags[] = 'TS50-69';
        } else {
            $tags[] = 'TS<50';
        }

        return [
            'provider_id' => (int) $provider['provider_id'],
            'plan' => $plan,
            'boost' => $boost,
            'boost_expires_at' => $boostExpiresAt,
            'trust_score' => $trustScore,
            'score' => (float) $score,
            'tags' => $tags,
        ];
    }

    /**
     * Kalkuluje rank_score dla pojedynczego providera
     *
     * @param  User  $provider
     * @param  string  $city  Slug miasta
     * @param  int  $index  Index w liście (do pozycji)
     * @return array{id: int, name: string, email: string, avatar_url: ?string, trust_score: int, rank_score: float, position: int, active_boost: bool}
     */
    public function scoreProvider(User $provider, string $city, int $index): array
    {
        $activeBoost = $provider->boosts
            ->where('type', 'city_boost')
            ->where('city', $city)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        $hasActiveBoost = $activeBoost !== null;
        $boostMultiplier = $hasActiveBoost ? 2.0 : 1.0;

        $planMultiplier = match ($provider->subscription_plan) {
            'pro' => 1.5,
            'standard' => 1.25,
            'elite' => 2.0,
            default => 1.0,
        };

        $trustScore = (int) ($provider->providerProfile?->trust_score ?? 0);
        $trustMultiplier = $trustScore >= 70
            ? 1.0
            : ($trustScore >= 50 ? 0.75 : 0.5);

        $rankScore = ($trustScore * $boostMultiplier * $planMultiplier * $trustMultiplier) / 100;

        return [
            'id' => $provider->id,
            'name' => $provider->name,
            'email' => $provider->email,
            'avatar_url' => $provider->avatar,
            'trust_score' => $trustScore,
            'rank_score' => $rankScore,
            'position' => $index + 1,
            'active_boost' => $hasActiveBoost,
        ];
    }

    /**
     * Sprawdza czy provider ma aktywny boost dla danego miasta
     */
    public function hasActiveBoost(User $provider, string $city): bool
    {
        return $provider->boosts
            ->where('type', 'city_boost')
            ->where('city', $city)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->count() > 0;
    }

    /**
     * Pobiera aktywny boost dla danego miasta
     */
    public function getActiveBoost(User $provider, string $city)
    {
        return $provider->boosts
            ->where('type', 'city_boost')
            ->where('city', $city)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();
    }

    // Helpery dla Collection interface

    private function trustMultiplierForCollection(int $trustScore): float
    {
        return match (true) {
            $trustScore >= 70 => 1.0,
            $trustScore >= 50 => 0.75,
            default => 0.5,
        };
    }

    private function planMultiplierForCollection(string $plan): float
    {
        return match ($plan) {
            'elite' => 2.0,
            'pro' => 1.5,
            'standard' => 1.25,
            default => 1.0,
        };
    }

    private function boostMultiplierForCollection(?string $boost): float
    {
        return match ($boost) {
            'city_boost' => 1.5,
            'spotlight' => 1.8,
            'weekend_rush' => 2.0,
            default => 1.0,
        };
    }
}

