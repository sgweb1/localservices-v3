# Provider Dashboard - Quick Start

## 🚀 Uruchomienie

### 1. Zainstaluj zależności
```bash
cd ls2
npm install
```

### 2. Uruchom dev server (React + Vite)
```bash
npm run dev
```

### 3. Uruchom backend (Laravel API)
W osobnym terminalu:
```bash
cd ls2
php artisan serve
```

### 4. Otwórz przeglądarkę
```
http://localhost:5173/provider/dashboard
```

---

## 🔑 Auth (DEV Mode)

W trybie development automatycznie logujesz się jako provider:
- **Name**: Jan Kowalski
- **Email**: jan@example.com
- **Role**: provider

Navbar automatycznie wyświetli przycisk **Dashboard** dla providerów.

---

## 🎨 Design System

Dashboard używa custom Tailwind utilities:
- `.glass-card` - frosted glass effect
- `.text-gradient` - gradient text (primary → accent)
- `.icon-gradient-1/2/3` - gradient backgrounds dla ikon
- `.badge-gradient` - gradient badges
- `.btn-gradient` - gradient buttons

---

## 📊 Widgets

Dashboard zawiera 10 widgetów:
1. **Plan Card** - aktywny plan + limity
2. **Addons Carousel** - dodatki PRO
3. **Pipeline Board** - zapytania + rezerwacje
4. **Insights Card** - Trust Score + analytics
5. **Tasks Card** - onboarding progress
6. **Performance Snapshot** - 4 kluczowe metryki
7. **Calendar Glance** - 3-day preview
8. **Message Center** - ostatnie zapytania
9. **Notifications Card** - powiadomienia systemowe
10. **Services Card** - top usługi

---

## 🛠️ DevTools

W lewym dolnym rogu znajdziesz **DEV** button (tylko local env).

3 zakładki:
- **Context** - user info, plan, feature flags, cache status
- **Subscriptions** - generator planów (Basic/Pro/Premium) + addons
- **Notifications** - generator testowych powiadomień

---

## 🔄 Cache Strategy

Dashboard używa React Query z konfiguracją identyczną jak LocalServices:
- **staleTime**: 60s (cache TTL)
- **refetchInterval**: 5min (background refresh)
- **refetchOnWindowFocus**: true
- **refetchOnMount**: false (use cache)

Manual refresh: `useDashboardRefresh()` hook

---

## 📁 Struktura

```
src/
├── contexts/
│   └── AuthContext.tsx (mock auth, TODO: Sanctum integration)
├── features/provider/dashboard/
│   ├── types.ts (10 widget interfaces)
│   ├── hooks/useDashboardWidgets.ts (React Query)
│   └── components/
│       ├── DashboardPage.tsx (główny komponent)
│       ├── DashboardHero.tsx (hero section)
│       ├── DashboardGrid.tsx (CSS Grid layout)
│       ├── DevToolsPopup.tsx (local only)
│       └── widgets/ (10 komponentów)
└── main.tsx (routing: /provider/dashboard)
```

---

## ⚠️ TODO (Backend)

Dashboard obecnie NIE komunikuje się z API - wymaga:
1. Uruchomienie Laravel API na `http://localhost:8000`
2. Sanctum CSRF cookie setup
3. Seeding danych testowych

Aktualnie wszystkie widgety wyświetlają mock data z TypeScript.

---

## 🐛 Troubleshooting

### Dashboard nie ładuje się
- Sprawdź czy Vite dev server działa (port 5173)
- Sprawdź console - czy są błędy TypeScript

### Brak przycisku Dashboard w navbar
- Sprawdź `AuthContext` - `user.role` musi być `'provider'`
- W dev mode auto-login jest włączony

### Icons się nie renderują
- Sprawdź czy `lucide-react` jest zainstalowany: `npm list lucide-react`
- Powinno zwrócić: `lucide-react@0.562.0`

---

## 📖 Pełna dokumentacja

Zobacz [notes/provider-dashboard-implementation.md](../notes/provider-dashboard-implementation.md)
