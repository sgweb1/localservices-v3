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

---

## ✅ Sesja 10 - Provider Dashboard (identyczny wygląd + działanie jak LocalServices) - **COMPLETE**

### Cel
Dashboard providera w LS2 musi działać i wyglądać **identycznie** jak w LocalServices (DashboardNew).

### Implementacja
- ✅ Backend: `ProviderDashboardApiService` z 10 metodami prepare* (plan, addons, pipeline, insights, tasks, performance, calendar, messages, notifications, services)
- ✅ Backend: `ProviderDashboardController` z endpoint `GET /api/v1/provider/dashboard/widgets`
- ✅ Design System: Tailwind config z custom colors (glass), gradients (hero, sunrise), utilities (.glass-card, .text-gradient, .icon-gradient-1/2/3, .badge-gradient)
- ✅ Shared UI: 6 komponentów (GlassCard, HeroGradient, TextGradient, BadgeGradient, ProgressBar, IconGradient)
- ✅ TypeScript: 10 widget interfaces + DashboardWidgets aggregate
- ✅ API Client: `ProviderDashboardClient` z Sanctum auth
- ✅ React Query: `useDashboardWidgets` hook (60s cache, 5min refetch identycznie jak LocalServices)
- ✅ Widgets: 10 komponentów React (PlanCard, AddonsCarousel, PipelineBoard, InsightsCard, TasksCard, PerformanceSnapshot, CalendarGlance, MessageCenter, NotificationsCard, ServicesCard)
- ✅ Layout: DashboardHero + DashboardGrid (CSS Grid 3col) + DashboardPage
- ✅ Icons: lucide-react (40+ ikon użytych)
- ✅ DevTools: DevToolsPopup (local only, 3 tabs: Context/Subscriptions/Notifications)
- ✅ Gating: PipelineBoard (can_view_details), CalendarGlance (is_blurred), Addons (available flag)
- ✅ Dokumentacja: `notes/provider-dashboard-implementation.md` (kompletna specyfikacja)

### Status
**✅ COMPLETE** (19.12.2025) - Wszystkie 10 widgetów zaimplementowane, design system replikowany 1:1, dokumentacja kompletna.

### Struktura komponentów (SEPARACJA WIDGETÓW)
```
src/features/provider/dashboard/
├── hooks/
│   ├── useDashboardWidgets.ts      # fetch all widgets, cache 60s
│   ├── useDashboardCache.ts        # cache mechanism jak LocalServices
│   └── useDashboardListeners.ts    # real-time listeners (opcjonalne)
├── components/
│   ├── widgets/                     # 🔥 OSOBNY KATALOG (10 widgetów)
│   │   ├── PlanCard.tsx            # activePlan + limits + progress
│   │   ├── AddonsCarousel.tsx      # Instant Booking, Analytics PRO
│   │   ├── PipelineBoard.tsx       # leads + bookings kanban
│   │   ├── InsightsCard.tsx        # Trust Score + CTR + traffic
│   │   ├── TasksCard.tsx           # onboarding + growth tasks
│   │   ├── PerformanceSnapshot.tsx # 4 metryki
│   │   ├── CalendarGlance.tsx      # 3 dni, 2 sloty/dzień
│   │   ├── MessageCenter.tsx       # last 4 conversations
│   │   ├── NotificationsCard.tsx   # last notifications
│   │   └── ServicesCard.tsx        # top 6 services by views
│   ├── DashboardGrid.tsx           # CSS Grid layout
│   ├── DashboardHero.tsx           # hero-gradient section
│   └── DevToolsPopup.tsx           # DEV tools (local only)
├── types.ts                         # TypeScript interfaces
└── DashboardPage.tsx               # composition
```

### Shared UI Components (reusable)
```
src/components/ui/
├── GlassCard.tsx          # glass-card z backdrop-blur
├── HeroGradient.tsx       # hero-gradient wrapper
├── IconGradient.tsx       # icon-gradient-1/2/3
├── TextGradient.tsx       # text-gradient
├── BadgeGradient.tsx      # badge-gradient
└── ProgressBar.tsx        # progress bars dla limitów
```

### Design System (MUSI BYĆ identyczny)
- Tailwind config: skopiować palety, fonts (Archivo), border-radius z LocalServices
- Custom CSS: `.glass-card`, `.hero-gradient`, `.icon-gradient-*`, `.text-gradient`, `.badge-gradient`
- Kolory: primary #06B6D4 (teal/cyan), rounded-2xl/3xl, backdrop-blur

### Backend (logika 1:1 z LocalServices)
```php
app/Services/Api/ProviderDashboardApiService.php
- getDashboardWidgets(User $provider): array
  - preparePlanCard()           # jak DashboardNew
  - prepareAddonsCarousel()     # jak DashboardNew
  - preparePipelineBoard()      # jak DashboardNew
  - prepareInsightsCard()       # jak DashboardNew (ProviderTrafficService)
  - prepareTasksCard()          # jak DashboardNew (onboarding_steps)
  - preparePerformanceSnapshot() # jak DashboardNew
  - prepareCalendarGlance()     # jak DashboardNew
  - prepareMessageCenter()      # jak DashboardNew
  - prepareNotificationsCard()  # jak DashboardNew
  - prepareServicesCard()       # jak DashboardNew (top 6 by views_count)

app/Http/Controllers/Api/V1/ProviderDashboardController.php
- GET /api/v1/provider/dashboard/widgets
```

### Cache (60s jak LocalServices)
- React Query z `staleTime: 60000` (60s)
- Klucz cache: `dashboard_widgets_${userId}`
- Invalidate przy: booking.created, subscription-updated, message.received

### Gating (feature flags per plan)
- hasFeature('instant_booking'), hasFeature('messaging'), hasFeature('analytics')
- Blur data w pipeline/calendar/messages jeśli brak uprawnień
- CTA do upgrade planu

### DEV Tools Popup (tylko APP_ENV=local)
- Livewire `dev.subscription-switcher` → React `DevToolsPopup.tsx`
- 3 zakładki: Context (generatory), Subskrypcje (przełączniki), Powiadomienia (symulacje)
- Historia akcji (session storage)
- Pozycja: fixed bottom-4 right-4, z-index 9999

### Status
- **🎯 PLANOWANE** - Dashboard providera z identycznym wyglądem i działaniem jak LocalServices

