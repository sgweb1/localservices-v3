# ⚠️ DEPRECATED - Patrz ARCHITECTURE.md

**Nowe referencje:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - API specification
- [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md) - Frontend implementation
- [INDEX.md](INDEX.md) - Dokumentacja

---

# ~~Kontrakt API – Monetyzacja i Widoczność (ls2)~~

Cele: prosty rollout freemium + podgląd płatnych opcji. Brak pośrednictwa w płatnościach. API tylko opisuje stan i ranking widoczności.

## Feature Flags

`GET /api/v1/monetization/flags`
- **Cel:** UI wie, które funkcje pokazać jako aktywne/"coming soon".
- **Response 200**
```json
{
  "monetization": {
    "enabled": true,
    "subscriptions": false,
    "boosts": false,
    "addons": false
  },
  "visibility": {
    "trust_score_gating": true,
    "caps_enabled": true,
    "fair_rotation": {
      "free_top_slots_per_day": 5,
      "rotations_per_day": 6,
      "rotation_interval_minutes": 240,
      "penalty_range": [11, 20]
    }
  }
}
```

## Podgląd widoczności (Fair Rotation)

`GET /api/v1/visibility/preview`
- **Query:** `city`, `category`, opcjonalnie `page` (default 1), `per_page` (default 10).
- **Cel:** zwrócić posortowaną listę providerów z tagami widoczności, uwzględniając fair-use caps dla darmowych.
- **Założenia biznesowe:**
  - Free: max 5 pojawień w top10 / 24h / miasto+kategoria; po limicie spada do pozycji 11–20 do końca doby.
  - Rotacja co 4h (6 rotacji/dzień). Slot = okno 4h.
  - Trust Score gating: pełny mnożnik od TS ≥ 70; 50–69 redukcja; <50 minimalna ekspozycja (tylko direct / nazwa).
  - Subskrypcje/boosty: nie wchodzą do limitu free; mają własny pool i mnożniki.
- **Response 200**
```json
{
  "meta": {
    "city": "Warszawa",
    "category": "elektryk",
    "rotation": {
      "current_slot": 3,
      "rotations_per_day": 6,
      "rotation_interval_minutes": 240
    }
  },
  "data": [
    {
      "provider_id": 42,
      "name": "Elektryk PRO",
      "trust_score": 78,
      "plan": "pro",            // free|standard|pro|elite
      "boost": null,             // city_boost|spotlight|weekend_rush|null
      "score": 0.82,             // wynik rankingowy (znormalizowany 0-1)
      "tags": ["PRO", "TS≥70"],
      "position": 1
    },
    {
      "provider_id": 99,
      "name": "Elektryk A",
      "trust_score": 65,
      "plan": "free",
      "boost": null,
      "score": 0.54,
      "tags": ["FREE", "TS 50-69", "Fair rotation"],
      "position": 2,
      "free_slots_used_today": 3,
      "free_slots_limit": 5
    }
  ]
}
```
- **Uwagi implementacyjne:**
  - Wynik może być cache'owany per (city, category, rotation_slot) na krótki TTL (np. 5–10 min).
  - Fair rotation liczona na podstawie liczników w cache/db (per provider, miasto, kategoria, data).
  - `score` to znormalizowany wynik formuły: `Base × TS × Plan × Boost × Recency`, a następnie przesortowany; free po limicie dostają pozycje w zakresie penalty_range.

## (Opcjonalnie) Zapowiedź płatności

`GET /api/v1/monetization/coming-soon`
- **Cel:** UI może pokazać ceny i benefity zanim włączymy płatności.
- **Response 200 (przykład mock):**
```json
{
  "plans": [
    {"name": "standard", "price": "49-79 PLN/m", "visibility_multiplier": 1.25},
    {"name": "pro", "price": "129-179 PLN/m", "visibility_multiplier": 1.5},
    {"name": "elite", "price": "249-349 PLN/m", "visibility_multiplier": 2.0}
  ],
  "boosts": [
    {"type": "city_boost", "from": "19 PLN", "duration_days": [7, 14, 30]},
    {"type": "spotlight", "from": "49 PLN", "slot_size": "Top 3"},
    {"type": "weekend_rush", "from": "39 PLN", "duration_hours": [48, 72]}
  ],
  "addons": [
    {"type": "portfolio_plus", "from": "19 PLN/m"},
    {"type": "badge_premium", "from": "9 PLN/m"}
  ]
}
```

## Error Responses (ogólne)
- 400: brak wymaganych parametrów (city/category)
- 401: wymagane logowanie (jeśli widok zależny od usera)
- 500: nieoczekiwany błąd

## Notatki rollout (ls2)
- Na start `monetization.enabled=false` → UI pokazuje placeholdery i zasady fair use (caps włączone, brak zakupów).
- Po włączeniu `subscriptions`/`boosts` → należy dodać endpointy intent/payment (kolejna faza).
- Brak pośrednictwa w płatnościach — faktury/platform invoices tylko za widoczność.
- Endpointy operacyjne dla boost'ów wdrożone: zakup (POST /api/v1/boosts/purchase), potwierdzenie (GET /api/v1/boosts/success), przedłużenie (PUT /api/v1/boosts/{id}/renew), anulowanie (DELETE /api/v1/boosts/{id}).
