# Zasada podziału logiki: customer / provider / frontend

Data: 2025-12-18
Autor: Copilot

## ✅ Sesja 9 - React Frontend: Services Listing

### Backend
- ✅ Utworzony `ServiceApiService` z 5 metodami (list, getById, getProviderServices, getByCategory, getByCity)
- ✅ Utworzony `ServiceController` z 5 endpointami
- ✅ Dodane 5 routes do `/api/v1/services`
- ✅ Zaktualizowany `ServiceResource` z danymi providera (avatar, rating_average, rating_count)
- ✅ Wszystkie 10 services w bazie dataseed'owane

### Frontend React
- ✅ Typy TypeScript: `Service` interface z `provider` obiektem
- ✅ API Client: `ServiceClient` z 5 metodami dla HTTP GET
- ✅ React Hook: `useServices` do zarządzania stanem paginacji i filtrów
- ✅ Komponenty:
  - `ServiceCard.tsx` - wyświetlanie pojedynczej usługi z avatar providera, ratingiem, ceną
  - `ServiceList.tsx` - grid 1-4 kolumn, filtry (kategoria, miasto, szukanie), paginacja
  - `ServicesPage.tsx` - wrapper page
- ✅ Routing: Toggle 'services' | 'auth' w `main.tsx` z navbar

### Błędy rozwiązane
- ❌ `avatar_url` - kolumna nie istnieje w User model → zmieniono na `avatar`
- ❌ `rating` → zmieniono na `rating_average`
- ❌ `reviews_count` → zmieniono na `rating_count`
- ✅ Aktualizacja ServiceApiService (5x with clause)
- ✅ Aktualizacja ServiceResource (provider mapping)
- ✅ Aktualizacja React types i ServiceCard component

### Status
- Reguła: Utrzymujemy wyraźny podział katalogów i odpowiedzialności pomiędzy:
  - customer (logika i UI klienta końcowego)
  - provider (logika i UI wykonawcy/usługodawcy)
  - frontend (warstwa wspólna i/lub shell SPA, komponenty dzielone)
- Cel: czytelność, możliwość niezależnego rozwoju strumieni, mniejsza kolizja zmian.
- Implementacja (w trakcie):
  - Backend: `app/Services/Api/*ApiService`, `app/Http/Controllers/Api/V1/*Controller`
  - Frontend: `src/features/customer/*` (Services, Bookings, Reviews, Chat), `src/features/provider/*` (Dashboard, Analytics), `src/api/v1/*` (HTTP clients)
- Status: **✅ AKTYWNA** - Services Listing kompletny, API vraca dane, React wyświetla karty

