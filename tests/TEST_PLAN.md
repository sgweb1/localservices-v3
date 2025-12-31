# Test Plan – LocalServices Platform

## Current Test Status (2025-12-30)

### ✅ Implemented Tests
- **Unit Tests** (tests/unit/) - 9 passing tests
  - `provider-completeness.test.ts` - Meta-test tracking 13 functional areas + 11 routes
  - `provider-bookings-api.test.ts` - Happy-path test for bookings API
  - `api-path-correctness.test.ts` - Validates no duplicate /api/v1/ prefixes
  - `backend-contract.test.ts` - Documents critical backend fixes (reviewed_id, bookingsAsProvider, booking_date fields)
  - `api-endpoints.test.ts` - Smoke tests for all major API endpoints

### 🔧 Backend Fixes Applied
1. **ProviderDashboardController.php**
   - Fixed: `provider_bookings()` → `bookingsAsProvider()`
   - Fixed: `scheduled_at` → `booking_date`, `location` → `service_address`
   - Fixed: `reviewed_id` query (was already correct)

2. **GenericNotificationMail.php**
   - Fixed: `$subject` property → `$emailSubject` (avoid Mailable property conflict)

### 📁 Test Structure
```
tests/
├── unit/                    # Vitest unit tests (9 passing)
│   ├── provider-completeness.test.ts
│   └── api/
│       ├── provider-bookings-api.test.ts
│       ├── api-path-correctness.test.ts
│       ├── backend-contract.test.ts
│       └── api-endpoints.test.ts
├── e2e/                     # Playwright E2E tests (TO DO)
├── Feature/                 # Laravel Feature tests (removed - too complex)
└── TEST_PLAN.md            # This file
```

## Testing Strategy - Start from Scratch

### Phase 1: API Contract Tests (Priority: HIGH)
**Goal**: Verify all critical API endpoints respond correctly

#### 1.1 Authentication & Authorization
- [ ] POST /api/v1/auth/login → 200 with token
- [ ] POST /api/v1/auth/register → 201 with user
- [ ] POST /api/v1/auth/logout → 204
- [ ] GET /api/v1/profile → 401 without auth, 200 with auth
- [ ] POST /api/v1/dev/quick-login → 200 with token (dev only)

#### 1.2 Provider Dashboard
- [x] GET /api/v1/provider/dashboard/widgets → 200 with data structure
- [ ] GET /api/v1/provider/dashboard/bookings → 200 with array
- [ ] GET /api/v1/provider/dashboard/reviews → 200 with array (uses reviewed_id)
- [ ] GET /api/v1/provider/dashboard/conversations → 200 with array
- [ ] GET /api/v1/provider/dashboard/performance → 200 with metrics

#### 1.3 Provider Services
- [ ] GET /api/v1/provider/services → 200 with list
- [ ] POST /api/v1/provider/services → 201 with created service
- [ ] PUT /api/v1/provider/services/:id → 200 with updated data
- [ ] DELETE /api/v1/provider/services/:id → 204

#### 1.4 Provider Bookings
- [ ] GET /api/v1/provider/bookings → 200 with pagination
- [ ] GET /api/v1/provider/bookings/:id → 200 with booking details
- [ ] PATCH /api/v1/provider/bookings/:id/confirm → 200
- [ ] PATCH /api/v1/provider/bookings/:id/cancel → 200

#### 1.5 Marketplace (Public)
- [ ] GET /api/v1/marketplace → 200 with services list
- [ ] GET /api/v1/marketplace/search → 200 with results
- [ ] GET /api/v1/subscriptions/plans → 200 with plans (public)

#### 1.6 Notifications
- [ ] GET /api/v1/notifications → 200 with notifications array
- [ ] PATCH /api/v1/notifications/:id/read → 200
- [ ] POST /api/v1/push/subscribe → 200 with subscription

### Phase 2: Component Tests (Priority: MEDIUM)
**Goal**: Test React components in isolation

#### 2.1 Dashboard Components
- [ ] DashboardWidgets - renders all widget cards
- [ ] PipelineWidget - displays booking counts
- [ ] PerformanceWidget - displays metrics
- [ ] InsightsWidget - displays stats

#### 2.2 Bookings Components
- [ ] BookingsTable - renders bookings list
- [ ] BookingDetailDialog - shows booking details
- [ ] BookingStatusBadge - displays correct status colors

#### 2.3 Services Components
- [ ] ServicesList - renders services grid
- [ ] ServiceForm - validates inputs
- [ ] ServiceCard - displays service info

### Phase 3: Integration Tests (Priority: MEDIUM)
**Goal**: Test React Query hooks and data flow

#### 3.1 Provider Hooks
- [ ] useDashboardWidgets - fetches and caches widgets data
- [ ] useDashboardData - fetches bookings/reviews/conversations
- [ ] useProviderServices - CRUD operations work correctly
- [ ] useProviderBookings - list and actions work

#### 3.2 Error Handling
- [ ] 401 errors redirect to /dev/login
- [ ] 403 errors show permission denied
- [ ] 500 errors show generic error message
- [ ] Network errors show retry option

### Phase 4: E2E Smoke Tests (Priority: LOW)
**Goal**: Critical user flows work end-to-end

#### 4.1 Provider Dashboard Flow
- [ ] Login → Dashboard loads → Widgets display
- [ ] Navigate to Bookings → List loads → Open detail
- [ ] Navigate to Services → List loads → Create service
- [ ] Navigate to Messages → List loads → Send message

#### 4.2 Authentication Flow
- [ ] Dev login → Redirects to dashboard
- [ ] Logout → Redirects to /dev/login
- [ ] Protected route without auth → Redirects to login

## Testing Tools

### Current Stack
- **Vitest** - Unit/Integration tests for React + TypeScript
- **React Testing Library** - Component tests
- **Playwright** - E2E tests (planned)
- **PHPUnit** - Backend tests (skipped - too complex for now)

### Test Commands
```bash
# Run all unit tests
npm run test

# Run single test file
npm run test -- provider-completeness.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run E2E tests (when implemented)
npm run test:e2e
```

## Implementation Guidelines

### Writing Good Tests
1. **Keep tests simple** - Test one thing at a time
2. **Mock external dependencies** - Use vi.mock() for axios, React Query
3. **Use descriptive names** - Test name should explain what it verifies
4. **Test behavior, not implementation** - Focus on user-facing behavior
5. **Avoid testing third-party code** - Don't test React Query or axios

### Test Structure Template
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Feature Name', () => {
  it('should do expected behavior', () => {
    // Arrange - setup test data
    // Act - execute the code
    // Assert - verify results
  })
  
  it('should handle error case', () => {
    // Test error scenarios
  })
})
```

### What NOT to Test
- ❌ Third-party libraries (React Query, axios, React Router)
- ❌ Browser APIs (unless mocked)
- ❌ CSS styling (use visual regression tests if needed)
- ❌ Complex backend logic (use Laravel tests for that)

### What TO Test
- ✅ API endpoint availability (smoke tests)
- ✅ Data transformation logic
- ✅ Error handling and user feedback
- ✅ Critical user flows (E2E)
- ✅ Business logic in hooks/services

## Notes

- **Legacy tests removed**: Old tests were outdated and didn't match current architecture
- **Backend tests skipped**: Laravel Feature tests are complex and require full database setup
- **Focus on frontend**: Most bugs appear in API integration and React components
- **Incremental approach**: Start with smoke tests, expand as needed
- **Real backend preferred**: Tests use localhost:5173 (Vite proxy to Laravel)

## Success Criteria

### Phase 1 Complete When:
- [ ] All critical API endpoints have smoke tests
- [ ] Authentication flow is tested
- [ ] Provider dashboard endpoints verified
- [ ] No 500 errors in smoke tests

### Phase 2 Complete When:
- [ ] All major components render without errors
- [ ] Form validation works
- [ ] Loading/error states tested

### Phase 3 Complete When:
- [ ] React Query hooks properly cache data
- [ ] Error handling redirects work
- [ ] CRUD operations complete successfully

### Phase 4 Complete When:
- [ ] E2E tests cover 3+ critical flows
- [ ] Tests run in CI/CD pipeline
- [ ] All tests passing consistently
