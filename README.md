# LocalServices v3 - Profile Edit Feature

> **Parallel React+Laravel Project** - Nowy frontend w React działający równolegle do istniejącego systemu Livewire.

🚀 **Status**: ✅ Implementacja zakończona - gotowe do staging deployment

---

## 📋 Spis Treści

- [O Projekcie](#o-projekcie)
- [Architektura](#architektura)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## O Projekcie

LocalServices v3 to **pierwsza funkcjonalność** (Profile Edit) zbudowana w nowej architekturze:
- **Backend**: Laravel 12 + Serwisy single-action + Events
- **Frontend**: React 18 + TypeScript + TanStack Query
- **API**: RESTful v1 (z przygotowaniem na v2)

### Feature: Profile Edit

Kompletny system edycji profilu użytkownika:
- ✅ Aktualizacja danych osobowych (name, email, bio, lokalizacja)
- ✅ Upload avatara (customer 2MB) i logo (provider 5MB)
- ✅ Zmiana hasła z weryfikacją
- ✅ Profile Completeness Score (0-100%)
- ✅ Provider Trust Score auto-calculation
- ✅ Audit log wszystkich zmian

---

## Architektura

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│             │         │              │         │              │
│  React App  │────────▶│  Laravel API │────────▶│   Services   │
│  (TypeScript│         │   (v1 REST)  │         │  (Business   │
│   + Zod)    │◀────────│              │◀────────│   Logic)     │
│             │  JSON   │              │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Events +   │
                        │   Listeners  │
                        │ (Async Queue)│
                        └──────────────┘
```

### Backend Patterns

- **Service Layer**: Cała logika w serwisach (1 akcja = 1 serwis)
- **Events**: Asynchroniczne przetwarzanie (audit log, cache, notifications)
- **Transactions**: Wielotabelowe operacje w DB transaction
- **Sharding**: Storage plików w 100 katalogach (user_id % 100)

### Frontend Patterns

- **Type Safety**: TypeScript types mirror backend models
- **Optimistic Updates**: TanStack Query z instant UI feedback
- **Validation**: Zod (client) + Laravel (server) double validation
- **Error Handling**: Typed ApiError z display per field

---

## Quick Start

### Wymagania

- **Backend**: PHP 8.3+, Composer, MySQL 8.0+
- **Frontend**: Node.js 18+, npm/yarn
- **Queue**: Redis (opcjonalne, dla events)

### 1. Clone Repository

```bash
git clone https://github.com/sgweb1/localservices-v3.git
cd localservices-v3
```

### 2. Backend Setup

```bash
# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Configure database w .env
# DB_CONNECTION=mysql
# DB_DATABASE=localservices_v3
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations + seeders
php artisan migrate:fresh --seed

# Create storage symlink
php artisan storage:link

# Start queue worker (dla events)
php artisan queue:work

# Start server
php artisan serve
# API dostępne na http://localhost:8000/api/v1
```

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Frontend dostępny na http://localhost:5173
```

### 4. Test API

```bash
# Run all tests
php artisan test

# With coverage
php artisan test --coverage

# Feature tests only
php artisan test --testsuite=Feature
```

---

## API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

Wszystkie endpointy wymagają Bearer token:

```http
Authorization: Bearer {token}
```

### Endpoints

#### 1. Update Profile

```http
PATCH /profile
Content-Type: application/json

Request:
{
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "bio": "Minimum 50 znaków dla providerów",
  "city": "Warszawa",
  "business_name": "Moja Firma" // tylko provider
}

Response 200:
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Jan Kowalski",
    "user_type": "provider",
    "avatar_url": "https://...",
    "profile": {
      "bio": "...",
      "profile_completion_percentage": 85
    },
    "provider_profile": {
      "business_name": "Moja Firma",
      "trust_score": 75
    }
  }
}
```

#### 2. Upload Avatar

```http
POST /profile/avatar
Content-Type: multipart/form-data
Rate Limit: 10/minute

Request:
{
  "avatar": [File] // Max 2MB, jpeg/png/webp
}

Response 200:
{
  "message": "Avatar uploaded successfully",
  "user": { ... }
}
```

#### 3. Upload Provider Logo

```http
POST /provider/logo
Content-Type: multipart/form-data
Rate Limit: 10/minute

Request:
{
  "logo": [File] // Max 5MB, jpeg/png/webp
}

Response 200:
{
  "message": "Logo uploaded successfully",
  "user": { ... }
}
```

#### 4. Update Password

```http
PUT /profile/password
Content-Type: application/json

Request:
{
  "current_password": "oldpassword",
  "new_password": "newpassword123",
  "new_password_confirmation": "newpassword123"
}

Response 200:
{
  "message": "Password updated successfully"
}
```

### Error Codes

- `401` - Unauthorized (brak tokenu lub nieważny)
- `403` - Forbidden (próba edycji cudzego profilu)
- `422` - Validation Error (nieprawidłowe dane)
- `429` - Too Many Requests (rate limit)
- `500` - Server Error

Więcej: Zobacz [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

---

## Testing

### Backend Tests

```bash
# All tests
php artisan test

# Specific suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Specific test
php artisan test tests/Feature/Api/V1/Profile/ProfileUpdateTest.php

# With coverage
php artisan test --coverage
```

### Test Data

Seeders tworzą 10 przykładowych użytkowników:
- 5 customers (różne profile completeness: 0%, 25%, 50%, 75%, 100%)
- 5 providers (różne verification levels: 1-5, trust scores: 10-95)

Wszystkie hasła: `password`

---

## Deployment

### Staging

```bash
# Pull latest
git pull origin main

# Backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

# Queue
php artisan queue:restart
supervisorctl restart localservices-worker:*

# Frontend
npm install
npm run build
```

### Environment Variables

```env
# .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.localservices.pl

# Queue (events)
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1

# Storage
FILESYSTEM_DISK=s3 # opcjonalnie dla CDN
AWS_BUCKET=localservices-uploads

# Rate limiting
PROFILE_AVATAR_MAX_SIZE=2048
PROVIDER_LOGO_MAX_SIZE=5120
```

---

## Contributing

### Workflow

1. **Feature branch**: `git checkout -b feature/nazwa-funkcji`
2. **Implementacja**: Kod + testy
3. **Tests pass**: `php artisan test` must be green
4. **Pull Request**: Do `develop` branch
5. **Code Review**: Minimum 1 approval
6. **Merge**: Squash commits

### Code Standards

- **PHP**: PSR-12, Laravel conventions
- **TypeScript**: ESLint + Prettier
- **Commits**: Polish, format `type: Opis zmiany`
- **Tests**: Feature + Unit coverage 90%+

### Zasady Projektowe

⚠️ **KRYTYCZNE**: Przestrzegaj [parallel_react_project.md](parallel_react_project.md)

- ❌ **NIE kopiuj** kodu ze starego systemu (localservices)
- ✅ Analizuj stary system **tylko dla reguł biznesowych**
- ✅ Logika **tylko w serwisach** (zero w kontrolerach/UI)
- ✅ API jako **transport** (zero logiki)
- ✅ React **tylko UI** (zero business logic)

---

## Struktura Projektu

```
/
├── app/
│   ├── Models/                 # Eloquent models
│   ├── Services/               # Business logic (single-action)
│   │   ├── Profile/
│   │   └── TrustScore/
│   ├── Http/Controllers/Api/V1/ # API controllers (transport only)
│   ├── Events/                 # Queued events
│   ├── Listeners/              # Event handlers
│   ├── Exceptions/             # Custom exceptions
│   └── Helpers/                # Utilities (StorageHelper)
│
├── database/
│   ├── migrations/             # Schema migrations
│   ├── factories/              # Model factories
│   └── seeders/                # Data seeders
│
├── routes/
│   └── api/v1/                 # API routes v1
│       └── profile.php
│
├── tests/
│   ├── Feature/                # Integration tests
│   └── Unit/                   # Unit tests
│
├── src/                        # React frontend
│   ├── api/                    # API client
│   │   ├── client.ts
│   │   └── v1/profileApi.ts
│   ├── types/                  # TypeScript types
│   ├── features/profile/       # Profile feature
│   │   ├── hooks/
│   │   └── components/
│   └── ...
│
├── IMPLEMENTATION_COMPLETE.md  # Pełna dokumentacja
├── parallel_react_project.md   # Zasady projektowe
└── api_contracts_and_14_day_plan.md
```

---

## 🔔 Notification System

### Architektura Powiadomień

```
Event (booking.created) 
  ↓
Observer (BookingObserver)
  ↓
NotificationDispatcher
  ├── Rate Limit Check (per event + global)
  ├── Deduplication Check (5 min window)
  ├── Quiet Hours Check (22:00-08:00)
  ↓
ChannelDispatcher
  ├── Email (GenericNotificationMail)
  ├── Toast (Echo/Reverb event)
  ├── Push (Web Push via minishlink/web-push)
  └── Database (NotificationLog)
  ↓
NotificationLog (complete audit trail + read status)
```

### Channels

| Channel  | Always Sent | Quiet Hours | Rate Limited |
|----------|------------|------------|-------------|
| Email    | ✅         | ✅         | ✅          |
| Toast    | ✅         | ❌         | ✅          |
| Push     | ✅         | ❌         | ✅          |
| Database | ✅         | ✅         | ✅          |

### Events

- `booking.created` - nowa rezerwacja
- `booking.accepted` - rezerwacja potwierdzona
- `booking.cancelled` - rezerwacja anulowana
- `booking.completed` - rezerwacja ukończona
- `review.received` - nowa opinia
- `message.received` - nowa wiadomość

### API Endpoints

```http
GET  /api/v1/notifications                  # List with pagination
GET  /api/v1/notifications/unread-count     # Unread counter
GET  /api/v1/notifications/{id}             # Show & auto-mark read
PUT  /api/v1/notifications/{id}/read        # Mark single as read
PUT  /api/v1/notifications/read-all         # Mark all as read
```

### Maintenance Commands

```bash
# Clean inactive push subscriptions (older than 30 days)
php artisan notifications:clean-subscriptions --days=30

# Retry failed notifications (for monitoring)
php artisan notifications:retry-failed --hours=24 --limit=100

# Prune old logs (keep 90 days by default)
php artisan notifications:prune-logs --days=90
```

### Scheduled Tasks

All maintenance scheduled in `routes/console.php`:
- **Weekly**: Clean push subscriptions & prune logs
- **Daily (3:00 AM)**: Retry failed notifications

---

## License

Proprietary - LocalServices © 2024

---

## Support

- **Issues**: GitHub Issues
- **Docs**: [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)
- **API**: Swagger (TODO)

---

**Built with ❤️ using Laravel 12 + React 18 + TypeScript**
