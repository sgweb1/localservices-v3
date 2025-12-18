# Plan przebudowy bazy danych - 1:1 z LocalServices

**Data:** 2025-12-18  
**Problem:** Brakuje systemu ról (Spatie Permission), niepełna struktura users table  
**Rozwiązanie:** Pełne odtworzenie struktury LocalServices z 60+ tabelami

---

## ANALIZA PROBLEMU

### Co mamy teraz w ls2:
```php
// users table
- user_type enum('customer', 'provider') ❌ Niedostateczne!
- Brak systemu ról
- Brak is_admin flag
- Brak wielu kolumn z LocalServices
```

### Co jest w LocalServices:
```php
// users table
- user_type enum (ale usunięty w późniejszej migracji!)
- is_admin boolean
- Spatie Permission: roles (customer, provider, admin, super_admin, ops_manager, finance, support)
- UUID
- 30+ kolumn (avatar, bio, city, phone, rating_average, profile_completion, last_login_at, last_seen_at, etc.)

// System ról (Spatie Permission)
Role::create(['name' => 'customer']);
Role::create(['name' => 'provider']);
Role::create(['name' => 'admin']);
Role::create(['name' => 'super_admin']);
Role::create(['name' => 'ops_manager']);
Role::create(['name' => 'finance']);
Role::create(['name' => 'support']);

// Użytkownik może mieć WIELE ról jednocześnie:
$user->assignRole(['customer', 'provider']); // Provider może też rezerwować!
```

### Sprawdzanie uprawnień w LocalServices:
```php
// W modelu User
public function isProvider(): bool
{
    return $this->user_type === self::TYPE_PROVIDER || $this->hasRole('provider');
}

public function isCustomer(): bool
{
    return $this->user_type === self::TYPE_CUSTOMER || $this->hasRole('customer');
}

public function isAdmin(): bool
{
    if ($this->is_admin) return true;
    return $this->hasAnyRole(['super_admin', 'admin', 'ops_manager', 'finance', 'support']);
}

public function canAccessPanel(Panel $panel): bool
{
    if ($panel->getId() === 'admin') {
        return $this->is_admin === true || $this->hasAnyRole([...]);
    }
}
```

---

## PLAN PRZEBUDOWY

### FAZA 1: Spatie Permission (system ról)

#### 1.1 Instalacja pakietu
```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

#### 1.2 Migracje Permission (5 tabel)
- `permissions` - uprawnienia (view bookings, create services, etc.)
- `roles` - role (customer, provider, admin, super_admin, ops_manager, finance, support)
- `model_has_permissions` - pivot: user ↔ permissions
- `model_has_roles` - pivot: user ↔ roles
- `role_has_permissions` - pivot: role ↔ permissions

#### 1.3 Model User - dodanie HasRoles trait
```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;
}
```

---

### FAZA 2: Rozbudowa users table

#### 2.1 Kolumny do dodania (zgodnie z LocalServices)
```php
// Tabela users - kompletna struktura
$table->uuid('uuid')->unique(); // ✅ już mamy
$table->boolean('is_admin')->default(false); // ❌ BRAK!
$table->string('first_name')->nullable(); // ❌ BRAK!
$table->string('last_name')->nullable(); // ❌ BRAK!
$table->decimal('rating_average', 3, 2)->default(0); // ❌ BRAK!
$table->unsignedInteger('rating_count')->default(0); // ❌ BRAK!
$table->tinyInteger('profile_completion')->default(0); // ❌ BRAK!
$table->timestamp('last_login_at')->nullable(); // ❌ BRAK!
$table->timestamp('last_seen_at')->nullable(); // ❌ BRAK!
$table->foreignId('current_subscription_plan_id')->nullable()->constrained('subscription_plans'); // ❌ BRAK!
$table->timestamp('subscription_expires_at')->nullable(); // ❌ BRAK!
$table->boolean('analytics_interface_visible')->default(false); // ❌ BRAK!

// Notyfikacje
$table->boolean('email_notifications')->default(true); // ❌ BRAK!
$table->boolean('push_notifications')->default(true); // ❌ BRAK!
$table->boolean('sms_notifications')->default(false); // ❌ BRAK!

// Soft deletes
$table->softDeletes(); // ✅ już mamy
```

#### 2.2 Kolumny do rozważenia (opcjonalne, jeśli potrzebne)
- `shadow_banned` (boolean) - dla moderacji
- `shadow_ban_reason` (text)
- `banned_at` (timestamp)
- `ban_reason` (text)

---

### FAZA 3: Pełna struktura marketplace (60+ tabel)

Zgodnie z ANALIZA_LOCALSERVICES.md - wszystkie 60+ tabel:

#### Core Tables (już mamy częściowo)
- ✅ users
- ✅ user_profiles
- ✅ customer_profiles
- ✅ provider_profiles
- ✅ service_categories
- ✅ locations
- ✅ services (service_listings)

#### Booking System (❌ BRAK!)
- `booking_statuses` - statusy rezerwacji (pending, confirmed, started, completed, cancelled, rejected)
- `bookings` - rezerwacje (booking_number, start_time, end_time, total_price, payment_status)
- `booking_requests` - żądania rezerwacji
- `quote_requests` - zapytania o wycenę

#### Reviews System (❌ BRAK!)
- `reviews` - recenzje (5-gwiazdkowa + komentarz)
- `review_responses` - odpowiedzi providerów
- `review_milestones` - gamifikacja (10, 50, 100 reviews)
- `review_helpful_votes` - użytkownicy oceniają recenzje
- `review_reports` - zgłoszenia spamu

#### Chat System (❌ BRAK!)
- `conversations` - konwersacje (customer ↔ provider)
- `messages` - wiadomości
- `message_attachments` - załączniki

#### Availability System (❌ BRAK!)
- `availabilities` - sloty dostępności providera
- `service_areas` - obszary świadczenia usług

#### Verification System (❌ BRAK!)
- `verifications` - weryfikacje providerów (5 poziomów)
- `certifications` - certyfikaty
- `portfolio_items` - portfolio prac

#### Subscription & Payment (❌ BRAK!)
- `subscription_plans` - plany (Free/Pro/Premium)
- `subscriptions` - aktywne subskrypcje
- `payments` - płatności (PayU)
- `invoices` - faktury (Infakt)
- `payouts` - wypłaty dla providerów
- `coupons` - kupony rabatowe
- `coupon_uses` - użycie kuponów

#### Quiz System (❌ BRAK!)
- `quiz_questions` - pytania kwalifikacyjne
- `quiz_attempts` - próby rozwiązania
- `quiz_categories` - kategorie quizów

#### Scraper System (❌ BRAK!)
- `scraper_sources` - źródła (OLX/Marketplace)
- `scraper_runs` - przebiegi
- `scraped_providers` - wyniki scrapingu

#### Analytics & Tracking (❌ BRAK!)
- `provider_traffic_events` - tracking (views, clicks, leads)
- `admin_audit_logs` - logi audytowe admina
- `profile_audit_logs` - ✅ już mamy

#### Notifications (❌ BRAK!)
- `notification_logs` - logi powiadomień
- `notification_templates` - szablony
- `user_notification_preferences` - preferencje użytkownika
- `push_subscriptions` - Web Push

#### Misc (❌ BRAK!)
- `referrals` - system poleceń
- `bug_reports` - zgłoszenia błędów
- `contact_messages` - wiadomości kontaktowe
- `educational_articles` - artykuły edukacyjne
- `blog_posts` + `blog_categories` - blog
- `banners` - bannery promocyjne
- `feature_flags` - A/B testing
- `terms` - regulaminy z wersjami
- `user_onboarding_progress` - onboarding tracking
- `provider_wizard_drafts` - drafty onboardingu providera
- `favorite_providers` - ulubieni providerzy
- `provider_followers` - obserwowani providerzy
- `newsletter_subscriptions` - newsletter
- `partner_applications` - aplikacje partnerskie

#### Laravel Framework (❌ BRAK!)
- `personal_access_tokens` - Sanctum tokens
- `password_reset_tokens` - ✅ mamy?
- `sessions` - sesje użytkowników
- `cache` + `cache_locks` - cache
- `jobs` + `failed_jobs` + `job_batches` - kolejki

---

## SEKWENCJA IMPLEMENTACJI

### Priorytet 1 (MVP - Dzień 5-7)
1. **Spatie Permission** - system ról
2. **Rozbudowa users table** - is_admin, rating_average, profile_completion, last_seen_at
3. **RoleAndPermissionSeeder** - role i migracja użytkowników
4. **Booking System** - bookings, booking_requests (core marketplace)
5. **Reviews System** - reviews, review_responses (social proof)

### Priorytet 2 (Core Marketplace - Dzień 8-10)
6. **Chat System** - conversations, messages
7. **Availability System** - availabilities, service_areas
8. **Verification System** - verifications, certifications

### Priorytet 3 (Business Logic - Dzień 11-12)
9. **Subscription & Payment** - subscription_plans, subscriptions, payments
10. **Quiz System** - quiz_questions, quiz_attempts

### Priorytet 4 (Growth Features - Dzień 13-14)
11. **Analytics & Tracking** - provider_traffic_events, admin_audit_logs
12. **Notifications** - notification_logs, push_subscriptions
13. **Misc** - referrals, blog_posts, feature_flags

---

## SEEDERY (pełna struktura)

### 1. RoleAndPermissionSeeder (PIERWSZY!)
```php
Role::create(['name' => 'customer']);
Role::create(['name' => 'provider']);
Role::create(['name' => 'admin']);
Role::create(['name' => 'super_admin']);
Role::create(['name' => 'ops_manager']);
Role::create(['name' => 'finance']);
Role::create(['name' => 'support']);

// Migracja istniejących użytkowników
User::where('user_type', 'customer')->get()->each(fn($u) => $u->assignRole('customer'));
User::where('user_type', 'provider')->get()->each(fn($u) => $u->assignRole(['customer', 'provider']));
User::where('is_admin', true)->get()->each(fn($u) => $u->assignRole(['admin', 'super_admin']));
```

### 2. ServiceCategorySeeder ✅ GOTOWE
### 3. LocationSeeder ✅ GOTOWE
### 4. UserSeeder (ROZBUDOWA)
```php
// Admin
$admin = User::create([
    'name' => 'Admin',
    'email' => 'admin@localservices.test',
    'password' => bcrypt('password'),
    'is_admin' => true,
]);
$admin->assignRole(['admin', 'super_admin']);

// 10 Providerów (customer + provider roles)
// 5 Klientów (customer role)
```

### 5. ServiceSeeder ✅ GOTOWE (10 usług)
### 6. BookingSeeder (20-30 rezerwacji)
### 7. ReviewSeeder (50 recenzji)
### 8. ConversationSeeder (10 konwersacji)
### 9. SubscriptionPlanSeeder (Free/Pro/Premium)

---

## KOLEJNOŚĆ URUCHOMIENIA

```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    $this->call([
        RoleAndPermissionSeeder::class,         // 1. ROLE FIRST!
        ServiceCategorySeeder::class,
        LocationSeeder::class,
        UserSeeder::class,                      // 4. Users (przypisują role w seederze)
        ServiceSeeder::class,
        BookingSeeder::class,
        ReviewSeeder::class,
        ConversationSeeder::class,
        SubscriptionPlanSeeder::class,
    ]);
}
```

---

## SERVICES (logika biznesowa)

Po kompletnej bazie danych - implementacja:

1. **TrustScoreService** - kalkulacja Trust Score™
2. **BookingService** - logika rezerwacji
3. **ReviewGamificationService** - milestones
4. **NotificationService** - wysyłka powiadomień
5. **SubscriptionService** - zarządzanie subskrypcjami
6. **PaymentService** - PayU integration
7. **AnalyticsService** - tracking ruchu

---

## PODSUMOWANIE

### Co robimy:
1. ✅ **Instalacja Spatie Permission** (composer require)
2. ✅ **Migracje Permission** (5 tabel dla ról)
3. ✅ **Rozbudowa users table** (is_admin, rating_average, profile_completion, etc.)
4. ✅ **60+ tabel marketplace** (bookings, reviews, chat, payments, analytics)
5. ✅ **RoleAndPermissionSeeder** (role + migracja użytkowników)
6. ✅ **Rozbudowa UserSeeder** (admin + assignRole)
7. ✅ **Wszystkie seedery** z realistycznymi danymi

### Zasada fundamentalna:
**NIE IDZIEMY NA ŁATWIZNĘ - FULL FUNKCJONALNOŚĆ 1:1 LocalServices!**

### Czas realizacji:
- **Dzień 5-7**: Spatie + users + bookings + reviews
- **Dzień 8-10**: Chat + availability + verification
- **Dzień 11-12**: Subscriptions + payments + quiz
- **Dzień 13-14**: Analytics + notifications + misc

---

**Status:** Gotowe do implementacji  
**Next Step:** Instalacja Spatie Permission + migracje
