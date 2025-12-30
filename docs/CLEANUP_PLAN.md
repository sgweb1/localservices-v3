# 🧹 Project Cleanup Plan

**Data:** 29 grudnia 2025  
**Cel:** Zmniejszyć projekt z ~88 komponentów do ~35 (MVP core)  
**Estymacja:** 3-4 godziny  
**Priorytet:** P1 (Blocker dla Phase 7)

---

## 📊 Czemu robimy cleanup?

| Problem | Konsekwencja | Fix |
|---------|-------------|-----|
| 88 komponentów | Chaos, trudno coś znaleźć | Usuń 50% (archive, nie delete) |
| Duplikat hooków | Maintenance hell | Consolidate |
| 3 wersje dashboarda | Konfuzja, co testować? | One dashboard |
| Martwe linki | Build warnings | Update routing |
| 15 dokumentów | Za dużo do czytania | 5 aktywnych |

---

## 🎯 Co zostaje (KEEP)

### Frontend - PRODUCTION READY ✅

```
src/features/provider/
├── dashboard/              ← KEEP (simplify to 4 sections)
│   ├── components/
│   │   ├── DashboardPage.tsx     ✅ KEEP
│   │   ├── DashboardHero.tsx     ✅ KEEP
│   │   ├── PerformanceMetrics.tsx ✅ KEEP
│   │   ├── RecentBookings.tsx    ✅ KEEP
│   │   ├── RecentMessages.tsx    ✅ KEEP (lite version)
│   │   ├── RecentReviews.tsx     ⚠️ TO REVIEW
│   │   ├── Sidebar.tsx           ✅ KEEP
│   │   ├── ProviderLayout.tsx    ✅ KEEP
│   │   ├── DashboardGrid.tsx     ❌ REMOVE (unused)
│   │   ├── MainGrid.tsx          ❌ REMOVE (unused)
│   │   ├── DevToolsPopup.tsx     ❌ REMOVE (dev only)
│   │   ├── DevToolsPanel.tsx     ❌ REMOVE (dev only)
│   │   └── widgets/              ❌ REMOVE (half-done)
│   └── hooks/                    ✅ KEEP (optimize)
│
├── monetization/           ← KEEP (PHASE 6 - WORKS!)
│   ├── components/
│   │   ├── BoostPurchase.tsx     ✅ KEEP
│   │   ├── SubscriptionPurchase.tsx ✅ KEEP
│   │   ├── BoostList.tsx         ✅ KEEP
│   │   └── SubscriptionList.tsx  ✅ KEEP
│   ├── pages/
│   │   ├── CheckoutSuccess.tsx   ✅ KEEP
│   │   └── CheckoutCancel.tsx    ✅ KEEP
│   ├── hooks/
│   │   ├── useBoost.ts           ✅ KEEP
│   │   └── useSubscription.ts    ✅ KEEP
│   └── utils/
│       ├── stripeClient.ts       ✅ KEEP
│       └── paymentHandler.ts     ✅ KEEP
│
├── messages/               ← KEEP (basic)
│   └── MessagesPage.tsx          ✅ KEEP (lite)
│
├── settings/               ← KEEP (basic)
│   └── NotificationsTab.tsx      ✅ KEEP
│
├── profile/                ← SIMPLIFY
│   └── ProfilePage.tsx           ⚠️ KEEP (minimal)
│
└── calendar/               ← SIMPLIFY
    └── CalendarPage.tsx          ⚠️ KEEP (show only)
```

### Backend - ALL KEEP ✅

```
app/
├── Services/
│   ├── BoostService.php          ✅ KEEP (WORKS!)
│   ├── SubscriptionService.php   ✅ KEEP (WORKS!)
│   └── ...
├── Models/                       ✅ ALL KEEP
├── Http/Controllers/Api/V1/      ✅ ALL KEEP
├── Observers/                    ✅ KEEP
├── Policies/                     ✅ KEEP
└── Events/Listeners/             ✅ KEEP

database/
├── migrations/                   ✅ ALL KEEP
├── factories/                    ✅ ALL KEEP
└── seeders/                      ✅ ALL KEEP

tests/                            ✅ ALL KEEP (150+ tests)
```

---

## ❌ Co usuwamy (REMOVE)

### Frontend - REMOVE (move to ARCHIVE/)

```
src/features/provider/
├── analytics/                    ❌ REMOVE
│   └── AnalyticsPage.tsx         (placeholder, no data)
│
├── onboarding/                   ❌ REMOVE
│   └── OnboardingTour.tsx        (not used, clutters UI)
│
├── marketing/                    ❌ REMOVE
│   └── ...                       (out of scope for MVP)
│
├── subscription/                 ❌ REMOVE
│   └── ...                       (duplikat monetization)
│
└── dashboard/components/
    ├── DashboardGrid.tsx         ❌ REMOVE (unused)
    ├── MainGrid.tsx              ❌ REMOVE (unused)
    ├── DevToolsPopup.tsx         ❌ REMOVE (dev only)
    ├── DevToolsPanel.tsx         ❌ REMOVE (dev only)
    └── widgets/
        ├── PendingActionsWidget.tsx ❌ REMOVE (half-done)
        └── ...
```

### Documentation - ARCHIVE

```
docs/
├── MONETIZATION_PLAN.md          ❌ ALREADY DONE (archived)
├── MONETIZATION_SUMMARY.md       ❌ ALREADY DONE (archived)
├── REMOVE_ROTATION_ANALYSIS.md   ❌ ALREADY DONE (archived)
├── PHASE_1_SUMMARY.md            ⚠️ ARCHIVE (keep reference)
├── PHASE_2_PLANNING.md           ⚠️ ARCHIVE (keep reference)
└── PHASE_6_PLAN.md               ❌ REMOVE (superseded by IMPLEMENTATION)
```

---

## 🟡 Co zmieniamy (MODIFY)

### Dashboard - SIMPLIFY

**Current (12 sekcji):**
```
1. Hero stats
2. Pipeline board
3. Insights card
4. Tasks card
5. Performance metrics
6. Calendar glance
7. Recent bookings
8. Recent reviews
9. Recent messages
10. Addons carousel
11. Plan card
12. Dev tools
```

**New MVP (4 sekcje):**
```
1. ✅ Hero stats (Keep: Oczekujące, Potwierdzone, Nieprz.)
2. ✅ Performance Snapshot (views, rating, response time)
3. ✅ Recent Bookings (ostatnie rezerwacje)
4. ✅ Quick Actions (linki do kalendarza, wiadomości, usług)
```

**Remove from Dashboard:**
- ❌ Pipeline board (move to bookings page)
- ❌ Insights card (move to profile page)
- ❌ Tasks card (out of scope)
- ❌ Calendar glance (go to calendar page)
- ❌ Recent reviews (go to profile page)
- ❌ Recent messages (go to messages page)
- ❌ Addons carousel (marketing)
- ❌ Plan card (go to subscription page)
- ❌ Dev tools (dev only)

### Routing - CLEAN UP

**Remove dead routes:**
```
❌ /provider/analytics       (placeholder)
❌ /provider/onboarding      (not used)
❌ /provider/marketing       (out of scope)
❌ /provider/subscription/*  (use monetization instead)
```

**Keep routes:**
```
✅ /provider/dashboard
✅ /provider/monetization/boost
✅ /provider/monetization/subscription
✅ /provider/monetization/boosts
✅ /provider/monetization/subscriptions
✅ /provider/bookings
✅ /provider/messages
✅ /provider/calendar (lite)
✅ /provider/settings
✅ /provider/profile (lite)
✅ /checkout/success
✅ /checkout/cancel
```

---

## 📋 Execution Steps

### Step 1: Create Archive Directory
```bash
mkdir -p archive/src/features/provider
mkdir -p archive/docs
```

### Step 2: Move files (don't delete!)
```bash
# Components
mv src/features/provider/analytics archive/
mv src/features/provider/onboarding archive/
mv src/features/provider/marketing archive/
mv src/features/provider/subscription archive/

# From dashboard
mv src/features/provider/dashboard/components/DashboardGrid.tsx archive/
mv src/features/provider/dashboard/components/MainGrid.tsx archive/
mv src/features/provider/dashboard/components/DevTools*.tsx archive/
mv src/features/provider/dashboard/components/widgets archive/
```

### Step 3: Clean up Routes (src/main.tsx)
- Remove analytics routes
- Remove onboarding routes
- Remove subscription routes (consolidate with monetization)
- Remove dev-only routes

### Step 4: Update Dashboard (DashboardPage.tsx)
- Remove unused imports
- Remove unused sections
- Keep only: Hero, Performance, RecentBookings, QuickActions

### Step 5: Consolidate Hooks
- Review all hooks in each feature
- Remove duplicates
- Consolidate useDashboardData hooks

### Step 6: Documentation
- Keep: INDEX, QUICK_REFERENCE, ARCHITECTURE, BEST_PRACTICES
- Archive: PHASE_1_SUMMARY, PHASE_2_PLANNING, PHASE_6_PLAN
- Create: CLEANUP_CHANGELOG.md

### Step 7: Git
```bash
git add .
git commit -m "Refactor: Project cleanup - remove 50% unused components

Removed:
- analytics feature (placeholder)
- onboarding tour (not used)
- marketing section
- duplicate subscription module
- dev tools from dashboard
- unused dashboard components

Kept:
- Phase 1-5: Complete backend (boosts, subscriptions, payments)
- Phase 6: Complete frontend monetization module
- Dashboard: 4 essential sections only
- All 150+ tests passing

Structure now: 35 components (was 88), 6 feature modules (was 12)"
```

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] Project builds without errors
- [ ] No broken imports
- [ ] All 150+ tests still pass
- [ ] Dashboard loads and works
- [ ] Monetization flow works (boost + subscription)
- [ ] Routing has no dead links
- [ ] Documentation updated
- [ ] No console warnings about unused components
- [ ] Build size reduced

---

## 📊 Expected Outcome

| Metric | Before | After | % Change |
|--------|--------|-------|----------|
| Components | 88 | 35 | **-60%** ✅ |
| Feature folders | 12 | 6 | **-50%** ✅ |
| Dashboard sections | 12 | 4 | **-67%** ✅ |
| Routes | 25+ | 12 | **-52%** ✅ |
| Build time | ~8s | ~4s | **-50%** ✅ |
| Mental load | 💥 | 📦 | **Clear** ✅ |

---

## 🚀 Next Steps (After Cleanup)

1. **Phase 7 Planning** - Analytics properly (not placeholder)
2. **Mobile optimization** - Dashboard responsive
3. **Performance** - Lighthouse score > 90
4. **Deployment** - Staging → Production setup

---

**Status:** READY TO EXECUTE  
**Owner:** You  
**Estimated Time:** 3-4 hours  
**Risk:** LOW (moving files, not deleting)  
**Rollback:** Easy (git revert)
