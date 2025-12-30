# 🏗️ Final Project Structure - MVP Core

**Target Structure** po cleanup (Phase 7 ready)

---

## 📁 Complete File Tree

```
ls2/
├── app/                          # ✅ KEEP ALL
│   ├── Services/
│   │   ├── BoostService.php
│   │   ├── SubscriptionService.php
│   │   └── ...
│   ├── Models/
│   ├── Http/Controllers/
│   ├── Events/
│   ├── Listeners/
│   └── ...
│
├── src/                          # React frontend
│   ├── features/
│   │   ├── customer/             # ✅ KEEP
│   │   │   └── ...
│   │   │
│   │   ├── auth/                 # ✅ KEEP
│   │   │   └── ...
│   │   │
│   │   ├── profile/              # ⚠️ KEEP (simplify)
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       └── (remove extras)
│   │   │
│   │   └── provider/             # ⭐ MAIN MODULE
│   │       ├── dashboard/        # ✅ CORE
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── components/
│   │       │   │   ├── DashboardHero.tsx
│   │       │   │   ├── PerformanceMetrics.tsx
│   │       │   │   ├── RecentBookings.tsx
│   │       │   │   ├── RecentMessages.tsx
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── ProviderLayout.tsx
│   │       │   │   └── (others removed)
│   │       │   ├── hooks/
│   │       │   │   ├── useDashboardWidgets.ts
│   │       │   │   ├── useRecentBookings.ts
│   │       │   │   ├── useRecentMessages.ts
│   │       │   │   └── (consolidated)
│   │       │   ├── types.ts
│   │       │   ├── mocks/
│   │       │   └── __tests__/
│   │       │
│   │       ├── monetization/     # ✅ COMPLETE
│   │       │   ├── components/
│   │       │   │   ├── BoostPurchase.tsx
│   │       │   │   ├── SubscriptionPurchase.tsx
│   │       │   │   ├── BoostList.tsx
│   │       │   │   └── SubscriptionList.tsx
│   │       │   ├── pages/
│   │       │   │   ├── CheckoutSuccess.tsx
│   │       │   │   └── CheckoutCancel.tsx
│   │       │   ├── hooks/
│   │       │   │   ├── useBoost.ts
│   │       │   │   └── useSubscription.ts
│   │       │   ├── utils/
│   │       │   │   ├── stripeClient.ts
│   │       │   │   └── paymentHandler.ts
│   │       │   ├── types/
│   │       │   │   ├── boost.ts
│   │       │   │   └── subscription.ts
│   │       │   ├── __tests__/
│   │       │   └── index.ts (exports)
│   │       │
│   │       ├── bookings/         # ✅ PAGES ONLY
│   │       │   ├── BookingsPage.tsx
│   │       │   ├── hooks/
│   │       │   └── __tests__/
│   │       │
│   │       ├── calendar/         # ⚠️ LITE (show only)
│   │       │   ├── CalendarPage.tsx
│   │       │   ├── hooks/
│   │       │   └── __tests__/
│   │       │
│   │       ├── messages/         # ✅ LITE
│   │       │   ├── MessagesPage.tsx
│   │       │   ├── hooks/
│   │       │   └── __tests__/
│   │       │
│   │       ├── settings/         # ✅ BASIC
│   │       │   ├── NotificationsTab.tsx
│   │       │   ├── __tests__/
│   │       │   └── hooks/
│   │       │
│   │       ├── pages/            # Quick redirects (remove)
│   │       │
│   │       └── components/       # Shared (keep only shared)
│   │           └── (consolidate)
│   │
│   ├── components/               # ✅ Shared UI
│   │   ├── ui/                   (radix/tailwind)
│   │   ├── common/               (reusable)
│   │   └── layouts/
│   │
│   ├── contexts/                 # ✅ KEEP
│   │   ├── AuthContext.tsx
│   │   └── ...
│   │
│   ├── hooks/                    # ✅ Shared hooks
│   │   ├── useAuth.ts
│   │   ├── useApiCall.ts
│   │   └── ...
│   │
│   ├── utils/                    # ✅ Utilities
│   │   ├── apiHelpers.ts
│   │   ├── formatters.ts
│   │   └── ...
│   │
│   ├── main.tsx                  # ✅ Entry + Routing
│   └── App.tsx
│
├── docs/                         # ✅ ACTIVE DOCS
│   ├── INDEX.md                  # Navigation hub
│   ├── QUICK_REFERENCE.md        # Cheat sheet
│   ├── ARCHITECTURE.md           # System design
│   ├── BEST_PRACTICES.md         # Coding standards
│   ├── FRONTEND_STANDARDS.md     # React patterns
│   ├── CLEANUP_PLAN.md           # (New) This cleanup
│   └── PROJECT_STATUS.md         # (Updated) Current state
│
├── archive/                      # 🗂️ ARCHIVED (reference only)
│   ├── src/features/provider/
│   │   ├── analytics/            (was placeholder)
│   │   ├── onboarding/           (was unused)
│   │   ├── marketing/            (was out-of-scope)
│   │   ├── subscription/         (was duplicate)
│   │   └── dashboard/components/
│   │       ├── DashboardGrid.tsx
│   │       ├── MainGrid.tsx
│   │       ├── DevTools*.tsx
│   │       └── widgets/
│   │
│   └── docs/
│       ├── MONETIZATION_PLAN.md
│       ├── MONETIZATION_SUMMARY.md
│       └── PHASE_6_PLAN.md
│
├── database/                     # ✅ KEEP ALL
│   ├── migrations/
│   ├── factories/
│   └── seeders/
│
├── tests/                        # ✅ KEEP ALL (150+)
│   ├── Feature/
│   ├── Unit/
│   └── Pest/
│
├── config/                       # ✅ KEEP
│   ├── stripe.php
│   ├── features.php
│   └── ...
│
├── routes/                       # ✅ UPDATE
│   ├── api.php
│   ├── api/v1/
│   └── web.php
│
├── package.json                  # ✅ KEEP
├── composer.json                 # ✅ KEEP
├── tsconfig.json                 # ✅ KEEP
├── vite.config.mjs               # ✅ KEEP
└── .env.local                    # ✅ KEEP
```

---

## 📊 Struktura wg Modułów

### Module: `dashboard` (Lite MVP)

```
dashboard/
├── DashboardPage.tsx          (only 4 sections)
│   ├── HeroStats              (Oczekujące, Potwierdzone, Nieprz.)
│   ├── PerformanceMetrics     (views, rating, response time)
│   ├── RecentBookings         (last 5 bookings)
│   └── QuickActions           (links to other pages)
│
├── components/
│   ├── DashboardHero.tsx      ✅ KEEP
│   ├── PerformanceMetrics.tsx ✅ KEEP
│   ├── RecentBookings.tsx     ✅ KEEP
│   ├── RecentMessages.tsx     ✅ KEEP (only if space)
│   ├── Sidebar.tsx            ✅ KEEP
│   └── ProviderLayout.tsx     ✅ KEEP
│
├── hooks/
│   ├── useDashboardWidgets.ts ✅ KEEP (one query)
│   ├── useRecentBookings.ts   ✅ KEEP
│   ├── useRecentMessages.ts   ✅ KEEP (maybe remove)
│   └── (remove duplicates)
│
├── types.ts                   ✅ KEEP (single source)
├── mocks/
│   └── mockData.ts            ✅ KEEP
└── __tests__/
    ├── DashboardPage.test.tsx
    ├── PerformanceMetrics.test.tsx
    └── ...
```

### Module: `monetization` (COMPLETE)

```
monetization/
├── Components (6 total)
│   ├── BoostPurchase.tsx      ✅ KEEP (works)
│   ├── SubscriptionPurchase.tsx ✅ KEEP (works)
│   ├── BoostList.tsx          ✅ KEEP (works)
│   ├── SubscriptionList.tsx   ✅ KEEP (works)
│   ├── CheckoutSuccess.tsx    ✅ KEEP (works)
│   └── CheckoutCancel.tsx     ✅ KEEP (works)
│
├── Hooks (3 total)
│   ├── useBoost.ts            ✅ KEEP
│   ├── useSubscription.ts     ✅ KEEP
│   └── useCountdown.ts        ✅ KEEP
│
├── Utils (2 total)
│   ├── stripeClient.ts        ✅ KEEP
│   └── paymentHandler.ts      ✅ KEEP (8 API functions)
│
├── Types (2 total)
│   ├── boost.ts               ✅ KEEP
│   └── subscription.ts        ✅ KEEP
│
└── __tests__/ (48 total)
    ├── Unit/ (24)
    │   ├── BoostPurchase.test.tsx
    │   ├── useBoost.test.ts
    │   └── ...
    └── E2E/ (24)
        └── monetization.spec.ts
```

### Module: `bookings` (Pages only)

```
bookings/
├── BookingsPage.tsx           ✅ KEEP
├── hooks/
│   ├── useBookings.ts         ✅ KEEP
│   └── (consolidate)
└── __tests__/
    └── BookingsPage.test.tsx
```

### Module: `messages` (Lite)

```
messages/
├── MessagesPage.tsx           ✅ KEEP (lite version)
├── hooks/
│   └── useMessages.ts         ✅ KEEP
└── __tests__/
    └── MessagesPage.test.tsx
```

### Module: `settings` (Basic)

```
settings/
├── NotificationsTab.tsx       ✅ KEEP (with auth headers)
├── hooks/
│   └── useNotifications.ts    ✅ KEEP
└── __tests__/
    └── NotificationsTab.test.tsx
```

### Module: `calendar` (Show only)

```
calendar/
├── CalendarPage.tsx           ✅ KEEP (view only)
├── hooks/
│   └── useCalendarData.ts     ✅ KEEP
└── __tests__/
    └── CalendarPage.test.tsx
```

---

## 🚫 Removed/Archived Modules

```
❌ analytics/           → archive/
    (was: AnalyticsPage.tsx - placeholder with no data)

❌ onboarding/          → archive/
    (was: OnboardingTour.tsx - not used, clutters UI)

❌ marketing/           → archive/
    (was: out of scope for MVP)

❌ subscription/        → archive/ (consolidated into monetization)
    (was: duplicate of monetization)

❌ pages/               → consolidate or archive
    (was: redirect pages, clutter)
```

---

## 🔄 Routing Structure (main.tsx)

**BEFORE:** 25+ routes  
**AFTER:** 12 core routes

```typescript
// Core Provider Routes (12)
/provider/dashboard                 → DashboardPage
/provider/bookings                  → BookingsPage
/provider/calendar                  → CalendarPage
/provider/messages                  → MessagesPage
/provider/settings                  → SettingsPage
/provider/profile                   → ProfilePage

// Monetization (4)
/provider/monetization/boost        → BoostPurchase
/provider/monetization/subscription → SubscriptionPurchase
/provider/monetization/boosts       → BoostList
/provider/monetization/subscriptions → SubscriptionList

// Checkout (2)
/checkout/success?session_id=...    → CheckoutSuccess
/checkout/cancel                    → CheckoutCancel

// Auth (2)
/login                              → LoginPage
/signup                             → SignupPage
```

**REMOVED:**
- ❌ /provider/analytics
- ❌ /provider/onboarding
- ❌ /provider/marketing
- ❌ /provider/subscription/* (consolidated)
- ❌ Dead redirect pages

---

## 📚 Documentation Structure

**ACTIVE (read these):**
```
docs/
├── INDEX.md                  # Start here - navigation
├── QUICK_REFERENCE.md        # Cheat sheet
├── ARCHITECTURE.md           # System design
├── BEST_PRACTICES.md         # Coding patterns
└── FRONTEND_STANDARDS.md     # React/TypeScript rules
```

**STATUS (for reference):**
```
docs/
├── PROJECT_STATUS.md         # Current progress
├── CLEANUP_PLAN.md           # This refactor
└── IMPLEMENTATION_ROADMAP.md # Timeline
```

**ARCHIVED (for history):**
```
archive/docs/
├── MONETIZATION_PLAN.md      # Phase 1 planning (done)
├── MONETIZATION_SUMMARY.md   # Phase 1 summary (done)
├── PHASE_1_SUMMARY.md        # Backend summary (done)
├── PHASE_2_PLANNING.md       # API planning (done)
└── PHASE_6_PLAN.md           # Frontend planning (superseded)
```

---

## 🎯 Component Count

| Category | Before | After | Status |
|----------|--------|-------|--------|
| Dashboard | 12 | 6 | **-50%** |
| Monetization | 6 | 6 | **No change** ✅ |
| Bookings | 3 | 1 | **-67%** |
| Calendar | 2 | 1 | **-50%** |
| Messages | 3 | 1 | **-67%** |
| Settings | 2 | 1 | **-50%** |
| Profile | 4 | 2 | **-50%** |
| Removed | 56 | 0 | **-100%** |
| **TOTAL** | **88** | **35** | **-60%** |

---

## ✅ Dependencies After Cleanup

```
KEEP (working):
✅ @tanstack/react-query  (for API calls)
✅ @stripe/stripe-js      (for payments)
✅ react-router-dom       (for navigation)
✅ lucide-react           (for icons)
✅ tailwind-css           (for styling)
✅ typescript             (for types)
✅ vitest                 (for unit tests)
✅ @testing-library/react (for component tests)
✅ playwright             (for E2E tests)

REMOVE (if unused):
❌ Check for unused packages
```

---

## 🚀 Performance Impact

After cleanup:

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Build time | ~8-10s | ~4-5s | **-50%** ⚡ |
| Bundle size | ~450KB | ~280KB | **-38%** 📉 |
| Components to maintain | 88 | 35 | **-60%** 🧹 |
| Dev mental load | 💥 | 📦 | **Cleaner** 🧠 |
| Time to find code | 5 min | 1 min | **-80%** 🔍 |

---

## 📋 Checklist After Cleanup

- [ ] No broken imports
- [ ] All routes working
- [ ] 150+ tests still pass
- [ ] Dashboard renders correctly (4 sections)
- [ ] Monetization flow works (Stripe sandbox)
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] No unused dependencies
- [ ] Documentation updated
- [ ] Archive folder created with README

---

## 🎓 Learning from This Cleanup

**What went wrong:**
1. Feature creep (started building everything)
2. No MVP definition (kept adding "nice-to-have")
3. No prioritization (equal focus on all features)
4. Over-abstraction (too many component layers)

**What to do next time:**
1. ✅ Define MVP first (3-4 core features)
2. ✅ Say "No" to scope creep
3. ✅ Archive, don't delete (easier rollback)
4. ✅ Review architecture before code explosion

---

**Status:** READY FOR IMPLEMENTATION  
**Target Date:** 30-31 grudnia 2025  
**Owner:** You  
**Review:** After cleanup, discuss Phase 7 priorities
