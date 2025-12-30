<?php

namespace App\Services;

use App\Models\Boost;
use App\Models\PlatformInvoice;
use App\Models\User;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;

/**
 * Serwis do zarządzania boost'ami i płatności Stripe
 * 
 * Odpowiada za:
 * - Tworzenie sesji checkout Stripe
 * - Generowanie faktur
 * - Aktywację boost'ów po pomyślnej płatności
 */
class BoostService
{
    /**
     * Cennik boost'ów
     */
    public const BOOST_PRICES = [
        'city_boost_7days' => 9.99,
        'city_boost_14days' => 19.99,
        'city_boost_30days' => 29.99,
        'spotlight_7days' => 14.99,
        'spotlight_14days' => 24.99,
        'spotlight_30days' => 39.99,
    ];

    /**
     * Inicjuj sesję Stripe dla boost'a
     * 
     * @param User $provider
     * @param string $type (city_boost|spotlight)
     * @param int $days (7|14|30)
     * @param string|null $city (dla city_boost)
     * @param string|null $category (dla spotlight)
     * 
     * @return array<string, mixed>
     * @throws ApiErrorException
     */
    public function initiateBoostPurchase(
        User $provider,
        string $type,
        int $days,
        ?string $city = null,
        ?string $category = null,
    ): array {
        // Oblicz cenę
        $priceKey = "{$type}_{$days}days";
        if (!isset(self::BOOST_PRICES[$priceKey])) {
            throw new \InvalidArgumentException("Nieznana kombinacja typu/dni: $priceKey");
        }

        $price = self::BOOST_PRICES[$priceKey];

        // Utwórz fakturę
        $invoice = PlatformInvoice::create([
            'provider_id' => $provider->id,
            'amount' => $price,
            'currency' => 'PLN',
            'description' => $this->getBoostDescription($type, $days, $city, $category),
            'status' => 'pending',
        ]);

        // Utwórz sesję checkout Stripe
        \Stripe\Stripe::setApiKey(config('stripe.secret_key'));

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'pln',
                        'unit_amount' => (int)($price * 100), // Stripe wymaga centów
                        'product_data' => [
                            'name' => $invoice->description,
                            'description' => "Boost typu: $type, Czas trwania: {$days} dni",
                            'metadata' => [
                                'type' => $type,
                                'city' => $city ?? 'all',
                                'category' => $category ?? 'all',
                            ],
                        ],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('stripe.success_url') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('stripe.cancel_url'),
                'customer_email' => $provider->email,
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'provider_id' => $provider->id,
                    'type' => $type,
                    'city' => $city ?? '',
                    'category' => $category ?? '',
                    'days' => $days,
                ],
            ]);

            // Zapisz Stripe session ID
            $invoice->update([
                'stripe_session_id' => $session->id,
                'stripe_payment_intent_id' => $session->payment_intent,
            ]);

            return [
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'invoice_id' => $invoice->id,
            ];
        } catch (ApiErrorException $e) {
            // Oznacz fakturę jako nieudaną
            $invoice->markAsFailed();

            throw new \RuntimeException("Błąd Stripe: {$e->getMessage()}");
        }
    }

    /**
     * Potwierdzenie boost'a po pomyślnej płatności
     * 
     * @param string $sessionId
     * @return bool
     * @throws ApiErrorException
     */
    public function confirmBoostAfterPayment(string $sessionId): bool
    {
        // Pobierz sesję z Stripe
        \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
        $session = Session::retrieve($sessionId);

        // Sprawdź status płatności
        if ($session->payment_status !== 'paid') {
            return false;
        }

        // Pobierz fakturę
        /** @var PlatformInvoice $invoice */
        $invoice = PlatformInvoice::where('stripe_session_id', $sessionId)->firstOrFail();

        // Jeśli boost już istnieje, nie twórz nowy
        if ($invoice->boost_id) {
            return $invoice->isPaid();
        }

        // Pobierz metadane z sesji
        $metadata = $session->metadata;

        // Utwórz boost
        $boost = Boost::create([
            'provider_id' => $metadata['provider_id'],
            'type' => $metadata['type'],
            'city' => $metadata['city'] !== '' ? $metadata['city'] : null,
            'category' => $metadata['category'] !== '' ? $metadata['category'] : null,
            'expires_at' => now()->addDays((int)$metadata['days']),
            'price' => $invoice->amount,
            'is_active' => true,
            'invoice_id' => $invoice->id,
        ]);

        // Oznacz fakturę jako zapłacona
        $invoice->update([
            'boost_id' => $boost->id,
            'status' => 'paid',
            'payment_details' => [
                'amount' => $session->amount_total / 100,
                'payment_intent' => $session->payment_intent,
                'customer_email' => $session->customer_email,
                'paid_at' => now()->toIso8601String(),
            ],
        ]);

        return true;
    }

    /**
     * Pobierz opis boost'a
     */
    private function getBoostDescription(
        string $type,
        int $days,
        ?string $city,
        ?string $category,
    ): string {
        $baseType = $type === 'city_boost' ? 'City Boost' : 'Spotlight';
        $location = $type === 'city_boost' 
            ? ($city ? " - $city" : '')
            : ($category ? " - $category" : '');
        
        return "$baseType{$location} ({$days} dni)";
    }

    /**
     * Sprawdź czy provider ma aktywny boost
     */
    public function hasActiveBoost(User $provider, ?string $city = null, ?string $category = null): bool
    {
        $query = Boost::where('provider_id', $provider->id)->active();

        if ($city) {
            $query->forCity($city);
        }

        if ($category) {
            $query->forCategory($category);
        }

        return $query->exists();
    }

    /**
     * Pobierz aktywny boost providera
     */
    public function getActiveBoost(User $provider, ?string $city = null, ?string $category = null): ?Boost
    {
        $query = Boost::where('provider_id', $provider->id)->active();

        if ($city) {
            $query->forCity($city);
        }

        if ($category) {
            $query->forCategory($category);
        }

        return $query->first();
    }

    /**
     * Przedłuż aktywny boost dla danego providera
     *
     * Jeśli boost istnieje, zmienia jego expires_at o nową liczbę dni
     * Nie sumuje dni - po prostu zmienia datę wygaśnięcia
     *
     * @param User $provider
     * @param int $daysToAdd (7|14|30)
     * @param string|null $city (dla city_boost)
     * @param string|null $category (dla spotlight)
     * @return Boost|null Odnowiony boost lub null jeśli nie ma aktywnego
     */
    public function renewBoost(
        User $provider,
        int $daysToAdd = 14,
        ?string $city = null,
        ?string $category = null,
    ): ?Boost {
        // Sprawdź czy jest aktywny boost
        $boost = $this->getActiveBoost($provider, $city, $category);

        if (!$boost) {
            return null;
        }

        // Przedłuż boost - zmień expires_at
        $boost->update([
            'expires_at' => now()->addDays($daysToAdd),
        ]);

        return $boost->refresh();
    }

    /**
     * Anuluj aktywny boost dla danego providera
     *
     * Deaktywuje boost - ustawia is_active = false
     * Boost pozostaje w bazie danych dla historii
     *
     * @param User $provider
     * @param string|null $city
     * @param string|null $category
     * @return bool true jeśli anulowano, false jeśli nie było aktywnego boost'a
     */
    public function cancelBoost(
        User $provider,
        ?string $city = null,
        ?string $category = null,
    ): bool {
        $boost = $this->getActiveBoost($provider, $city, $category);

        if (!$boost) {
            return false;
        }

        // Deaktywuj boost
        $boost->update([
            'is_active' => false,
        ]);

        return true;
    }
}
