# Provider Dashboard - Dokumentacja Implementacji

## 📋 Podsumowanie

Kompletna implementacja **Provider Dashboard** w LS2 (React SPA) replikująca funkcjonalność z LocalServices (Livewire).

**Status**: ✅ **COMPLETE** (19.12.2025)

---

## 🏗️ Architektura

### Backend (Laravel 12)
```
app/
├── Services/Api/
│   └── ProviderDashboardApiService.php (10 metod prepare*)
├── Http/Controllers/Api/V1/
│   └── ProviderDashboardController.php (widgets endpoint)
└── routes/api/v1/
    └── provider.php (GET /api/v1/provider/dashboard/widgets)
```

**Service Methods:**
1. `getDashboardWidgets()` - orchestrator zwracający wszystkie 10 widgetów
2. `preparePlanCard()` - plan + limity (ogłoszenia, kategorie)
3. `prepareAddonsCarousel()` - dodatki PRO (Instant Booking, Analityka)
4. `preparePipelineBoard()` - zapytania + rezerwacje + konwersja
5. `prepareInsightsCard()` - Trust Score + CTR + completed + traffic sources
6. `prepareTasksCard()` - onboarding + growth tasks z progresem
7. `preparePerformanceSnapshot()` - views, favorited, response time, rating
8. `prepareCalendarGlance()` - 3 dni kalendarz (rano/popołudnie)
9. `prepareMessageCenter()` - ostatnie 4 zapytania ofertowe
10. `prepareNotificationsCard()` - ostatnie 5 powiadomień
11. `prepareServicesCard()` - top 6 usług wg views

**Authentication**: Sanctum cookie-based, middleware `auth:sanctum`, provider-only gate.

---

### Frontend (React + TypeScript)

```
src/features/provider/dashboard/
├── types.ts (10 widget interfaces + DashboardWidgets)
├── api/v1/provider-dashboard.ts (HTTP client)
├── hooks/useDashboardWidgets.ts (React Query, 60s cache)
└── components/
    ├── DashboardPage.tsx (kompozycja + loading/error states)
    ├── DashboardHero.tsx (hero section + Trust Score badge)
    ├── DashboardGrid.tsx (CSS Grid 3 kolumny)
    ├── DevToolsPopup.tsx (local only, 3 tabs)
    └── widgets/
        ├── PlanCard.tsx
        ├── AddonsCarousel.tsx
        ├── PipelineBoard.tsx
        ├── InsightsCard.tsx
        ├── TasksCard.tsx
        ├── PerformanceSnapshot.tsx
        ├── CalendarGlance.tsx
        ├── MessageCenter.tsx
        ├── NotificationsCard.tsx
        └── ServicesCard.tsx
```

---

## 🎨 Design System

### Tailwind Config
```javascript
// tailwind.config.js - dodane klasy:
- colors.glass: { light, DEFAULT, dark, nav, border }
- gradients: hero, sunrise, card-glow
- rounded-3xl (48px)
- animations: blob, fade-in
- custom utilities plugin: .glass-card, .text-gradient, .icon-gradient-1/2/3, .badge-gradient, .btn-gradient
```

### Shared UI Components
```
src/components/ui/
├── GlassCard.tsx (base widget container, hover variant)
├── HeroGradient.tsx (hero sections wrapper)
├── TextGradient.tsx (gradient text, strong variant)
├── BadgeGradient.tsx (status badges)
├── ProgressBar.tsx (limits, color-coded: success/warning/error)
└── IconGradient.tsx (3 variants matching LocalServices)
```

### Icons
**Biblioteka**: `lucide-react` (v0.562.0)

**Używane ikony**:
- `RectangleStackIcon` - limity
- `AlertTriangle` - ostrzeżenia
- `ChevronRight` - nawigacja
- `Zap` - Instant Booking
- `BarChart3` - Analityka PRO
- `TrendingUp/Down` - Trust Score delta
- `Eye, Heart, Clock, Star` - performance metrics
- `Sun, Moon` - calendar slots
- `Inbox, Bell, Calendar, CheckCircle` - notyfikacje
- `Briefcase` - usługi
- `Loader2` - loading state

---

## 📊 Widgets - Szczegóły Implementacji

### 1. Plan Card
**Dane**: `plan_name`, `plan_slug`, `expires_at`, `items[]` (limity)
**UI**: Badge z nazwą planu, każdy limit z ProgressBar, exceeded alert
**Gating**: Brak (dostępny dla wszystkich)
**CTA**: `/provider/subscription/plans`

### 2. Addons Carousel
**Dane**: `AddonCard[]` (Instant Booking, Analityka PRO)
**UI**: Grid 2 kolumny, IconGradient (Zap/BarChart3), badge status
**Gating**: `available` flag + `required_plan`
**CTA**: `/provider/addons` (activate) lub details link

### 3. Pipeline Board
**Dane**: `requests` (incoming/quoted/converted + conversion_rate), `bookings` (pending/confirmed/completed)
**UI**: 2 sekcje (zapytania + rezerwacje), TextGradient na liczby
**Gating**: `can_view_details` (wymaga instant_booking + messaging)
**Visual**: Backdrop-blur + upgrade CTA gdy gating active

### 4. Insights Card
**Dane**: `trust_score`, `trust_delta`, `click_rate`, `completed`, `traffic_sources[]`
**UI**: Trust Score hero (5xl font), CTR card, traffic bars z procentami
**Ikony**: TrendingUp/Down dla delta
**Gating**: Brak

### 5. Tasks Card
**Dane**: `items[]` (TaskItem), `progress` (0-100%)
**UI**: Progress bar + lista zadań (5 widocznych), checkboxes (CheckCircle2/Circle)
**Interakcja**: Link do zadania (`task.route`), reward badge
**CTA**: "Uzupełnij profil" gdy progress < 100%

### 6. Performance Snapshot
**Dane**: `views`, `favorited`, `avg_response_time`, `rating`
**UI**: Grid 2x2, każda metryka z IconGradient (Eye/Heart/Clock/Star)
**Gating**: Brak

### 7. Calendar Glance
**Dane**: `days[]` (3 dni), każdy dzień z `slots[]` (morning/afternoon)
**UI**: 2 sloty na dzień, Sun/Moon ikony, color-coded availability
**Gating**: `is_blurred` (wymaga instant_booking) - backdrop-blur + upgrade CTA
**CTA**: `/provider/calendar`

### 8. Message Center
**Dane**: `items[]` (MessageRequest), `unread_count`
**UI**: Lista 4 zapytań, avatar z inicjałem, deadline z urgency color
**Urgency logic**: ≤6h = urgent (red), ≤12h = soon (orange), >12h = normal
**Empty state**: Inbox icon + "Brak nowych wiadomości"
**CTA**: `/provider/requests/{id}`, "Zobacz wszystkie"

### 9. Notifications Card
**Dane**: `items[]` (Notification), `unread_count`
**UI**: Lista 5 powiadomień, ikony wg typu (Calendar/Star/CheckCircle/Bell)
**Types**: booking_created, new_review, verification_reminder
**Badge**: Unread count, czerwona kropka na nieprzeczytanych
**CTA**: "Oznacz jako przeczytane", "Zobacz wszystkie"

### 10. Services Card
**Dane**: `items[]` (ServiceItem - top 6 wg views)
**UI**: Lista usług z obrazkiem (lub Briefcase placeholder), badge aktywności
**Metrics**: Eye icon + views_count
**Empty state**: "Nie masz jeszcze żadnych usług" + CTA
**CTA**: `/provider/services/{id}`, "Dodaj nową usługę"

---

## 🔄 Cache Strategy

**React Query Config** (`useDashboardWidgets`):
```typescript
staleTime: 60 * 1000 (60s - identycznie jak LocalServices)
refetchInterval: 5 * 60 * 1000 (5min background refresh)
refetchOnWindowFocus: true
refetchOnMount: false (use cache)
retry: 2
```

**Manual Refresh**: `useDashboardRefresh()` hook dla invalidacji po mutacjach.

---

## 🛡️ Gating Logic

### Pipeline Board - Details Blur
**Warunek**: `!can_view_details` (backend sprawdza `hasFeature('instant_booking') && hasFeature('messaging')`)
**Visual**: `backdrop-blur-sm bg-white/30` + upgrade CTA
**Dostępne dane**: Tylko aggregate counts (incoming/quoted/converted)

### Calendar Glance - Full Blur
**Warunek**: `is_blurred` (backend sprawdza `!hasFeature('instant_booking')`)
**Visual**: Backdrop-blur całego widgetu + TrendingUp icon + CTA
**Dostępne dane**: None (widget całkowicie zamaskowany)

### Addons Carousel - Badge Gating
**Warunek**: `!addon.available`
**Visual**: Badge "Od {required_plan}" zamiast "Aktywne"
**CTA**: "Aktywuj" zamiast "Zobacz więcej"

---

## 🎯 Layout & Responsiveness

**CSS Grid** (DashboardGrid):
```css
grid-cols-1 (mobile)
lg:grid-cols-2 (tablet)
xl:grid-cols-3 (desktop)
```

**Widget Spanning**:
- Row 1: PlanCard (1 col) + AddonsCarousel (2 cols)
- Row 2: Pipeline (1) + Insights (1) + Tasks (1)
- Row 3: Performance (1) + Calendar (1) + Messages (1)
- Row 4: Notifications (1) + Services (2 cols)

**Max Width**: `max-w-[1600px]` container

---

## 🧪 DevTools Popup

**Lokalizacja**: `src/features/provider/dashboard/components/DevToolsPopup.tsx`
**Widoczność**: Tylko `import.meta.env.MODE === 'development'`
**Pozycja**: Fixed bottom-right, floating button z "DEV" badge
**Gradient**: Purple-pink (`from-purple-600 to-pink-600`)

**3 Zakładki**:
1. **Context**: User ID, plan, feature flags, cache status
2. **Subscriptions**: Generator planów (Basic/Pro/Premium) + addons checkboxes
3. **Notifications**: Generator testowych powiadomień (4 typy)

---

## 🚀 Routing Setup

**Dodaj do React Router**:
```tsx
import { DashboardPage } from '@/features/provider/dashboard/components';

<Route path="/provider/dashboard" element={<DashboardPage />} />
```

**URL**: `/provider/dashboard`
**Auth**: Wymaga authenticated user + provider role
**Layout**: Standalone (own hero + grid)

---

## ✅ Checklist Implementacji

- [x] Backend ProviderDashboardApiService (10 metod)
- [x] Backend Controller + routes (Sanctum auth)
- [x] Design System: Tailwind config (colors, gradients, utilities)
- [x] Shared UI Components (6 komponentów)
- [x] TypeScript types (10 widget interfaces)
- [x] API Client (Sanctum cookies)
- [x] React Query hook (60s cache)
- [x] 10 React widget components (z lucide-react icons)
- [x] Layout components (Hero, Grid, Page)
- [x] Loading/Error states
- [x] DevToolsPopup (local only)
- [x] Dokumentacja

---

## 📝 Brakujące Elementy (TODO)

1. **Backend testy**: Unit testy dla ProviderDashboardApiService
2. **Frontend testy**: React Testing Library dla widgetów
3. **Auth context**: Zastąpić hardcoded `userName='Użytkowniku'` w DashboardPage
4. **Routing**: Dodać ścieżkę do głównego routera
5. **Translations**: i18n dla tekstów (jeśli planowane)
6. **E2E testy**: Playwright dla complete user flow
7. **DevTools actions**: Podłączyć API do generatorów (plany/notyfikacje)

---

## 🔗 Powiązane Pliki

**Backend**:
- [app/Services/Api/ProviderDashboardApiService.php](../../../../../../localservices/app/Services/Api/ProviderDashboardApiService.php)
- [app/Http/Controllers/Api/V1/ProviderDashboardController.php](../../../../../../localservices/app/Http/Controllers/Api/V1/ProviderDashboardController.php)
- [routes/api/v1/provider.php](../../../../../../localservices/routes/api/v1/provider.php)

**Frontend**:
- [src/features/provider/dashboard/types.ts](../types.ts)
- [src/api/v1/provider-dashboard.ts](../../../api/v1/provider-dashboard.ts)
- [src/features/provider/dashboard/hooks/useDashboardWidgets.ts](../hooks/useDashboardWidgets.ts)
- [src/features/provider/dashboard/components/DashboardPage.tsx](../components/DashboardPage.tsx)

**Design System**:
- [tailwind.config.js](../../../../../tailwind.config.js)
- [src/components/ui/](../../../components/ui/)

**Dokumentacja**:
- [notes/provider-dashboard-widgets-breakdown.md](../../../../../notes/provider-dashboard-widgets-breakdown.md)
- [project-control/issues/issue-F-provider-dashboard-roadmap.md](../../../../../../localservices/project-control/issues/issue-F-provider-dashboard-roadmap.md)

---

**Autor**: AI Assistant + Szymo  
**Data**: 19.12.2025  
**Wersja**: 1.0.0  
**LS2 Branch**: feature/provider-dashboard
