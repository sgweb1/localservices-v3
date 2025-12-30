# ⚠️ DEPRECATED - Stary plan monetyzacji

**Patrz nowe dokumenty:**
- [PHASE_6_README.md](PHASE_6_README.md) - Obecna implementacja
- [SYSTEM_DESCRIPTION.md](SYSTEM_DESCRIPTION.md) - Business logic
- [INDEX.md](INDEX.md) - Mapa dokumentacji

---

# ~~Plan Monetyzacji (ls2) — Uproszony Model Boost'ów~~

**Strategia:** Freemium + Subskrypcje (Standard/Pro/Elite) + City Boost  
**Pośrednictwo:** ❌ Wykluczone — platforma zarządza tylko opłatami za widoczność  
**Rotacja:** ❌ USUNIĘTA — system zbyt złożony do obsługi i wyjaśniania  
**Sorting:** ✅ Data expiracji boost'ów (najprostsza, najzrozumialsza dla użytkowników)

---

## 1. Core Freemium (Bezpłatne)

### Dostęp dla Wszystkich
- Profil wykonawcy (zdjęcia, opis, usługi, lokalizacja)
- Widoczność w listingach per miasto/kategoria
- Recenzje i Trust Score
- Czat z klientami
- Podstawowe statystyki

### Trust Score Gating
- **TS ≥ 70:** Pełna ekspozycja + wszystkie mnożniki
- **50–69:** Ekspozycja z 0.8× mnożnikiem
- **<50:** Tylko przez bezpośrednie wyszukiwanie

---

## 2. Płatne Subskrypcje (Faza 2–3)

### Standard (49–79 PLN/miesiąc)
- +25% mnożnik widoczności
- Badge "Weryfikowany Premium"
- Priorytet w sekcji "Hot Offers"
- Rozbudowane statystyki

### Pro (129–179 PLN/miesiąc)
- +50% mnożnik widoczności
- Auto-quotes dla popularnych kategorii
- Calendar sync (pokazanie dostępnych terminów)
- Automatyczne przypomnienia o opiniach
- Pełny analytics + eksport

### Elite (249–349 PLN/miesiąc)
- +100% mnożnik widoczności
- Gwarantowana pozycja #1 w "Top Picks"
- Multi-City Presence (2 dodatkowe miasta)
- Dedicated onboarding
- Custom badge

---

## 3. City Boost (Wyróżnienia — Faza 2)

**Cel:** Podbicie pozycji w konkretnym mieście na ograniczony czas

| Długość | Cena | Mnożnik |
|---------|------|---------|
| 7 dni | 19–39 PLN | +2.0× |
| 14 dni | 49–99 PLN | +1.8× |
| 30 dni | 99–199 PLN | +1.5× |

### Jak to Działa

**Sortowanie:**
- Providery z aktywnym boost sortowani **po dacie expiracji (DESC)**
- Najpóźniejsza data = najwyżej
- Brak rotacji, brak slotów, brak limitu
- Każdy kupujący ma jawny prioryt aż do expiracji

**Przykład:**
```
Boost1 kończy się 7 stycznia → pozycja #2
Boost2 kończy się 10 stycznia → pozycja #1
Bez boost → pozycja #5 (algorytm naturalny)
```

**Reset, nie kumulacja:**
- Kupienie 2. boost'u 14 dni nie dodaje czasu
- Reset: nowa data expiracji = dzisiaj + 14 dni
- NIE: dzisiaj + 14 dni + 14 dni = 28 dni

**Cena dynamiczna:**
- Pn–Czw: -20% (base price)
- Pt–Nd: +20% (base price)
- Per miasto: zależy od konkurencji

---

## 4. Category Spotlight (Opcjonalnie — Faza 3)

**Cel:** Top 3 ekspozycja w danej kategorii/mieście

| Konkurencja | Cena |
|-------------|------|
| Niska (< 10) | 49–99 PLN |
| Średnia (10–50) | 99–179 PLN |
| Wysoka (50+) | 199–299 PLN |

**Mechanika:**
- Max 3 spotlight'y jednocześnie w kategorii
- Sortowane po dacie expiracji (jak City Boost)
- Jeśli 4-ty chce kupić — czeka na zwolnienie lub kupuje City Boost

---

## 5. Płatne Dodatki

- **Portfolio+** (19–29 PLN/m): ponad 5 zdjęć, case studies, video
- **Badge Premium** (9–19 PLN/m): diament/korona badge
- **Calendar Priority** (29 PLN/m): sekcja "Dostępne terminy" wyżej
- **Auto-Quotes** (39 PLN/m): szablony cenowe, automatyczne wyceny
- **Review Booster** (29 PLN 1x): push notification po zleceniu
- **Multi-City** (49 PLN/m): ekspozycja w 2–3 miastach

---

## 6. Implementacja Techniczna

### Modele

```
app/Models/
├── Subscription.php
├── Boost.php
├── Addon.php
├── PlatformInvoice.php
└── VisibilityMetric.php
```

**Boost — kluczowe pola:**
```php
Schema::create('boosts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
    $table->enum('type', ['city', 'spotlight']);
    $table->string('city');
    $table->string('category')->nullable();
    $table->dateTime('expires_at');    // KLUCZOWA
    $table->decimal('price', 8, 2);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### VisibilityService (Proste Sortowanie)

```php
class VisibilityService {
    public function rankProviders(string $city): array {
        $providers = User::where('city', $city)->with('subscription', 'boosts')->get();
        
        return $providers->map(function (User $provider) use ($city) {
            // 1. Trust Score multiplier
            $tsMultiplier = $provider->trustScore >= 70 ? 1.0 : 0.8;
            
            // 2. Subscription multiplier
            $subMultiplier = match($provider->subscription?->plan) {
                'standard' => 1.25,
                'pro' => 1.5,
                'elite' => 2.0,
                default => 1.0,
            };
            
            // 3. Boost multiplier
            $boostMultiplier = 1.0;
            $boostExpire = null;
            
            $activeBoost = $provider->boosts()
                ->where('city', $city)
                ->where('expires_at', '>', now())
                ->where('is_active', true)
                ->first();
                
            if ($activeBoost) {
                $boostMultiplier = match($activeBoost->type) {
                    'city' => 2.0,  // simplified
                    'spotlight' => 1.5,
                };
                $boostExpire = $activeBoost->expires_at;
            }
            
            $rankScore = 100 * $tsMultiplier * $subMultiplier * $boostMultiplier;
            
            return [
                'provider_id' => $provider->id,
                'name' => $provider->name,
                'rank_score' => $rankScore,
                'boost_expires_at' => $boostExpire,
                'boost_active' => $activeBoost !== null,
            ];
        })
        ->sortByDesc('boost_expires_at')  // Boost sorting
        ->sortByDesc('rank_score')         // Natural ranking
        ->values()
        ->toArray();
    }
}
```

---

## 7. Fazy Rollout

### Faza 1: Infrastruktura (Tydzień 1–2)
- Migracje: Subscription, Boost, Addon, PlatformInvoice
- Feature flags FEATURE_MONETIZATION=false
- PlanSelector widoczny z "Wkrótce" overlay

### Faza 2: City Boost (Tydzień 3–4)
- Włączyć FEATURE_BOOSTS=true
- City Boost: sorting po expires_at DESC
- Test payments (Stripe/Przelewy24)

### Faza 3: Standard/Pro (Tydzień 5–6)
- Włączyć FEATURE_SUBSCRIPTIONS=true
- A/B testy cen
- Monitoring: churn, ARPU

### Faza 4: Dodatki (Tydzień 7–8)
- Portfolio+, Calendar Priority, Auto-Quotes
- Marketplace w profilu

### Faza 5: Elite + Spotlight (Tydzień 9–10)
- Elite plan + Multi-City
- Category Spotlight (max 3)

---

## 8. Co Usunąć z Kodu / Bazy

### USUŃ

**Modele:**
- PromotionSlot (rotation_slot, rotation_interval, max_count)
- FreeSlotQuota, RotationQuota
- RotationHistory

**Pola w tabelach:**
- boosts.rotation_slot
- boosts.rotation_interval
- availability_slots.rotation_position
- providers.free_slot_quota
- providers.current_rotation_count

**Serwisy/Logika:**
- RotationService, SlotRotationService
- calculateRotationMetrics()
- rotateSlotsPerInterval()
- enforceRotationCaps()

**Frontend:**
- Komponenty rotacji (slot progress bar, rotation timer)
- Redux: rotationSlice, slotSlice

**Testy:**
- RotationServiceTest
- RotationFairnessTest
- Test cases: "rotation cap exceeded", "slot assignment"

### ZACHOWAJ

- Boost model (z expires_at)
- Subscription, Addon, PlatformInvoice
- VisibilityService (bez rotacji)
- Frontend: PlanSelector, BoostCard, SubscriptionManager

---

## 9. Success Criteria (M2)

- 50+ active subscriptions
- 100+ boosts purchased
- Conversion >= 3%
- ARPU >= 100 PLN
- 0 support escalations: "Nie rozumiem, dlaczego jestem tak nisko"

---

**Status:** Ready for Faza 1 implementation  
**Last Updated:** 2025-01-29
