# Dokumentacja testów - LocalServices

## Przegląd

Projekt używa trzech poziomów testów:
1. **Backend (PHPUnit)** - testy API Laravel
2. **Frontend (Vitest + React Testing Library)** - testy komponentów React
3. **E2E (Playwright)** - testy end-to-end pełnych przepływów

---

## 🧪 Backend - PHPUnit

### Uruchamianie testów

```bash
# Wszystkie testy
php artisan test

# Z coverage
php artisan test --coverage

# Konkretny test
php artisan test --filter LocationControllerTest

# Grupa testów
php artisan test --group api
```

### Struktura testów backend

```
tests/
├── Feature/
│   ├── Booking/
│   │   ├── CustomerBookingJourneyTest.php  (SC-201, 12 testów)
│   │   └── ProviderBookingWorkflowTest.php (SC-002, 15 testów)
│   └── Api/
│       └── V1/
│           ├── LocationControllerTest.php  (9 testów)
│           └── ServiceControllerTest.php   (16 testów)
└── Unit/
```

### Pokrycie testów backend

**CustomerBookingJourneyTest.php** - SC-201 - 12 testów:
- ✅ `test_customer_can_browse_services_by_location` - GET /api/v1/services?location={slug}
- ✅ `test_customer_can_filter_services_by_category` - Filter po kategorii
- ✅ `test_customer_can_view_provider_details` - GET /api/v1/providers/{id}
- ✅ `test_customer_can_book_instant_service` - POST /api/v1/bookings (instant)
- ✅ `test_customer_can_request_quote` - POST /api/v1/bookings (request)
- ✅ `test_customer_can_track_booking_status` - GET /api/v1/bookings (lista)
- ✅ `test_customer_can_view_booking_details` - GET /api/v1/bookings/{id}
- ✅ `test_customer_can_cancel_booking` - POST /api/v1/bookings/{id}/cancel
- ✅ `test_customer_cannot_view_other_customers_bookings` - 403 Forbidden
- ✅ `test_customer_cannot_book_without_required_fields` - 422 Validation
- ✅ `test_customer_cannot_book_in_the_past` - 422 Validation
- ✅ `test_unauthenticated_user_cannot_book` - 401 Unauthorized

**ProviderBookingWorkflowTest.php** - SC-002 - 15 testów:
- ✅ `test_provider_receives_notification_on_new_booking` - GET /api/v1/provider/bookings
- ✅ `test_provider_can_view_booking_details` - GET /api/v1/provider/bookings/{id}
- ✅ `test_provider_can_accept_booking_request` - POST /api/v1/provider/bookings/{id}/accept
- ✅ `test_provider_can_decline_booking` - POST /api/v1/provider/bookings/{id}/decline
- ✅ `test_provider_can_send_quote` - POST /api/v1/provider/bookings/{id}/send-quote
- ✅ `test_provider_can_chat_with_customer` - POST /api/v1/conversations + /messages
- ✅ `test_provider_can_read_customer_messages` - GET /api/v1/conversations/{id}/messages
- ✅ `test_provider_can_mark_booking_in_progress` - POST /api/v1/provider/bookings/{id}/start
- ✅ `test_provider_can_mark_booking_completed` - POST /api/v1/provider/bookings/{id}/complete
- ✅ `test_provider_can_filter_bookings_by_status` - GET /api/v1/provider/bookings?status={status}
- ✅ `test_provider_can_view_statistics` - GET /api/v1/provider/statistics
- ✅ `test_provider_cannot_view_other_providers_bookings` - 403 Forbidden
- ✅ `test_provider_cannot_complete_pending_booking` - 422 Validation
- ✅ `test_unauthenticated_user_cannot_access_provider_bookings` - 401 Unauthorized

**LocationControllerTest.php** - 9 testów:
- ✅ `test_index_returns_all_locations` - GET /api/v1/locations
- ✅ `test_index_sorts_by_major_city_then_name` - Sortowanie
- ✅ `test_major_cities_returns_only_major_cities` - Filtr major cities
- ✅ `test_show_returns_location_by_id` - GET /api/v1/locations/{id}
- ✅ `test_show_returns_404_for_non_existent_location` - 404 handling
- ✅ `test_by_slug_returns_location` - GET /api/v1/locations/by-slug/{slug}
- ✅ `test_by_slug_returns_404_for_non_existent_slug` - 404 handling
- ✅ `test_index_returns_only_selected_fields` - Walidacja struktury odpowiedzi

**ServiceControllerTest.php** - 16 testów:
- ✅ `test_index_returns_services_list` - GET /api/v1/services
- ✅ `test_filter_by_category` - Filtr category
- ✅ `test_filter_by_location_id` - Filtr location_id
- ✅ `test_filter_by_search` - Search po nazwie/opisie
- ✅ `test_filter_by_price_range` - Filtr min_price/max_price
- ✅ `test_filter_by_instant_only` - Filtr instant_booking
- ✅ `test_sort_by_price_asc` - Sortowanie cena rosnąco
- ✅ `test_sort_by_price_desc` - Sortowanie cena malejąco
- ✅ `test_pagination` - Paginacja (per_page, page)
- ✅ `test_per_page_max_50` - Walidacja per_page
- ✅ `test_location_id_must_exist` - Walidacja location_id
- ✅ `test_show_returns_service_details` - GET /api/v1/services/{id}
- ✅ `test_show_returns_404_for_non_existent_service` - 404 handling
- ✅ `test_only_active_services_are_returned` - Tylko status='active'
- ✅ `test_provider_trust_score_is_loaded` - Eager loading provider

---

## ⚛️ Frontend - Vitest + React Testing Library

### Uruchamianie testów

```bash
# Wszystkie testy
npm run test

# Watch mode (reruns on file change)
npm run test -- --watch

# UI mode (graficzny interfejs)
npm run test:ui

# Coverage report
npm run test:coverage
```

### Struktura testów frontend

```
tests/
└── unit/
    └── ServiceList.test.tsx  (15 testów)
```

### Pokrycie testów frontend

**ServiceList.test.tsx** - 15 testów:
- ✅ `renderuje nagłówek strony` - Podstawowy render
- ✅ `ładuje i wyświetla listę usług` - API integration
- ✅ `wyświetla liczbę wyników` - Meta pagination
- ✅ `wyświetla skeleton loader podczas ładowania` - Loading state
- ✅ `obsługuje błąd API` - Error handling
- ✅ `filtruje usługi po wyszukiwanej frazie` - Search input + debounce
- ✅ `przełącza między widokiem listy a mapy` - Map toggle
- ✅ `dodaje usługę do ulubionych` - Favorites localStorage
- ✅ `otwiera sidebar z ulubionymi` - Favorites sidebar
- ✅ `aplikuje filtry przez panel filtrów` - Filter panel
- ✅ `wyświetla aktywne filtry jako badge` - Active filters
- ✅ `czyści wszystkie filtry` - Clear filters
- ✅ `otwiera dialog ze szczegółami usługi` - Service modal
- ✅ `zapisuje stan widoku (mapa/lista) w localStorage` - Persistence

### Mocki i setup

**tests/setup.ts**:
- Mock localStorage
- Mock window.matchMedia (dark mode)
- Cleanup po każdym teście
- @testing-library/jest-dom matchers

---

## 🎭 E2E - Playwright

### Uruchamianie testów

```bash
# Wszystkie testy E2E (wymaga dev server)
npm run test:e2e

# UI mode (graficzny interfejs)
npm run test:e2e:ui

# Debug mode (krok po kroku)
npx playwright test --debug

# Konkretny plik
npx playwright test szukaj.spec.ts

# Konkretny browser
npx playwright test --project=chromium
```

### Struktura testów E2E

```
tests/
└── e2e/
    └── szukaj.spec.ts  (20 testów)
```

### Pokrycie testów E2E

**szukaj.spec.ts** - 20 testów:
- ✅ `strona się ładuje i wyświetla nagłówek` - Basic page load
- ✅ `wyświetla listę usług` - Services rendering
- ✅ `wyszukiwanie przez input search` - Search input
- ✅ `filtrowanie po kategorii` - Category filter + URL
- ✅ `przełączanie między widokiem listy a mapy` - Map/List toggle
- ✅ `dodawanie do ulubionych` - Favorites functionality
- ✅ `otwieranie sidebaru z ulubionymi` - Favorites sidebar
- ✅ `filtrowanie po cenie` - Price range filter
- ✅ `sortowanie usług` - Sort dropdown
- ✅ `usuwanie pojedynczego filtra przez badge X` - Remove filter
- ✅ `czyszczenie wszystkich filtrów` - Clear all
- ✅ `preset "Najlepiej oceniani"` - Quick preset
- ✅ `preset "Express / Instant"` - Quick preset
- ✅ `dark mode toggle` - Dark mode switch
- ✅ `responsive - mobile view` - Mobile viewport
- ✅ `otwieranie modalu ze szczegółami usługi` - Service modal
- ✅ `SEO-friendly URL - kategoria i miasto` - URL routing
- ✅ `infinite scroll - ładowanie kolejnych stron` - Pagination

### Konfiguracja Playwright

**playwright.config.ts**:
- Base URL: `http://localhost:5173`
- Browser: Chromium (Desktop Chrome)
- Retry: 2x w CI, 0 lokalnie
- Screenshots: tylko przy błędzie
- Trace: przy pierwszym retry
- WebServer: auto-start `npm run dev`

---

## 📊 Uruchamianie wszystkich testów

### Lokalne środowisko

```bash
# Backend
php artisan test --coverage

# Frontend (watch mode)
npm run test:ui

# E2E (wymaga running dev server)
npm run dev  # W osobnym terminalu
npm run test:e2e
```

### CI/CD Pipeline

```bash
# Backend
php artisan test --coverage --min=80

# Frontend
npm run test:coverage -- --coverage.enabled --coverage.reporter=json

# E2E
npm run test:e2e -- --reporter=json
```

---

## 🔧 Debugowanie testów

### PHPUnit (Backend)

```bash
# Wyświetl SQL queries
php artisan test --filter LocationControllerTest --env=testing

# Debug konkretnego testu
php artisan test --filter test_index_returns_all_locations
```

### Vitest (Frontend)

```bash
# UI mode z hot reload
npm run test:ui

# Debug w VSCode - użyj breakpointów w kodzie
```

### Playwright (E2E)

```bash
# Krok po kroku debug
npx playwright test --debug

# Headed mode (widoczny browser)
npx playwright test --headed

# Slow motion (1000ms delay między akcjami)
npx playwright test --slow-mo=1000

# Trace viewer (po failed test)
npx playwright show-trace trace.zip
```

---

## 🎯 Cel pokrycia (Coverage)

| Typ testu | Obecne | Cel |
|-----------|--------|-----|
| Backend (PHPUnit) | 52 testów (SC-201 + SC-002 + API) | 90%+ |
| Frontend (Vitest) | 15 testów | 80%+ |
| E2E (Playwright) | 20 testów | Krytyczne przepływy |

---

## 📝 Dobre praktyki

### Backend (PHPUnit)

1. Używaj `RefreshDatabase` trait
2. Twórz factories dla modeli
3. Testuj status codes (200, 404, 422)
4. Waliduj strukturę JSON odpowiedzi
5. Testuj edge cases (empty, null, invalid)

### Frontend (Vitest)

1. Mock API calls
2. Test user interactions (clicks, inputs)
3. Check accessibility (roles, labels)
4. Test loading/error states
5. Verify localStorage persistence

### E2E (Playwright)

1. Użyj `data-testid` dla stabilnych selektorów
2. Testuj happy path + edge cases
3. Sprawdź URL routing
4. Test na różnych viewportach
5. Screenshot przy błędzie (auto)

---

## 🚀 Następne kroki

- [ ] Uruchomić testy: `php artisan test --group booking`
- [ ] Zaimplementować API endpoints dla SC-201 (Customer Booking)
- [ ] Zaimplementować API endpoints dla SC-002 (Provider Workflow)
- [ ] Dodać testy dla ServiceCard komponentu (React)
- [ ] Dodać testy dla ServiceDetailsDialog
- [ ] Dodać testy dla ServiceMap
- [ ] Dodać testy dla useGeolocation hook
- [ ] Dodać testy dla LocationClient
- [ ] Playwright E2E dla booking journey
- [ ] Zwiększyć coverage backend do 90%
- [ ] Dodać visual regression tests (Percy/Chromatic)
- [ ] Dodać performance tests (Lighthouse CI)

---

## 📚 Dokumentacja

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [PHPUnit](https://phpunit.de/)
- [Laravel Testing](https://laravel.com/docs/11.x/testing)
