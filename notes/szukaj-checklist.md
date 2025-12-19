# /szukaj – checklist funkcjonalności

## Wymagane funkcje (docelowo 1:1 z LocalServices)
- Pasek wyszukiwania (fraza: zawód/firma) z debounce
- Presety szybkich filtrów (top-rated, budget, verified, instant, nearby)
- Tryb list/map + toggle prawego sidebaru (ulubione)
- Lewy panel filtrów (sticky): kategoria, lokalizacja+promień, trust score min, cena min/max, poziom weryfikacji (multi), dostępność/instant (switch), rating min
- Sortowanie (relevance, rating, price_low, price_high, newest)
- Chipy aktywnych filtrów + „Wyczyść wszystkie”
- Wyniki: karty providerów (zdjęcie, nazwa, rating, kategoria, cena, miasto, badge instant/verified), skeleton, empty state, paginacja lub infinite scroll
- SEO/URL state: q, loc, cat, ver, ts, pmin, pmax, avail, instant, rating, view, sort (aktualizacja URL przy zmianach)
- Responsywność: mobile sheet z filtrami, desktop sticky panel; dark mode

## Dane / założenia (do potwierdzenia w kodzie)
- Kategorie: id, name, icon (źródło API?)
- Lokalizacje: id, name (lub string city z usługi?) + promień km
- Pola usługi: category.name, city, base_price, rating?, instant?, trust_score?, verification_level?
- Map view: czy mamy geo? jeśli brak, na start list-only

## Plan wdrożenia (propozycja etapów)
1) Etap 1 – list-only + URL state
   - Pasek search (debounce), presety, lewy panel filtrów (kategoria/miasto/cena min-max/instant/rating min), sort, chipy, paginacja
   - Aktualizacja URL query params; reset paginacji przy zmianie filtrów
2) Etap 2 – rozszerzenia
   - Trust score, weryfikacja (multi), dostępność, promień
   - Infinite scroll (IntersectionObserver)
   - Map toggle (jeśli dane geo)
3) Etap 3 – polish
   - Sheet mobilny na filtry, sidebar ulubionych, toasty błędów/empty state CTA

## Następne kroki (start)
- [ ] Sprawdzić dostępne pola w API usług (rating, instant, trust_score, verification_level, city)
- [ ] Zdefiniować model filtrów + mapowanie na query params
- [ ] Dodać stronę /szukaj z URL state + debounced search + kategoria/miasto/cena/instant/rating + sort + chipy
- [ ] Przełączyć ServiceList, aby korzystał z nowego store filtrów/URL
- [ ] (opcjonalnie) dodać infinite scroll zamiast paginacji
