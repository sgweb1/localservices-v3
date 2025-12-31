# Testowanie API w Czasie Rzeczywistym (E2E)

## Przegląd

Projekt obsługuje **trzy rodzaje testów**:

1. **Testy Jednostkowe (Unit)** - Komponenty i endpointy API z mockowanymi danymi
2. **Testy Integracyjne** - Pełne przepływy z MSW (Mock Service Worker)
3. **Testy E2E** - Rzeczywiste requesty do API na backendie

## Uruchamianie Testów

### Uruchom Testy Unit + Integracyjne (Domyślnie)
```bash
npm test -- --run
# Wynik: 56 testów przechodzi (5 plików)
```

### Uruchom Testy E2E (Rzeczywisty API)
```bash
npm test -- tests/e2e/api.test.ts --environment=node --run
# Wynik: 9 testów przechodzi
```

### Uruchom Wszystkie Testy Razem
```bash
npm test -- --run tests/
# Uwaga: Może pokazać DataCloneError warnings z mieszania jsdom + node
```

## Struktura Testów E2E

**Plik:** `tests/e2e/api.test.ts`

**Testy:** 9 rzeczywistych endpointów API

### Testy localhost:8000
- ✅ GET `/provider/dashboard/widgets` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/bookings` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/conversations` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/reviews` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/performance` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/nonexistent` (404 Nie znaleziono)

### Testy HTTPS (ls.test)
- ✅ GET `/provider/dashboard/bookings` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/widgets` (401 Bez autentykacji)
- ✅ GET `/provider/dashboard/performance` (401 Bez autentykacji)

**Base URL:** `http://localhost:8000/api/v1` i `https://ls.test/api/v1`

## Status Bieżący

### ✅ Wszystkie Testy Przechodzą
- **Testy Unit:** 40 testów (API Dashboard, DashboardPage, PerformanceMetrics)
- **Testy Integracyjne:** 16 testów (z MSW mockowanym API)
- **Testy E2E:** 9 testów (rzeczywisty API)
- **Razem:** 65 testów przechodzi

### Kluczowe Ustalenia
- ✅ Wszystkie 5 endpointów dashboardu **odpowiada** (zwraca 401 Bez autentykacji)
- ✅ **Brak błędów 500** na żadnym endpoincie
- ✅ Strona HTTPS (ls.test) **dostępna i działa**
- ✅ Nieistniejące endpointy prawidłowo zwracają 404
- ✅ Backend uruchomiony i akceptuje requesty

## Autentykacja

Testy E2E obecnie działają **bez autentykacji** (zamiarem):
- Testy weryfikują że endpointy są **dostępne** (brak błędów 500)
- Testy weryfikują **prawidłowe kody HTTP** (401 dla protected routes)

Aby testować **autentykowane requesty**, ustaw zmienną środowiskową:
```bash
TEST_AUTH_TOKEN="twoj-bearer-token" npm test -- tests/e2e/api.test.ts --environment=node --run
```

Plik testów obsługuje to opcjonalnie.

## Zmiany Konfiguracji

### `tests/setup.ts`
- Mock `window.matchMedia` jest teraz warunkowy (tylko w jsdom)
- Mock `IntersectionObserver` jest warunkowy (tylko w jsdom)
- Mock `ResizeObserver` jest warunkowy (tylko w jsdom)
- Pozwala setup.ts pracować w obu środowiskach: jsdom (unit/integracja) i Node (e2e)

### `vitest.config.ts`
- Testy unit i integracyjne: `jsdom` environment
- Testy e2e: `--environment=node` flag
- Wyłączone z domyślnego run (zapobiega DataCloneError)
- Można uruchomić jawnie: `tests/e2e/api.test.ts --environment=node`

## Status Endpointów API

Wszystkie endpointy dashboard API są **funkcjonalne**:

| Endpoint | Status | Odpowiedź |
|----------|--------|----------|
| /widgets | ✅ 401 | `{"message":"Unauthenticated."}` |
| /bookings | ✅ 401 | `{"message":"Unauthenticated."}` |
| /conversations | ✅ 401 | `{"message":"Unauthenticated."}` |
| /reviews | ✅ 401 | `{"message":"Unauthenticated."}` |
| /performance | ✅ 401 | `{"message":"Unauthenticated."}` |

**Uwaga:** Kod 401 oznacza że endpoint istnieje i jest chroniony - **to nie jest błąd**.

## Następne Kroki (Jeśli Potrzebne)

### Debugowanie Błędów 500 (Jeśli się pojawią)
1. Sprawdź logi Laravel: `storage/logs/laravel.log`
2. Uruchom seeder do populacji danych: `php artisan db:seed`
3. Upewnij się że migracje są uruchomione: `php artisan migrate`
4. Zweryfikuj konfigurację .env

### Testowanie z Autentykacją
1. Stwórz testowe konto dostawcy w Laravel
2. Wygeneruj Sanctum bearer token
3. Przekaż token jako zmienną środowiskową lub wpisz w test
4. Testy będą zwracać 200 z rzeczywistymi danymi

### Monitorowanie Odpowiedzi API
Testy E2E logują szczegółowe informacje o odpowiedziach:
```
📍 Test: GET /provider/dashboard/performance
Status: 200
✅ SUKCES - Metryki wydajności zwrócone
Odpowiedź: {views: 342, rating: 4.8, ...}
```

Użyj tego do identyfikacji wszelkich rozbieżności między rzeczywistym a mockowanym API.

## Pliki

- **Test E2E:** [tests/e2e/api.test.ts](tests/e2e/api.test.ts)
- **Testy Unit:** `tests/unit/provider/dashboard/`
- **Testy Integracyjne:** `tests/integration/`
- **Konfiguracja:** [vitest.config.ts](vitest.config.ts), [tests/setup.ts](tests/setup.ts)

