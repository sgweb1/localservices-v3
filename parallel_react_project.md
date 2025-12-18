# PARALLEL_REACT_PROJECT.md

> 📌 Ten dokument definiuje **NOWY PROJEKT (React + API)** działający **RÓWNOLEGLE** do istniejącego systemu Laravel + Livewire.
>
> ⚠️ Stary projekt jest dostępny **WYŁĄCZNIE DO ANALIZY**.
> ❌ Zakaz kopiowania kodu, struktur, nazw klas i komponentów.
Piszemu zawsze po polsku commity i komunikacja

Ważne za kązdym razem gdy zdobywasz istotne dla projektu informacje zapisuj je do ANALIZA_LOCALSERVICES.md
---

## 1. CEL PROJEKTU

**ls2** to proof-of-concept marketplace lokalnych usług z React frontendem.

Celem projektu jest:
- zbudowanie **alternatywnego frontendu w React** dla platformy marketplace
- oparcie CAŁEJ logiki biznesowej o **architekturę serwisów (backend)**
- ułatwienie pracy z LLM poprzez prostą, przewidywalną strukturę
- umożliwienie porównania Livewire vs React w kontekście marketplace
- **wybór 2-3 kluczowych feature'ów** zamiast pełnej replikacji

**WAŻNE:** To NIE jest rewrite całego LocalServices. To **kontrolowany eksperyment** na wybranych funkcjonalnościach.

---

## 2. ZAKRES DOSTĘPU DO STAREGO PROJEKTU (KRYTYCZNE)
stary projekt: \\wsl.localhost\Ubuntu\home\szymo\projects\localservices\
LLM ma dostęp do starego projektu WYŁĄCZNIE w celu:
- zrozumienia domeny
- identyfikacji feature'ów
- analizy przepływów
- wykrycia edge-case’ów

### ❌ ZABRONIONE:
- kopiowanie kodu
- przepisywanie nazw klas
- odtwarzanie struktury plików
- kopiowanie SQL / migracji

### ✅ DOZWOLONE:
- opisywanie zachowania
- streszczanie logiki
- wyciąganie reguł biznesowych

---

## 3. ARCHITEKTURA HIGH-LEVEL

```
[ React App ]  --->  [ Laravel API ]  --->  [ Services ]  --->  [ Models ]
```

Zasady:
- React = UI + state
- API = transport
- Services = JEDYNE źródło logiki
- Models = dane

---

## 4. BACKEND – ZASADY ABSOLUTNE

### 4.1 Serwisy

- 1 serwis = 1 akcja biznesowa
- 1 publiczna metoda (`handle`)
- brak zależności od UI

Przykład (opisowy, NIE kod):
- CreateOrderService
- CancelOrderService

---

### 4.2 Kontrolery API

- zero logiki biznesowej
- tylko:
  - walidacja requestu
  - autoryzacja
  - wywołanie serwisu

---

### 4.3 Współistnienie z Livewire

- Livewire korzysta z tych samych serwisów
- API NIE duplikuje logiki Livewire
- brak rozjazdu funkcjonalnego

---

## 5. FRONTEND (REACT) – ZASADY

### 5.1 Zakres

React odpowiada WYŁĄCZNIE za:
- UI
- UX
- zarządzanie stanem
- komunikację z API

❌ brak logiki biznesowej

---

### 5.2 Struktura (referencyjna)

```
/src
 ├── app
 ├── features
 ├── components
 ├── pages
 ├── api
 └── shared
```

---

### 5.3 Features-first

Każda funkcjonalność:
- własny katalog
- własne hooki
- własne komponenty

---

## 6. ZASADY PRACY LLM (KRYTYCZNE)

LLM działa w jednym z TRYBÓW:

### TRYB A – ANALIZA STAREGO SYSTEMU

- opisuje działanie
- wypisuje reguły
- NIE generuje kodu

### TRYB B – BACKEND

- generuje tylko:
  - serwisy
  - API
- NIE generuje UI

### TRYB C – FRONTEND (REACT)

- generuje tylko React
- NIE generuje backendu

❗ Mieszanie trybów = błąd krytyczny.

---

## 7. MIGRACJA FUNKCJONALNOŚCI (STRANGLER)

Każdy feature przechodzi statusy:

| Feature | Livewire | React | Service |
|-------|---------|-------|--------|
| Orders | DONE | IN PROGRESS | DONE |

---

## 8. FEATURES ZAIMPLEMENTOWANE I PLANOWANE

### ✅ GOTOWE (Grudzień 2025)

1. **Auth (register/login/logout)** – Sanctum cookie-based
2. **User models** – User, UserProfile, CustomerProfile, ProviderProfile (uproszczone)
3. **Profile Edit backend** – serwisy gotowe, API endpoints gotowe, React komponenty wygenerowane (UI niepodłączone)

### 🎯 NASTĘPNE (zgodnie z ANALIZA_LOCALSERVICES.md)

1. **Lista usług (ServiceListing read-only)** – prosty feature bez mutacji
   - Model ServiceListing (tytuł, opis, cena, status)
   - GET /api/v1/services (pagination + filtry)
   - React: ListaUsług component

2. **Profil providera (public view)** – widok publiczny
   - GET /api/v1/providers/{id}
   - React: ProfilProvidera component

3. **Rezerwacje (uproszczone)** – tylko Instant Booking
   - Booking model (bez płatności, mock status)
   - POST /api/v1/bookings, GET /api/v1/bookings
   - React: FormularzRezerwacji + ListaRezerwacji

---

## 9. ZASADY BEZPIECZEŃSTWA I JAKOŚCI

- brak duplikacji logiki
- brak "magicznych" helperów
- jawne kontrakty API
- małe PR-y

---

## 10. DOKUMENTY TOWARZYSZĄCE

- PROJECT_REALITY.md (stary system)
- DUAL_SYSTEM.md
- API_CONTRACTS.md

---

## 11. DEFINICJA SUKCESU

Projekt jest sukcesem jeśli:
- React działa stabilnie
- logika jest wyłącznie w serwisach
- LLM nie generuje chaosu
- decyzja migracyjna jest oparta na faktach

---

## 12. REGUŁA KOŃCOWA

> Jeśli pojawia się wątpliwość → wybieramy ROZWIĄZANIE PROSTSZE.

> Jeśli LLM chce kopiować kod → ZATRZYMAJ GO.

---

📌 Ten dokument jest **systemowym promptem projektowym**.
📌 Każda sesja LLM MUSI go respektować.

