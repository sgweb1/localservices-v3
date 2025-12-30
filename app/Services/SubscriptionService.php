<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;

/**
 * SubscriptionService - Zarządzanie subskrypcjami providerów
 *
 * Odpowiedzialny za:
 * - Aktywacja nowych subskrypcji
 * - Przedłużanie istniejących subskrypcji
 * - Anulowanie subskrypcji
 * - Zarządzanie datami wygaśnięcia i odnowienia
 */
class SubscriptionService
{
    /**
     * Aktywuj nową subskrypcję dla providera
     *
     * Tworzy nowy rekord Subscription z datami:
     * - started_at: teraz
     * - ends_at: teraz + okres (monthly/yearly)
     * - renews_at: ends_at - 7 dni (reminder o odnowieniu)
     *
     * @param User $user
     * @param SubscriptionPlan $plan
     * @param string $billingPeriod (monthly|yearly)
     * @param bool $autoRenew
     * @return Subscription Nowo utworzona subskrypcja
     */
    public function activateSubscription(
        User $user,
        SubscriptionPlan $plan,
        string $billingPeriod = 'monthly',
        bool $autoRenew = true,
    ): Subscription {
        // Sprawdź czy plan istnieje i jest aktywny
        if (!$plan->is_active) {
            throw new \InvalidArgumentException("Plan {$plan->name} jest nieaktywny");
        }

        // Oblicz daty
        $startedAt = now();
        $endsAt = $this->calculateEndDate($startedAt, $billingPeriod);
        $renewsAt = $endsAt->copy()->subDays(7); // Reminder 7 dni przed wygaśnięciem

        // Anuluj wcześniejszą aktywną subskrypcję jeśli istnieje
        $existingSubscription = $user->subscriptions()
            ->where('status', 'active')
            ->first();

        if ($existingSubscription) {
            $this->cancelSubscription($existingSubscription, 'upgraded_to_new_plan');
        }

        // Utwórz nową subskrypcję
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'billing_period' => $billingPeriod,
            'status' => 'active',
            'started_at' => $startedAt,
            'ends_at' => $endsAt,
            'renews_at' => $renewsAt,
            'auto_renew' => $autoRenew,
        ]);

        // Zaloguj w audicie
        \Log::info("Subscription activated for user {$user->id}", [
            'subscription_id' => $subscription->id,
            'plan' => $plan->slug,
            'period' => $billingPeriod,
        ]);

        return $subscription;
    }

    /**
     * Przedłuż istniejącą subskrypcję
     *
     * Zmienia dates:
     * - ends_at: poprzednia ends_at + okres
     * - renews_at: nowa ends_at - 7 dni
     * - status: zawsze 'active'
     *
     * @param Subscription $subscription
     * @param string|null $newBillingPeriod (null = użyj istniejącego)
     * @return Subscription Odnowiona subskrypcja
     */
    public function renewSubscription(
        Subscription $subscription,
        ?string $newBillingPeriod = null,
    ): Subscription {
        // Sprawdź czy subskrypcja istnieje
        if (!$subscription->plan->is_active) {
            throw new \InvalidArgumentException("Plan jest nieaktywny, nie można odnowić");
        }

        $billingPeriod = $newBillingPeriod ?? $subscription->billing_period;

        // Oblicz nowe daty - od poprzedniej ends_at (nie od teraz!)
        $newStartDate = $subscription->ends_at;
        $newEndsAt = $this->calculateEndDate($newStartDate, $billingPeriod);
        $newRenewsAt = $newEndsAt->copy()->subDays(7);

        // Aktualizuj subskrypcję
        $subscription->update([
            'status' => 'active',
            'billing_period' => $billingPeriod,
            'ends_at' => $newEndsAt,
            'renews_at' => $newRenewsAt,
            'cancelled_at' => null, // Wznów jeśli była anulowana
        ]);

        // Zaloguj
        \Log::info("Subscription renewed for user {$subscription->user_id}", [
            'subscription_id' => $subscription->id,
            'plan' => $subscription->plan->slug,
            'new_period' => $billingPeriod,
        ]);

        return $subscription->refresh();
    }

    /**
     * Anuluj subskrypcję
     *
     * Ustawia status = 'cancelled' i cancelled_at = teraz
     * Subskrypcja pozostaje w bazie dla historii
     *
     * @param Subscription $subscription
     * @param string|null $reason Powód anulowania
     * @return void
     */
    public function cancelSubscription(
        Subscription $subscription,
        ?string $reason = null,
    ): void {
        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'auto_renew' => false,
        ]);

        // Zaloguj
        \Log::warning("Subscription cancelled for user {$subscription->user_id}", [
            'subscription_id' => $subscription->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Sprawdzenie czy użytkownik ma aktywną subskrypcję
     *
     * @param User $user
     * @return bool
     */
    public function hasActiveSubscription(User $user): bool
    {
        return $user->subscriptions()
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->exists();
    }

    /**
     * Pobierz aktywną subskrypcję użytkownika
     *
     * @param User $user
     * @return Subscription|null
     */
    public function getActiveSubscription(User $user): ?Subscription
    {
        return $user->subscriptions()
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->first();
    }

    /**
     * Pobierz ilość dni do wygaśnięcia subskrypcji
     *
     * @param Subscription $subscription
     * @return int Dni do wygaśnięcia (0 jeśli wygasła)
     */
    public function getDaysUntilExpiry(Subscription $subscription): int
    {
        if (!$subscription->ends_at || $subscription->ends_at->isPast()) {
            return 0;
        }

        return (int)abs($subscription->ends_at->diffInDays(now()));
    }

    /**
     * Sprawdzenie czy subskrypcja wymaga odnowienia
     *
     * Zwraca true jeśli:
     * - auto_renew = true
     * - renews_at jest w przeszłości
     * - status = active
     *
     * @param Subscription $subscription
     * @return bool
     */
    public function needsRenewal(Subscription $subscription): bool
    {
        return $subscription->auto_renew
            && $subscription->renews_at->isPast()
            && $subscription->status === 'active';
    }

    /**
     * Helper: Oblicz datę wygaśnięcia na podstawie okresu
     *
     * @param Carbon $startDate Data rozpoczęcia
     * @param string $billingPeriod (monthly|yearly)
     * @return Carbon Data wygaśnięcia
     */
    private function calculateEndDate(Carbon $startDate, string $billingPeriod): Carbon
    {
        return match ($billingPeriod) {
            'yearly' => $startDate->copy()->addYear(),
            'monthly' => $startDate->copy()->addMonth(),
            default => throw new \InvalidArgumentException("Nieznany okres: $billingPeriod"),
        };
    }

    /**
     * Pobierz plan subskrypcji po slug'u
     *
     * @param string $slug
     * @return SubscriptionPlan|null
     */
    public function getPlanBySlug(string $slug): ?SubscriptionPlan
    {
        return SubscriptionPlan::where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Pobierz wszystkie dostępne (aktywne) plany
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailablePlans()
    {
        return SubscriptionPlan::active()
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Zwróć cenę na podstawie okresu
     *
     * @param SubscriptionPlan $plan
     * @param string $billingPeriod (monthly|yearly)
     * @return float
     */
    public function getPrice(SubscriptionPlan $plan, string $billingPeriod = 'monthly'): float
    {
        return match ($billingPeriod) {
            'yearly' => (float)$plan->price_yearly,
            'monthly' => (float)$plan->price_monthly,
            default => throw new \InvalidArgumentException("Nieznany okres: $billingPeriod"),
        };
    }
}
