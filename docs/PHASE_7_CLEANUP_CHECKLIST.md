# 🚀 Phase 7 - Cleanup Execution Checklist

**Data rozpoczęcia:** 29 grudnia 2025  
**Target kompletion:** 31 grudnia 2025  
**Estymacja:** 4-6 godzin  
**Priorytet:** P1 (Blocker dla dalszego development)

---

## 📋 Pre-Cleanup Verification

- [ ] Pull latest changes: `git pull`
- [ ] Create cleanup branch: `git checkout -b refactor/project-cleanup`
- [ ] All tests passing: `npm run test` + `php artisan test`
- [ ] No uncommitted changes: `git status` (clean)
- [ ] Backup .env files (if custom)
- [ ] Read CLEANUP_PLAN.md + FINAL_STRUCTURE.md

---

## 🚀 Phase 1: Move Files to Archive (Non-breaking)

### Step 1.1: Archive Feature Directories

```bash
# Strukturę zachowuj!

# analytics/ - MOVE TO ARCHIVE
mkdir -p archive/src/features/provider/analytics
mv src/features/provider/analytics/* archive/src/features/provider/analytics/

# onboarding/ - MOVE TO ARCHIVE
mkdir -p archive/src/features/provider/onboarding
mv src/features/provider/onboarding/* archive/src/features/provider/onboarding/

# marketing/ - MOVE TO ARCHIVE
mkdir -p archive/src/features/provider/marketing
mv src/features/provider/marketing/* archive/src/features/provider/marketing/

# subscription/ - MOVE TO ARCHIVE (consolidate into monetization)
mkdir -p archive/src/features/provider/subscription
mv src/features/provider/subscription/* archive/src/features/provider/subscription/
```

- [ ] analytics moved
- [ ] onboarding moved
- [ ] marketing moved
- [ ] subscription moved

### Step 1.2: Archive Dashboard Components

```bash
# DashboardGrid, MainGrid, DevTools, widgets/ - MOVE TO ARCHIVE
mkdir -p archive/src/features/provider/dashboard/components

mv src/features/provider/dashboard/components/DashboardGrid.tsx \
   archive/src/features/provider/dashboard/components/

mv src/features/provider/dashboard/components/MainGrid.tsx \
   archive/src/features/provider/dashboard/components/

mv src/features/provider/dashboard/components/DevToolsPopup.tsx \
   archive/src/features/provider/dashboard/components/

mv src/features/provider/dashboard/components/DevToolsPanel.tsx \
   archive/src/features/provider/dashboard/components/

mv src/features/provider/dashboard/components/widgets \
   archive/src/features/provider/dashboard/components/
```

- [ ] DashboardGrid moved
- [ ] MainGrid moved
- [ ] DevTools files moved
- [ ] widgets folder moved

### Step 1.3: Archive Deprecated Docs

```bash
# docs/
mv docs/MONETIZATION_PLAN.md archive/docs/
mv docs/MONETIZATION_SUMMARY.md archive/docs/
mv docs/PHASE_6_PLAN.md archive/docs/

# Also archive duplicate files if any
```

- [ ] MONETIZATION_PLAN.md moved
- [ ] MONETIZATION_SUMMARY.md moved
- [ ] PHASE_6_PLAN.md moved

### Step 1.4: Git Commit

```bash
git add -A
git commit -m "Refactor: Move deprecated features to archive/

Moved to archive/ (non-breaking):
- analytics/ (placeholder, no data)
- onboarding/ (unused tour)
- marketing/ (out of scope)
- subscription/ (consolidate into monetization)
- dashboard/components/DashboardGrid.tsx (unused)
- dashboard/components/MainGrid.tsx (unused)
- dashboard/components/DevTools*.tsx (dev only)
- dashboard/components/widgets/ (half-done)
- docs/MONETIZATION_PLAN.md (planning done)
- docs/MONETIZATION_SUMMARY.md (planning done)
- docs/PHASE_6_PLAN.md (superseded)

Code remains intact in archive/ for reference.
No breaking changes - all live code still works."
```

- [ ] Commit created

---

## ⚙️ Phase 2: Update Imports & Routes (Breaking)

### Step 2.1: Remove Archive Imports from Live Code

**Find & replace:**
```bash
# Szukaj wszystkich importów z usuniętych modułów
grep -r "from.*analytics" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*onboarding" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*marketing" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*subscription" src/ --include="*.tsx" --include="*.ts"
grep -r "DashboardGrid" src/ --include="*.tsx" --include="*.ts"
grep -r "MainGrid" src/ --include="*.tsx" --include="*.ts"
grep -r "DevTools" src/ --include="*.tsx" --include="*.ts"
```

- [ ] All removed imports identified
- [ ] No dangling imports remain

### Step 2.2: Clean Up src/main.tsx Routing

**Remove routes:**
```tsx
// REMOVE THESE ROUTES:

// ❌ Analytics
{
  path: '/provider/analytics',
  element: <AnalyticsPage />,
}

// ❌ Onboarding
{
  path: '/provider/onboarding',
  element: <OnboardingTour />,
}

// ❌ Marketing
{
  path: '/provider/marketing',
  element: <MarketingPage />,
}

// ❌ Subscription (old)
{
  path: '/provider/subscription',
  element: <SubscriptionPage />,
}

// ✅ KEEP (consolidate into monetization)
{
  path: '/provider/monetization/subscription',
  element: <SubscriptionPurchase />,
}
```

**File:** `src/main.tsx`

- [ ] Analytics routes removed
- [ ] Onboarding routes removed
- [ ] Marketing routes removed
- [ ] Old subscription routes removed
- [ ] Consolidate routes verified

### Step 2.3: Clean Up Dashboard Components

**File:** `src/features/provider/dashboard/components/index.ts`

```typescript
// KEEP:
export { DashboardPage } from './DashboardPage';
export { DashboardHero } from './DashboardHero';
export { PerformanceMetrics } from './PerformanceMetrics';
export { RecentBookings } from './RecentBookings';
export { RecentMessages } from './RecentMessages';
export { Sidebar } from './Sidebar';
export { ProviderLayout } from './ProviderLayout';

// REMOVE (moved to archive):
// export { DashboardGrid } from './DashboardGrid';  // ❌
// export { MainGrid } from './MainGrid';             // ❌
// export { DevToolsPopup } from './DevToolsPopup';   // ❌
// export { DevToolsPanel } from './DevToolsPanel';   // ❌
```

- [ ] Dashboard exports cleaned

### Step 2.4: Git Commit

```bash
git add -A
git commit -m "Refactor: Remove imports and routes for archived features

Removed:
- All imports from analytics/onboarding/marketing/subscription
- /provider/analytics route
- /provider/onboarding route
- /provider/marketing route
- /provider/subscription routes (consolidated into /monetization)
- DashboardGrid, MainGrid, DevTools from exports

Result: 12 core routes, clean import tree"
```

- [ ] Commit created

---

## 🧪 Phase 3: Simplify Dashboard

### Step 3.1: Update DashboardPage.tsx

**Remove sections:**
```tsx
// KEEP (4 sections):
- HeroStats (Oczekujące, Potwierdzone, Nieprz.)
- PerformanceMetrics
- RecentBookings
- QuickActions

// REMOVE:
- Pipeline board (move logic to bookings page)
- Insights card
- Tasks card
- Calendar glance
- Recent reviews
- Recent messages
- Addons carousel
- Plan card
- Dev tools
```

**File:** `src/features/provider/dashboard/components/DashboardPage.tsx`

- [ ] Dashboard sections reduced to 4
- [ ] Unused imports removed
- [ ] Component renders correctly

### Step 3.2: Verify Dashboard Still Works

```bash
npm run dev
# Navigate to /provider/dashboard
# Verify:
# - Hero stats show (Pending, Confirmed, Unread)
# - Performance metrics show (Views, Rating, Response time)
# - Recent bookings show
# - Quick actions show (links to calendar, messages, services)
```

- [ ] Dashboard renders
- [ ] No console errors
- [ ] All 4 sections visible
- [ ] Responsive design works

### Step 3.3: Git Commit

```bash
git commit -m "Refactor: Simplify dashboard to 4 MVP sections

Kept:
- Hero stats
- Performance metrics
- Recent bookings
- Quick actions

Removed:
- Pipeline board
- Insights card
- Tasks card
- Calendar glance
- Recent reviews
- Recent messages (moved to messages page)
- Addons carousel
- Plan card
- Dev tools

Result: Cleaner, faster dashboard. All removed features accessible via other pages."
```

- [ ] Commit created

---

## 🔄 Phase 4: Consolidate Hooks

### Step 4.1: Find Duplicates

```bash
# Find all hooks in provider/
find src/features/provider -name "*.ts" -path "*hooks*" | sort
# Review for duplicates (useAPI, useFetch, etc.)
```

- [ ] Hook audit completed

### Step 4.2: Consolidate (if needed)

```typescript
// If duplicates found:
// Consolidate into one file with clear exports
// Example:
// src/features/provider/hooks/index.ts
export { useDashboardWidgets } from './useDashboardWidgets';
export { useRecentBookings } from './useRecentBookings';
export { useRecentMessages } from './useRecentMessages';
export { useBoost } from '../monetization/hooks/useBoost';
export { useSubscription } from '../monetization/hooks/useSubscription';
```

- [ ] Duplicates identified
- [ ] Consolidation plan made (if needed)

### Step 4.3: Update Imports

- [ ] All hook imports use consolidated paths
- [ ] No broken imports

### Step 4.4: Git Commit (if changes)

```bash
git commit -m "Refactor: Consolidate provider hooks

- Removed duplicate hooks
- Centralized exports
- Updated imports across codebase"
```

- [ ] Commit created (if needed)

---

## ✅ Phase 5: Verification & Testing

### Step 5.1: TypeScript Check

```bash
npm run build
# or
npx tsc --noEmit
```

- [ ] No TypeScript errors
- [ ] Build succeeds

### Step 5.2: Run All Tests

```bash
npm run test          # Unit tests
php artisan test      # Backend tests
npx playwright test   # E2E tests (optional)
```

- [ ] All 150+ tests pass
- [ ] No test failures

### Step 5.3: Manual Testing

```
Checklist:
- [ ] /provider/dashboard loads & displays 4 sections
- [ ] /provider/monetization/boost page works
- [ ] /provider/monetization/subscription page works
- [ ] /provider/bookings loads
- [ ] /provider/messages loads
- [ ] /provider/calendar loads
- [ ] /provider/settings/notifications loads
- [ ] /provider/profile loads
- [ ] /checkout/success works (with session_id)
- [ ] /checkout/cancel works
- [ ] No dead links in navigation
- [ ] No 404 pages for live routes
- [ ] No console errors/warnings
```

### Step 5.4: Verify Archive

```bash
# Check archive has all moved files
ls -la archive/src/features/provider/
ls -la archive/docs/

# Verify archive/README.md exists
cat archive/README.md
```

- [ ] Archive complete and documented

---

## 📊 Phase 6: Final Metrics Check

```bash
# Count components before/after
find src/features/provider -name "*.tsx" | wc -l
# Should be ~35 (was 88)

# Count routes before/after
grep -c "path:" src/main.tsx
# Should be ~12 (was 25+)

# Build size
npm run build
# Check dist/ size (should be ~20-30% smaller)

# Build time
# Should be faster (was ~8-10s, now ~4-5s)
```

- [ ] Component count: ~35 ✅
- [ ] Routes: ~12 ✅
- [ ] Build completes successfully ✅
- [ ] No size increase ✅

---

## 🎯 Phase 7: Documentation Updates

### Step 7.1: Update INDEX.md

Add links to:
- [x] CLEANUP_PLAN.md (what was removed)
- [x] FINAL_STRUCTURE.md (target structure)

### Step 7.2: Update PROJECT_STATUS.md

```markdown
## 🧹 Phase 7: Project Cleanup ✅

### Completed
- Moved 88 → 35 components
- Moved 12 → 6 feature modules
- Dashboard: 12 → 4 sections
- Routes: 25+ → 12
- All tests passing (150+)
- Zero breaking changes

### Archive Location
See: archive/README.md

### Next: Phase 8 Planning
```

### Step 7.3: Create CLEANUP_CHANGELOG.md

```markdown
# Cleanup Changelog

## Removed Features (moved to archive/)

### Features
- analytics/ (placeholder without data)
- onboarding/ (unused tour)
- marketing/ (out of MVP scope)
- subscription/ (consolidated into monetization)

### Components
- DashboardGrid, MainGrid (unused)
- DevTools (dev-only debugging)
- widgets/ (half-implemented)

### Documentation
- MONETIZATION_PLAN.md (planning complete)
- PHASE_6_PLAN.md (superseded by IMPLEMENTATION.md)

### Metrics
- 60% fewer components
- 50% fewer feature folders
- 52% fewer routes
- ~20-30% smaller build

See: archive/README.md for details
```

- [ ] INDEX.md updated
- [ ] PROJECT_STATUS.md updated
- [ ] CLEANUP_CHANGELOG.md created

### Step 7.4: Git Commit

```bash
git add docs/
git commit -m "Docs: Update documentation after cleanup

- Updated INDEX.md with archive links
- Updated PROJECT_STATUS.md with Phase 7 complete
- Created CLEANUP_CHANGELOG.md
- All documentation reflects new structure"
```

- [ ] Commit created

---

## 🔄 Phase 8: Merge & Close

### Step 8.1: Final Checks

```bash
# One more time:
npm run build      # ✅ Builds
npm run test       # ✅ Tests pass
git status         # ✅ Clean
git log --oneline -5  # ✅ Commits look good
```

- [ ] Build passes
- [ ] Tests pass
- [ ] No uncommitted changes
- [ ] Commits are clean

### Step 8.2: Merge Branch

```bash
git checkout main
git pull origin main
git merge refactor/project-cleanup
git push origin main
```

- [ ] Branch merged to main
- [ ] Changes pushed

### Step 8.3: Verify on Main

```bash
git pull
npm run build
npm run test
```

- [ ] Everything still works on main ✅

### Step 8.4: Create GitHub Release Tag (optional)

```bash
git tag -a v7.0.0 -m "Phase 7: Project Cleanup Complete

- 88 → 35 components (-60%)
- 12 → 6 features (-50%)
- 25+ → 12 routes (-52%)
- All 150+ tests passing
- Ready for Phase 8 development"

git push origin v7.0.0
```

- [ ] Tag created (optional)

---

## 🎊 DONE! What's Next?

### Immediate (Today)
```
✅ Project is now clean and lean
✅ Ready for new development
✅ Easier to onboard new devs
✅ No technical debt headaches
```

### Short Term (Week 1)
```
→ Phase 8 Planning: Analytics (real data)
→ Performance optimizations
→ Mobile responsive testing
→ Staging deployment
```

### Medium Term (Phase 8+)
```
→ Real analytics module
→ Advanced payment features
→ Refunds system
→ Multi-language support
```

---

## 📞 Troubleshooting

**If build fails:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**If tests fail after merge:**
```bash
git log --oneline -3  # Check recent commits
git show HEAD         # See what changed
# Check if any test imports removed components
```

**If can't merge:**
```bash
git merge --abort
# Resolve conflicts manually
git diff
```

**If something broke:**
```bash
git revert HEAD
# Code back to safe state
# Then figure out what went wrong
```

---

## ✨ Success Criteria

- [x] No TypeScript errors
- [x] All 150+ tests pass
- [x] Dashboard renders (4 sections)
- [x] Monetization flow works (Stripe)
- [x] All core routes accessible
- [x] Build time < 6 seconds
- [x] No broken imports
- [x] Documentation updated
- [x] Archive documented
- [x] Code reviewed & merged

**If all checked:** 🎉 **CLEANUP COMPLETE!**

---

**Owner:** You  
**Estimated Time:** 4-6 hours  
**Status:** 📋 Ready to Execute  
**Last Updated:** 29 grudnia 2025  
**Version:** 1.0
