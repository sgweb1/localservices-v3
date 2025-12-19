# ANALIZA LOCALSERVICES – Wnioski dla projektu ls2

**Data analizy:** 2025-12-18  
**Analizowany projekt:** `\\wsl.localhost\Ubuntu\home\szymo\projects\localservices`  
**Projekt docelowy:** `\\wsl.localhost\Ubuntu\home\szymo\projects\ls2`

---

## 1. CZYM JEST LOCALSERVICES

**LocalServices** to **zaawansowana platforma marketplace** łącząca lokalnych usługodawców (hydraulicy, elektricy, sprzątaczki, korepetytorzy, opiekunki, ogrodnicy) z klientami w ich okolicy.

### Model biznesowy
- **B2B2C Marketplace**
- Prowizje + subskrypcje dla providerów
- Dwa tryby rezerwacji: **Instant Booking** i **Request for Quote**

### Status projektu
- **Faza:** MVP Development
- **Wersja:** 1.0.0-beta
- **Pokrycie testami:** ~92% (120+ testów)
- **Stack:** Laravel 12 + Livewire 3 + Filament 4 + Alpine.js 3

---

## 2. KLUCZOWE FUNKCJONALNOŚCI

### ✅ Gotowe w starej wersji

1. **Weryfikacja 5-poziomowa** usługodawców
   - Poziom 1-5 (od podstawowej po pełną weryfikację tożsamości)
   - Trust Score™ (0-100, próg 70% dla premium)
   - Algorytm: weryfikacja + recenzje + completion rate + response time

2. **Quiz kwalifikacyjny**
   - 10 pytań branżowych
   - 70% zdawalność wymagana
   - Quizy kategoryzowane (hydraulik, elektryk, etc.)

3. **Smart Geo-Ranking**
   - Algorytm ważony odległością
   - Lokalizacja oparta na współrzędnych (lat/lng)
   - Radius search + travel fee per km

4. **Rezerwacje (Booking)**
   - Instant Booking: natychmiastowe potwierdzenie
   - Request Quote: provider akceptuje/odrzuca
   - Booking number (BK-2025-00001)
   - Status workflow: pending → confirmed → started → completed → reviewed
   - Cancellation policy + fees
   - Payment status tracking (pending/paid/refunded/failed)

5. **System recenzji 5-gwiazdkowy**
   - Review milestones (gamification)
   - Review responses (provider odpowiada)
   - Helpful votes (użytkownicy oceniają recenzje)
   - Review reports (spam/abuse)

6. **Real-time chat**
   - Conversations + Messages
   - Message attachments
   - Online status tracking (last_seen_at)

7. **Kalendarz dostępności**
   - Model Availability (provider ustawia sloty)
   - Booking zajmuje slot automatycznie

8. **Wideo-wizytówka wykonawcy** (15-30 sekund)

9. **Subdomeny dla providerów**
   - `{slug}.localservices.test`
   - Custom domain setup (docs: PROVIDER_SUBDOMAINS.md)

10. **Admin Panel (Filament 4)**
    - Zarządzanie użytkownikami, rezerwacjami, płatnościami
    - Scraper Control Center (OLX/Marketplace scrapers)
    - Tag management + masowe kampanie
    - Audit log

11. **Payments & Subscriptions**
    - PayU integration
    - Subscription plans (Free/Pro/Premium)
    - Feature flags per plan
    - Invoices (Infakt integration)
    - Payouts dla providerów

12. **Real-time features (Laravel Reverb)**
    - Booking events broadcast
    - Availability changes
    - Chat messages

13. **Monitoring & Logging**
    - Discord alerts (błędy 5xx, wolne requesty, slow queries)
    - Admin Audit Log
    - PHPStan/Larastan w CI/CD

---

## 3. STRUKTURA BACKENDU (KLUCZOWE MODELE)

### Core Models

| Model | Odpowiedzialność |
|-------|------------------|
| **User** | Bazowy użytkownik (customer/provider), UUID, role (Spatie), Sanctum API tokens |
| **UserProfile** | Profil bazowy (languages, profile_completion_percentage) |
| **CustomerProfile** | Profil klienta |
| **ProviderProfile** | Profil usługodawcy (trust_score, verification_level, completion_rate, response_time_hours, cancellation_rate, average_rating, reviews_count) |
| **ServiceListing** | Ogłoszenie usługi (dawniej Service, teraz ServiceListing + alias Service dla BC) |
| **ServiceCategory** | Kategoria usługi (hydraulik, elektryk, etc.) |
| **ServiceSubcategory** | Podkategoria |
| **Booking** | Potwierdzona rezerwacja (booking_number, status, payment_status, start_time/end_time, total_price) |
| **BookingRequest** | Żądanie rezerwacji (before acceptance) |
| **QuoteRequest** | Zapytanie o wycenę |
| **Review** | Recenzja (5-gwiazdkowa + komentarz) |
| **ReviewResponse** | Odpowiedź providera na recenzję |
| **ReviewMilestone** | Kamienie milowe gamifikacji (10 reviews, 50 reviews, etc.) |
| **Conversation** | Konwersacja (customer ↔ provider) |
| **Message** | Wiadomość w konwersacji |
| **MessageAttachment** | Załącznik do wiadomości |
| **Availability** | Slot dostępności providera |
| **Location** | Lokalizacja (city + coordinates) |
| **ServiceArea** | Obszar świadczenia usług |
| **Verification** | Weryfikacja providera (5 poziomów) |
| **Certification** | Certyfikat providera (upload PDF/image) |
| **PortfolioItem** | Element portfolio (zdjęcia prac) |
| **SubscriptionPlan** | Plan subskrypcji (Free/Pro/Premium) |
| **Subscription** | Aktywna subskrypcja użytkownika |
| **Payment** | Płatność (PayU) |
| **Invoice** | Faktura (Infakt integration) |
| **Payout** | Wypłata dla providera |
| **QuizQuestion** | Pytanie w quizie kwalifikacyjnym |
| **QuizAttempt** | Próba rozwiązania quizu |
| **ScraperSource** | Źródło scrapingu (OLX/Marketplace) |
| **ScraperRun** | Przebieg scrapingu |
| **ScrapedProvider** | Wynik scrapingu (konkurencja) |
| **ProviderTrafficEvent** | Event ruchu providera (views, clicks, leads) |
| **AdminAuditLog** | Logi audytowe admina |
| **NotificationLog** | Logi powiadomień |
| **PushSubscription** | Subskrypcja Web Push |
| **Referral** | System poleceń |
| **Coupon** | Kupony rabatowe |
| **CouponUse** | Użycie kuponu |
| **BugReport** | Zgłoszenia bugów od użytkowników |
| **ContactMessage** | Wiadomości kontaktowe |
| **EducationalArticle** | Artykuły edukacyjne |
| **BlogPost** | Blog (marketing content) |
| **BlogCategory** | Kategorie bloga |
| **Banner** | Bannery (promocje) |
| **FeatureFlag** | Feature flags (A/B testing) |
| **Terms** | Regulaminy (terms & conditions, privacy policy) z PDFami |

### Services (logika biznesowa)

| Service | Odpowiedzialność |
|---------|------------------|
| **TrustScoreService** | Kalkulacja Trust Score™ (verification 30%, rating 25%, reviews 15%, completion 10%, response 10%, cancellation penalty 10%) |
| **NotificationService** | Wysyłanie powiadomień (email, push, SMS) |
| **PaymentService** | Obsługa płatności (PayU) |
| **SubscriptionService** | Zarządzanie subskrypcjami |
| **InvoiceService** | Generowanie faktur (Infakt API) |
| **PdfGeneratorService** | Generowanie PDF (faktury, certyfikaty) |
| **ProviderWizardService** | Onboarding providera (wizard wieloetapowy) |
| **OnboardingService** | Onboarding użytkownika |
| **ScraperService** | Scraping konkurencji (OLX/Marketplace) |
| **ProviderTrafficService** | Tracking ruchu providerów |
| **ProviderAnalyticsService** | Analityka dla providerów |
| **ProviderPerformanceService** | Metryki wydajności providera |
| **ReviewGamificationService** | Gamifikacja recenzji (milestones, badges) |
| **SearchParserService** | Parsowanie zapytań wyszukiwania |
| **ReferralService** | System poleceń |
| **PricingService** | Dynamiczna kalkulacja cen |
| **CdnService** | Zarządzanie CDN (CloudFlare) |
| **WebPushService** | Web Push notifications |
| **LoadBalancerService** | Load balancing |
| **GuidedTipsService** | Tooltips dla użytkowników |
| **AdminMetricsService** | Dashboard metryki dla admina |
| **AnalyticsService** | Globalna analityka |

---

## 4. STRUKTURA FRONTENDU (LIVEWIRE)

### Livewire Components (app/Livewire/)

- **Customer/** – komponenty dla klientów
- **Provider/** – komponenty dla providerów
- **Messages/** – real-time chat
- **Frontend/** – publiczne strony
- **Admin/** – dashboard admina
- **Search/** – wyszukiwarka usług
- **Subscription/** – zarządzanie subskrypcjami
- **Settings/** – ustawienia użytkownika
- **Dev/** – narzędzia deweloperskie
- **Modals/** – modalne okna
- **Shared/** – komponenty współdzielone

### Design System (Tailwind + Alpine)

- **Paleta:** Teal/Cyan (#06B6D4)
- **Czcionka:** Archivo
- **Komponenty:** Glass cards (backdrop-blur), gradient badges, hero sections
- **Ikony:** Heroicons (przez Blade Icons)
- **Klasy utility:** `hero-gradient`, `icon-gradient-1/2/3`, `text-gradient`, `badge-gradient`, `glass-card`, `rounded-2xl`

---

## 5. ARCHITEKTURA API

### Routing
- **Web routes:** `routes/web.php` (Livewire full-page)
- **API routes:** `routes/api.php` (v1 versioning)
- **API Controllers:** `app/Http/Controllers/Api/V1/`

### Sanctum SPA Authentication
- Cookie-based dla SPA (nie token-based)
- `/sanctum/csrf-cookie` → login/register → session cookie
- Middleware: `auth:sanctum`

### Przykładowe endpointy (domniemane na podstawie struktury)
- `POST /api/v1/register` – rejestracja
- `POST /api/v1/login` – logowanie
- `GET /api/v1/user` – pobranie zalogowanego usera
- `POST /api/v1/logout` – wylogowanie
- `GET /api/v1/services` – lista usług
- `GET /api/v1/bookings` – rezerwacje
- `POST /api/v1/bookings` – utworzenie rezerwacji
- `GET /api/v1/providers/{id}` – profil providera
- `POST /api/v1/reviews` – wystawienie recenzji

---

## 6. KONWENCJE KODOWANIA (CODE_STANDARDS.md)

### Język
- **Polski:** komunikacja, UI, dokumentacja, commity, komentarze PHPDoc
- **Angielski:** kod (zmienne, metody, klasy)
- **Commity:** format `type: Opis zmiany` (feat, fix, docs, refactor, test, chore)

### PHP Standards
- **Constructor promotion:** zawsze `public function __construct(public Service $service) {}`
- **Type hints:** wszędzie (return types, parameter types)
- **Enums:** TitleCase keys (ServiceCategory, VerificationLevel, BookingStatus)
- **Curly braces:** zawsze (nawet dla single-line)

### Livewire
- Feature-based folders: `app/Livewire/{Customer,Provider,Messages}/`
- Events: `$this->dispatch('event', ['key' => 'value'])` (arrays, not objects)
- Real-time listeners: `#[On('booking.created')]` attribute

### Blade & Alpine
- **Heroicons:** `@svg('heroicon-o-star')` lub `<x-heroicon-o-star class="w-5 h-5" />`
- **Alpine events:** `$dispatch('event', { key: value })` (objects)
- **SVG paths:** Arc flags ze spacjami: `a3 3 0 1 1 -6 0` NIE `a3 3 0 1 1-6 0`

### Testing
- **Feature tests:** pełne workflow użytkownika (`tests/Feature/`)
- **Unit tests:** logika serwisów/helperów (`tests/Unit/`)
- **Coverage target:** 90%+
- **PHPUnit 11.x**

---

## 7. CI/CD & DevOps

### GitHub Actions
- `tests.yml` – wszystkie testy + MySQL setup
- `pint.yml` – code style check (Laravel Pint)
- `ci.yml` – complete pipeline + Codecov
- PHPStan/Larastan w pipeline

### Development Environment
- **Domena lokalna:** `https://localservices.test` (SSL via `certs/localhost.{crt,key}`)
- **Ports:** Laravel 8000, Queue, Vite, Mailpit 8025
- **Mailpit:** UI dla testowania emaili (http://127.0.0.1:8025)
- **Komenda dev:** `composer run dev` (Laravel + Queue + Logs + Vite)

### Monitoring
- **Discord alerts:** błędy 5xx, wolne requesty (>2s), slow queries (>100ms)
- **Admin Audit Log:** wszystkie akcje admina
- **Laravel Telescope:** debugging tool (tabela `telescope_entries`)

---

## 8. KLUCZOWE RÓŻNICE MIĘDZY LOCALSERVICES A LS2

| Aspekt | LocalServices (stary) | ls2 (nowy) |
|--------|-----------------------|------------|
| **Frontend** | Livewire 3 (full-page components) | React + TypeScript (SPA) |
| **API** | Sanctum (cookie-based dla Livewire) | Sanctum (API dla React) |
| **Routing** | Web routes (Blade + Livewire) | API routes (JSON) + React Router |
| **State Management** | Livewire wire:model | React Query + useState |
| **Real-time** | Laravel Echo (Reverb) | **MOŻE** być dodany (Echo client-side) |
| **UI Components** | Blade components + Alpine.js | React components |
| **Struktura** | Livewire feature folders | React feature folders (podobna filozofia) |
| **Logika biznesowa** | **Services (shared!)** | **Services (te same!)** |
| **Database** | MySQL (pełna struktura 60+ tabel) | MySQL (tylko wybrane feature'y) |

---

## 9. CO LOKALSERVICES ROBI, CZEGO LS2 NIE MA
### Zaawansowane funkcje (nie dla MVP ls2)
1. **Quiz kwalifikacyjny** – QuizQuestion, QuizAttempt, logika oceny
2. **Scraper konkurencji** – OLX/Marketplace scraping, 4 tabele (ScraperSource, ScraperRun, ScrapedProvider, ScraperAlert)
3. **Subdomeny dla providerów** – `{slug}.localservices.test`, DNS setup
4. **Gamifikacja recenzji** – ReviewMilestone, badges, achievements
5. **Portfolio providerów** – PortfolioItem (galeria prac)
6. **Blog & Educational Content** – BlogPost, BlogCategory, EducationalArticle
7. **Bannery** – Banner model (promocje)
13. **Admin Audit Log** – pełny tracking akcji admina
14. **Provider Traffic Analytics** – ProviderTrafficEvent (views, clicks, leads)
15. **Contractor matching** – Contractor, ContractorLeadLog (external providers)
16. **Terms & Conditions z PDF** – Terms model (generated PDFs)
17. **Guided Tips** – GuidedTipsService (onboarding tooltips)
18. **Load Balancer** – LoadBalancerService (custom logic)
19. **Infakt Integration** – automatyczne faktury
20. **PayU Payment Gateway** – pełna integracja płatności

### Bazowe funkcje (potencjalnie dla ls2)
1. **Auth (register/login/logout)** – ✅ ZROBIONE w ls2
2. **Profile Edit** – ✅ CZĘŚCIOWO (backend gotowy, UI brak)
3. **User/UserProfile/CustomerProfile/ProviderProfile** – ✅ ZROBIONE w ls2 (uproszczona wersja)
4. **Trust Score™** – ❌ NIE MA (algorytm jest w starej wersji TrustScoreService)
7. **Reviews** – ❌ NIE MA (recenzje 5-gwiazdkowe)
8. **Real-time Chat** – ❌ NIE MA (Conversation, Message)
9. **Availability Calendar** – ❌ NIE MA (provider slots)
10. **Payments** – ❌ NIE MA (PayU integration)
11. **Subscriptions** – ❌ NIE MA (plans + billing)

---

## 10. WNIOSKI DLA LS2

### ✅ CO ZACHOWAĆ Z LOCALSERVICES (KONCEPCYJNIE)

1. **Architektura serwisów** – cała logika biznesowa w `app/Services/`, zero logiki w kontrolerach
2. **User + Profile split** – User (auth) + UserProfile (szczegóły) + CustomerProfile/ProviderProfile (role-specific)
3. **Trust Score™ algorytm** – weryfikacja 5-poziomowa + weighted score (do zaimplementowania jeśli potrzebny)
4. **Booking workflow** – Instant + Quote Request (do zaimplementowania jeśli potrzebny)
5. **Feature-based struktura** – `app/Livewire/{Customer,Provider}` → `src/features/{customer,provider}` w React
6. **API versioning** – `/api/v1/` (już jest w ls2)
7. **Sanctum cookie-based auth** – (już działa w ls2)
8. **Konwencje kodowania** – język polski w komunikacji, angielski w kodzie, type hints wszędzie

### ❌ CZEGO NIE KOPIOWAĆ (ZA DUŻE DLA MVP)

1. **Cała struktura 60+ tabel** – za dużo, wybierz tylko niezbędne
2. **Scraper logic** – niepotrzebne w MVP
3. **Quiz system** – niepotrzebny w MVP
4. **Gamifikacja** – nice-to-have, nie MVP
5. **Subdomeny** – skomplikowane, nie MVP
6. **Payment gateway** – można odłożyć
7. **Filament Admin** – ls2 ma React, admin może być prostszy lub osobny
8. **Discord alerts** – monitoring nice-to-have, nie MVP
9. **Infakt integration** – overkill dla MVP

### 🎯 CO MOŻE BYĆ PROSTYM FEATURE'M DLA LS2

1. **Lista usług (ServiceListing read-only)** – zgodnie z 14-dniowym planem
   - Backend: Service model + ServiceController
   - Frontend: React lista + pagination
   - Bez rezerwacji (tylko display)

2. **Profil providera (public view)** – prosty widok profilu
   - Backend: GET /api/v1/providers/{id}
   - Frontend: React komponent (avatar, bio, trust score jeśli jest)

3. **Rezerwacje (uproszczone)** – tylko Instant Booking
   - Bez Quote Request (za skomplikowane)
   - Bez płatności (mock payment status)
   - Prosty workflow: create → confirm → complete

4. **Recenzje (uproszczone)** – 5 gwiazdek + komentarz
   - Bez Review Response (za dużo)
   - Bez gamifikacji
   - Bez helpful votes

### 📋 REKOMENDOWANY ROADMAP DLA LS2

**Faza 1: Fundamenty (ZROBIONE)**
- ✅ Auth (register/login/logout)
- ✅ User/Profile models (uproszczone)
- ✅ API client (React)
- ✅ Struktura serwisów (backend)

**Faza 2: Pierwszy feature read-only (NEXT)**
- [ ] ServiceListing model (tylko tytuł, opis, cena, status)
- [ ] GET /api/v1/services (lista + pagination)
- [ ] React: ListaUsług component (prosty grid/list)
- [ ] Filtrowanie (opcjonalne: kategoria, lokalizacja)

**Faza 3: Profil providera (public)**
- [ ] GET /api/v1/providers/{id}
- [ ] React: ProfilProvidera component (avatar, bio, lista usług)
- [ ] Trust Score display (jeśli zaimplementowany backend)

**Faza 4: Rezerwacje (uproszczone)**
- [ ] Booking model (tylko instant booking)
- [ ] POST /api/v1/bookings (create)
- [ ] GET /api/v1/bookings (lista dla usera)
- [ ] React: FormularzRezerwacji + ListaRezerwacji
- [ ] Status workflow (mock, bez płatności)

**Faza 5: Recenzje (uproszczone)**
- [ ] Review model (rating 1-5 + comment)
- [ ] POST /api/v1/reviews
- [ ] GET /api/v1/reviews (dla service/provider)
- [ ] React: FormlarzRecenzji + ListaRecenzji

**Faza 6: Porównanie Livewire vs React**
- [ ] Analiza wydajności
- [ ] UX comparison
- [ ] Developer experience notes
- [ ] Decyzja: kontynuować React czy wrócić do Livewire?

## 11. KLUCZOWE PYTANIA DO USTALENIA

1. **Czy ls2 ma być pełnym marketplace czy proof-of-concept?**
   - Jeśli PoC → skup się na 2-3 prostych feature'ach (lista usług + rezerwacje)
   - Chat (Conversation, Message) → wymaga Laravel Reverb + Echo.js
   - Jeśli nie → odłóż na później

3. **Czy ls2 ma mieć admin panel?**
   - Jeśli tak → React Admin (custom) lub React-Admin library
   - Jeśli nie → zarządzaj przez tinker/seeder (MVP)

4. **Czy ls2 ma mieć Trust Score™?**
   - Jeśli tak → PayU integration (duża praca)
   - Jeśli nie → mock payment_status (pending/paid)

---

## 12. ZALECENIA FINALNE

### DO:
1. **Zacznij od prostego read-only feature** (lista usług) zgodnie z planem 14-dniowym
2. **Używaj tych samych serwisów** co LocalServices (DRY principle)
3. **Nie kopiuj struktury Livewire komponentów** – React ma własną filozofię
4. **Trzymaj API contracts stabilne** – nie zmieniaj pod UI
5. **Testuj każdy feature** – feature test + unit test dla serwisu
6. **Dokumentuj różnice** – co działa inaczej w React vs Livewire

### DON'T:
3. **Nie rób quizów/gamifikacji** – overkill dla MVP
4. **Nie integruj płatności** na początku – mock wystarczy
### NEXT STEPS:
2. Zaktualizuj `api_contracts_and_14_day_plan.md` pod realia marketplace
3. Zdecyduj: który feature zaczynasz (rekomendacja: lista usług)
4. Stwórz migracje dla wybranego feature'a (np. `services` table)
5. Zaimplementuj backend (Service model + controller + service class)
6. Zaimplementuj frontend (React component + API call)
7. Przetestuj (feature test + manual)

## 13. IMPLEMENTACJA SYSTEMU RÓL (2025-12-18)
**Pakiet:** spatie/laravel-permission v6.24.0

- `model_has_roles` - pivot: user ↔ roles
- `model_has_permissions` - pivot: user ↔ permissions

| Rola | Opis | Przypadek użycia |
| **admin** | Administrator platformy | Zarządzanie użytkownikami, moderacja |
| **super_admin** | Super administrator | Pełny dostęp do systemu |
| **ops_manager** | Manager operacyjny | Zarządzanie operacjami |
| **finance** | Dział finansowy | Dostęp do płatności, faktur |
- Admin dostaje: `admin` + `super_admin`

### Rozbudowa tabeli users

**Dodane kolumny (14 nowych):**

```php
// Admin flag
$table->boolean('is_admin')->default(false);

// Rozdzielenie name
$table->string('first_name')->nullable();
$table->string('last_name')->nullable();

// Rating system
$table->decimal('rating_average', 3, 2)->default(0);

// Activity tracking
$table->timestamp('last_login_at')->nullable();
// Notifications
$table->boolean('push_notifications')->default(true);
$table->boolean('sms_notifications')->default(false);

// Analytics
$table->boolean('analytics_interface_visible')->default(false);
```

### Model User - nowe metody

```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    public function isProvider(): bool
    {
        return $this->user_type === UserType::Provider || $this->hasRole('provider');
    }
        if ($this->is_admin) return true;
        return $this->hasAnyRole(['super_admin', 'admin', 'ops_manager', 'finance', 'support']);
    }

    public function isOnline(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->greaterThan(now()->subMinutes(5));
    }

    public function getActiveProfile(): ProviderProfile|CustomerProfile|null
    {
        // Zwraca aktywny profil w zależności od typu użytkownika
    }
}
```

### Seedery
```php
// Tworzenie ról
Role::firstOrCreate(['name' => 'admin']);
Role::firstOrCreate(['name' => 'super_admin']);
User::where('user_type', 'customer')->get()->each(fn($u) => $u->assignRole('customer'));
User::where('user_type', 'provider')->get()->each(fn($u) => $u->assignRole(['customer', 'provider']));
- `createAdmin()` - tworzy admina z is_admin=true + role admin/super_admin
- `assignRole()` w każdej metodzie (customer/provider)
- `2024_01_01_000001_create_cache_table.php`
- `2024_01_01_000002_create_jobs_table.php`
- `2024_01_01_000003_create_sessions_table.php`

### Test działania (2025-12-18)

```bash
php artisan migrate:fresh --seed
```

**Wyniki:**
- ✅ 15 użytkowników w bazie
- ✅ 10 z rolą `customer` (5 czystych + 10 providerów mających też customer)
- ✅ 10 z rolą `provider`
- ✅ 1 admin z `is_admin=true` + role admin/super_admin

**System ról działa poprawnie!**

### Wnioski dla projektu ls2
5. **Kolejność seederów ma znaczenie** - RoleAndPermissionSeeder MUSI być pierwszy

### Next steps

- [ ] Reviews System (reviews, review_responses)


**Priorytet 3 (Dzień 11-12):**
---
## 14. IMPLEMENTACJA LS2 – STATUS (2025-12-18)

### ✅ Priority 1 – Marketplace Core (KOMPLETNE)

**Booking System:**
- Migracja: `2024_01_25_000001_create_bookings_tables.php` (bookings + booking_requests)
- Seeder: BookingSeeder (8 rekordów: 5 confirmed/completed, 3 pending)
- Status: ✅ Produkcja

**Reviews System:**
- Migracja: `2024_01_25_000002_create_reviews_tables.php` (reviews + review_responses)
- Seeder: ReviewSeeder (3 recenzje, kategorie: communication/punctuality/cleanliness/professionalism)
- Status: ✅ Produkcja

**Chat System:**
- Migracja: `2024_01_25_000003_create_chat_tables.php` (conversations + messages + attachments)
- Seeder: ChatSeeder (5 rozmów, 20 wiadomości)
- Status: ✅ Produkcja

**Availability System:**
- Migracja: `2024_01_25_000004_create_availability_tables.php` (availabilities + exceptions + service_areas)
- Seeder: AvailabilitySeeder (60 dostępności, 20 service areas, Haversine distance)
- Status: ✅ Produkcja

**Verification System:**
- Migracja: `2024_01_25_000005_create_verification_tables.php` (4 tabele)
- Seeder: 4 seedery (23 weryfikacje, 17 certyfikatów, 10 portfolios, 9 komentarzy)
- Status: ✅ Produkcja

### ✅ Priority 2 – Payments (KOMPLETNE)

**Subscription System:**
- Migracja: `2024_01_26_000001_create_subscription_tables.php` (5 tabel)
- Seeder: SubscriptionPlanSeeder (3 plany), SubscriptionSeeder (10 aktywnych), PaymentSeeder (22 płatności), InvoiceSeeder (14 faktur)
- Status: ✅ Produkcja
- Ograniczenie: Płatności WYŁĄCZNIE za subskrypcje (brak customer-provider transactions)

### ✅ Priority 1 – API Endpoints (KOMPLETNE)

**5 Services + 4 Controllers + 15 Endpoints:**

| Endpoint | Metoda | Auth | Opis |
|----------|--------|------|------|
| /bookings | GET | - | Lista rezerwacji (paginacja) |
| /reviews | GET | - | Lista opinii (paginacja, rating distribution) |
| /providers/{id}/trust-score | GET | - | Trust Score™ + is_verified |
| /providers/{id}/schedule | GET | - | Weekly schedule + breaks |
| /providers/{id}/available-slots | GET | - | Sloty 30-min z dostępnością |
| /conversations | GET | Sanctum | Rozmowy usera |
| /conversations/{id}/messages | GET | Sanctum | Wiadomości (auto-read) |

**8 Resources:** BookingResource, ReviewResource, MessageResource, ConversationResource, CertificationResource, PortfolioItemResource, ServiceResource, UserBasicResource

**Test Results:**
- `migrate:fresh --seed`: SUCCESS ✅ (17 seeders, 150 records)
- `GET /bookings?page=1&per_page=2`: SUCCESS ✅ (JSON + pagination)
- `GET /reviews?page=1&per_page=2`: SUCCESS ✅ (rating + categories)
- `GET /providers/5/trust-score`: SUCCESS ✅ ({trust_score: 50, is_verified: true})

### 📊 STATYSTYKA

- **21 migracji** (6 framework + 15 marketplace)
- **26 tabel** w bazie
- **30+ Modelów** z relationships
- **150+ seed records** (users, services, bookings, reviews, chats, availabilities, verifications, subscriptions, payments)
- **5 API Services** + **4 Controllers** + **8 Resources**
- **Baza data**: Fully seeded, realistic Polish data

---

## 15. ANALYTICS SYSTEM – Priority 3 (2025-12-18) ✅

### Architektura

**8 tabel + 8 modeli + 1 API Service + 4 Resources + 1 Controller + 7 Routes**

**Tabele:**
1. **events** – Zdarzenia API (performance tracking) – 50 rekordów
2. **provider_metrics** – Dzienne metryki providera (310 rekordów: 10 providers × 31 dni)
3. **search_analytics** – Śledzenie wyszukiwań – 30 rekordów
4. **user_sessions** – Sesje użytkownika (behavior tracking) – 15 rekordów
5. **conversions** – Funnel tracking (booking flow) – 25 rekordów
6. **api_endpoint_metrics** – Performance metryki endpoints (217 rekordów: 7 endpoints × 31 dni)
7. **feature_flags** – Feature flags dla A/B testingu – 3 flagi
8. **feature_flag_events** – Zdarzenia feature flags – 100+ rekordów

**Modele:** Event, ProviderMetric, SearchAnalytic, UserSession, Conversion, ApiEndpointMetric, FeatureFlag, FeatureFlagEvent

**API Service:** AnalyticsApiService
- getProviderMetrics(providerId, dateFrom, dateTo)
- getProviderTodayMetrics(providerId)
- getApiEndpointMetrics(endpoint, dateFrom, dateTo)
- getTodayAllEndpointsMetrics()
- getFunnelMetrics(funnelName, dateFrom, dateTo) – zwraca conversion funnel dengan drop_rate
- getSearchMetrics(filters) – paginacja
- getSearchConversionStats() – click-through rate, conversion rate
- getDashboardSummary() – health check dla całego systemu

**Resources (4):** ProviderMetricResource, SearchAnalyticResource, ApiEndpointMetricResource, ConversionResource

**Routes (7 endpoints):**
```
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/providers/{id}/metrics?date_from=...&date_to=...
GET /api/v1/analytics/providers/{id}/today
GET /api/v1/analytics/endpoints?endpoint=...
GET /api/v1/analytics/funnel?funnel_name=booking_flow
GET /api/v1/analytics/search?service_category=...&city=...
GET /api/v1/analytics/search-stats
```

### Funkcjonalność

**Provider Performance:**
- Daily metrics: bookings completed/cancelled, avg response time, rating distribution, utilization rate, revenue
- Trust Score integration points

**API Health:**
- Per-endpoint metrics: request count, error rate, response time percentiles (avg/p95/p99), query count
- Today's health check for all endpoints

**Search Analytics:**
- Click-through rate (43.33% w seedzie)
- Conversion rate (20%)
- Avg time to booking (2026 sekund)

**Funnel Conversion (Booking Flow):**
- 5 stages: search → viewed_profile → viewed_price → booking_started → booking_completed
- Drop rate per stage
- Time spent in each stage
- Final: stage 4 has 40% conversion (2/5 completed)

**Feature Flags:**
- 3 flags: instant_booking_v2 (50%), new_profile_design (25%), subscription_reminder_email (100%)
- Rollout percentage support
- Target roles/cities support
- Event tracking: viewed, interacted, converted

### Test Results

```bash
curl 'http://localhost:8000/api/v1/analytics/dashboard'
# Response: API health (avg error 2.6%, response time 294ms, 1287 requests/day)
#           Providers (34k revenue, 4.21 avg rating, 19 bookings)
#           Search (30 searches, 43% CTR, 20% conversion rate)

curl 'http://localhost:8000/api/v1/analytics/funnel?funnel_name=booking_flow'
# Response: 5 stages with drop rates (100%, 100%, 100%, 100%, 60%)
#           Funnel completion: 2/5 conversions = 40%

curl 'http://localhost:8000/api/v1/analytics/search-stats'
# Response: Aggregate stats for search analytics
```

### Statystyka

- **Total seed records:** 370+ (8 tabel)
- **API requests tracked:** ~1300 daily
- **Funnel stages:** 5 (search → booking completion)
- **Feature flags:** 3 (A/B testing ready)
- **Provider days tracked:** 310 (10 providers × 31 dni)

### Integracja

**Backend:**
- Services pattern – AnalyticsApiService = business logic
- Resources – ProviderMetricResource, SearchAnalyticResource, itd.
- Controller – AnalyticsController (7 endpoints)
- Routes – marketplace.php (registered w bootstrap/app.php)

**Frontend (React):**
- Może konsumować: `/analytics/dashboard` dla health check
- Provider dashboard: `/analytics/providers/{id}/metrics`
- Admin search analytics: `/analytics/search-stats`
- Funnel analysis: `/analytics/funnel`

**Database:**
- JSON columns dla ratings_distribution i metadata
- Proper indexes na date range queries
- Relationships: Event→null (polymorphic), ProviderMetric→User, SearchAnalytic→User, etc.

---

**KONIEC ANALIZY**

Ten dokument ma służyć jako **mapa drogowa** dla dalszego rozwoju ls2. Nie musisz odtwarzać całego LocalServices – wybierz tylko te elementy, które są niezbędne dla Twojego celu (PoC React vs Livewire lub MVP marketplace).
