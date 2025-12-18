# API_CONTRACTS.md + 14-DAY PLAN

Ten dokument zawiera:
1. 📄 **API_CONTRACTS.md** – kontrakt API dla pierwszego feature’a
2. 🧠 **14‑dniowy plan pracy (dzień po dniu)**

Dokument obowiązuje w projekcie opisanym w `PARALLEL_REACT_PROJECT.md`.

---

# 📄 API_CONTRACTS.md

## 1. PIERWSZY FEATURE: LISTA USŁUG (ServiceListing READ‑ONLY)

Feature referencyjny dla marketplace lokalnych usług:
> **Publiczna lista ogłoszeń usług (hydraulik, elektryk, sprzątaczka, etc.)**

Cel:
- sprawdzić pełny przepływ: DB → Service → API → React
- zero mutacji danych (tylko odczyt)
- zero efektów ubocznych
- prosty model bez skomplikowanych relacji

**Zakres:**
- ServiceListing model (id, title, description, base_price, status, provider_id)
- Pagination (10-20 per page)
- Podstawowe filtry (kategoria, lokalizacja - opcjonalnie)
- Bez rezerwacji, bez płatności, bez Trust Score (na razie)

---

## 2. ZASADY KONTRAKTU API

- API jest **stabilnym kontraktem**, nie odbiciem DB
- API NIE zdradza struktury modeli
- API NIE zmienia się pod UI

---

## 3. ENDPOINT

```
GET /api/v1/services
```

**Publiczny** - nie wymaga autoryzacji (marketplace jest browsable)

---

## 4. AUTORYZACJA

- **Brak** - endpoint publiczny
- Każdy może przeglądać listę usług (marketplace)
- Tylko tworzenie/edycja wymaga auth (POST/PUT/DELETE - nie w tym feature)

---

## 5. QUERY PARAMS

| Param | Typ | Opis | Przykład |
|-------|-----|------|----------|
| page | int | numer strony | `?page=2` |
| per_page | int | ilość na stronę (10-50) | `?per_page=20` |
| category | string | filtr kategorii (opcjonalny) | `?category=hydraulik` |
| city | string | filtr miasto (opcjonalny) | `?city=warszawa` |
| sort | string | sortowanie (price_asc, price_desc, newest) | `?sort=price_asc` |

---

## 6. RESPONSE (KONTRAKT, NIE IMPLEMENTACJA)

```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Usługi hydrauliczne - szybko i tanio",
      "description": "Oferuję kompleksowe usługi hydrauliczne...",
      "base_price": 150.00,
      "currency": "PLN",
      "category": "hydraulik",
      "city": "Warszawa",
      "provider": {
        "id": 5,
        "name": "Jan Kowalski",
        "avatar_url": "https://..."
      },
      "created_at": "2025-12-01T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 145,
    "last_page": 8
  }
}
```

---

## 7. BŁĘDY

| Kod | Znaczenie |
|-----|------------|
| 400 | błędne parametry (np. per_page > 50) |
| 404 | brak wyników (opcjonalnie 200 z pustą tablicą) |
| 500 | błąd serwera |

---

## 8. MAPOWANIE NA BACKEND

| Warstwa | Odpowiedzialność |
|-------|------------------|
| Controller | auth + request |
| Service | pobranie danych |
| Model | dane |

❌ brak logiki w kontrolerze

---

## 9. ZASADY DLA FRONTENDU

- frontend NIE interpretuje statusów
- frontend NIE filtruje danych biznesowo
- frontend renderuje kontrakt

---

# 🧠 14‑DNIOWY PLAN PRACY (DZIEŃ PO DNIU)

**STATUS:** Dzień 1-3 wykonane, obecnie dzień 4.

## ~~DZIEŃ 1 – FUNDAMENTY~~ ✅ ZROBIONE (grudzień 2025)
- ~~stworzenie nowego repo~~ ✅
- ~~dodanie `PARALLEL_REACT_PROJECT.md`~~ ✅
- ~~dodanie tego dokumentu~~ ✅
- ~~konfiguracja VS Code~~ ✅

---

## ~~DZIEŃ 2 – ANALIZA STAREGO SYSTEMU~~ ✅ ZROBIONE
- ~~analiza LocalServices marketplace~~ ✅
- ~~spisanie reguł biznesowych~~ ✅ (ANALIZA_LOCALSERVICES.md)
- ~~identyfikacja feature'ów~~ ✅

---

## ~~DZIEŃ 3 – AUTH + USER MODELS~~ ✅ ZROBIONE
- ~~Sanctum cookie-based auth~~ ✅
- ~~User/UserProfile/CustomerProfile/ProviderProfile~~ ✅
- ~~API endpoints (register/login/logout/user)~~ ✅
- ~~React: AuthDemo component~~ ✅
- ~~Profile Edit backend (serwisy + API)~~ ✅ (UI niepodłączone)

---

## DZIEŃ 4 – SERVICELISTING MODEL + MIGRACJA (CURRENT)
- stworzyć tabelę `services` (migracja)
- model ServiceListing (fillable, casts, relations)
- seed przykładowych usług (5-10 rekordów)
- test manualny (tinker: ServiceListing::all())

---

## DZIEŃ 5 – API CONTROLLER + SERVICE CLASS
- ServiceListingService (logika biznesowa: paginacja, filtry)
- ServiceListingController (GET /api/v1/services)
- walidacja query params (per_page 10-50, page >= 1)
- test manualny (curl/Postman)

---

## DZIEŃ 6 – TESTY BACKENDOWE
- Feature test: GET /api/v1/services (200, paginacja, filtry)
- Unit test: ServiceListingService (logika filtrowania)
- Edge cases (per_page > 50, page < 1, brak wyników)
- Coverage check

---

## ~~DZIEŃ 7 – SETUP REACT~~ ✅ ZROBIONE
- ~~Vite / React~~ ✅
- ~~struktura katalogów (src/features/)~~ ✅
- ~~React Query~~ ✅
- ~~TypeScript~~ ✅

---

## DZIEŃ 8 – API CLIENT (FRONTEND) + TYPY
- servicesApi.ts (GET /api/v1/services)
- TypeScript types (Service, ServiceListResponse, PaginationMeta)
- useServices hook (React Query)
- obsługa błędów (try/catch, error states)

---

## DZIEŃ 9 – UI KOMPONENT (LISTA USŁUG)
- ServicesList.tsx (grid/list view)
- ServiceCard.tsx (pojedyncza karta usługi)
- Loading skeleton
- Empty state ("Brak usług")
- Podstawowe style (Tailwind)

---

## DZIEŃ 10 – PAGINACJA + FILTRY
- Pagination component (prev/next, page numbers)
- Filtry (kategoria, miasto - opcjonalnie)
- Sortowanie (cena rosnąco/malejąco)
- URL state (query params w URL)
- UX polish (transitions, debounce)

---

## DZIEŃ 11 – HARDENING
- obsługa błędów
- stany brzegowe

---

## DZIEŃ 12 – PORÓWNANIE Z LIVEWIRE
- Porównanie wydajności (Lighthouse, bundle size)
- Developer Experience (jak łatwo się kodowało?)
- UX (jak się czuje dla użytkownika?)
- Lista różnic (co lepsze w React, co w Livewire)
- Screenshot/video porównawcze

---

## DZIEŃ 13 – DOKUMENTACJA
- aktualizacja DUAL_SYSTEM.md
- wnioski

---

## DZIEŃ 14 – DECYZJA
- **Czy React idzie dalej?** (kontynuować vs wrócić do Livewire)
- Co poprawić w architekturze
- Co wyrzucić (za duże, niepotrzebne)
- Plan następnych feature'ów (jeśli tak)
- Aktualizacja dokumentacji (final report)

---

📌 **WAŻNE:** Jeśli którykolwiek dzień się rozjeżdża → zatrzymaj się i przemyśl.
📌 Celem NIE jest szybkość, tylko **stabilność, przewidywalność i uczenie się**.
📌 Marketplace jest złożony - lepiej 3 feature'y dobrze niż 10 źle.

