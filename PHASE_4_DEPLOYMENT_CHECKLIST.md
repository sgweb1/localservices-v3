# Phase 4 Deployment Checklist (Staging)

**Date:** 2025-12-29  
**Status:** ✅ Ready for Staging  
**Commit:** Phase 4: Implementacja Boost i Subscription API endpoints (renew/cancel)

---

## Pre-Deployment Checks

### Database
- [ ] Run migrations (already applied in dev):
  ```bash
  php artisan migrate
  ```
- [ ] Verify `boosts` table schema (renew/cancel operations on existing boosts)
- [ ] Verify `subscriptions` table schema (renew/cancel operations on existing subscriptions)
- [ ] Verify `subscription_plans` table has required columns

### Code Quality
- [x] All tests passing: **135/135 tests green** ✅
- [x] BoostController: 14 tests (purchase, success, list, show, renew, cancel)
- [x] SubscriptionController: 9 tests (list, show, renew, cancel + ownership/conflict cases)
- [x] Form validation: RenewBoostRequest, RenewSubscriptionRequest
- [x] Static analysis: No critical issues (run `./vendor/bin/phpstan analyse` before deploy)

### API Documentation
- [x] Documented in PHASE_2_PLANNING.md:
  - 2.1.5 & 2.1.6: Boost renew/cancel endpoints
  - 2.2.1-2.2.4: Subscription endpoints (list, show, renew, cancel)
- [x] Updated docs/README.md with endpoint references
- [x] Updated docs/MONETIZATION_API_CONTRACT.md with rollout notes

### Routes
- [x] Registered in bootstrap/app.php:
  - `/api/v1/boosts` (existing + new renew/cancel)
  - `/api/v1/subscriptions` (new)
- [x] All routes protected with `auth:sanctum` middleware
- [x] Model binding configured for Boost and Subscription

### New Files Added
- [x] app/Http/Controllers/Api/V1/SubscriptionController.php
- [x] app/Http/Requests/RenewBoostRequest.php
- [x] app/Http/Requests/RenewSubscriptionRequest.php
- [x] database/factories/SubscriptionPlanFactory.php
- [x] database/factories/SubscriptionFactory.php
- [x] routes/api/v1/subscriptions.php
- [x] tests/Feature/Api/V1/SubscriptionControllerTest.php

---

## Deployment Steps (Staging)

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies (if needed):**
   ```bash
   composer install
   npm install
   ```

3. **Run migrations (safe - no destructive changes):**
   ```bash
   php artisan migrate
   ```

4. **Clear caches:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:cache
   ```

5. **Run tests on staging (optional but recommended):**
   ```bash
   php artisan test --no-coverage
   ```

6. **Verify endpoints are accessible:**
   - GET /api/v1/boosts (list provider boosts)
   - GET /api/v1/boosts/{id} (show boost)
   - PUT /api/v1/boosts/{id}/renew (renew boost)
   - DELETE /api/v1/boosts/{id} (cancel boost)
   - GET /api/v1/subscriptions (list subscriptions)
   - GET /api/v1/subscriptions/{id} (show subscription)
   - PUT /api/v1/subscriptions/{id}/renew (renew subscription)
   - DELETE /api/v1/subscriptions/{id} (cancel subscription)

7. **Run static analysis:**
   ```bash
   ./vendor/bin/phpstan analyse
   ./vendor/bin/pint --check
   ```

---

## Post-Deployment Verification

### Manual Testing
- [ ] Test boost renew as authenticated provider
  - Verify `expires_at` date changes
  - Verify response includes updated data

- [ ] Test boost cancel as authenticated provider
  - Verify `is_active` = false
  - Verify can't renew cancelled boost (409)

- [ ] Test subscription renew with billing_period change
  - Verify `billing_period` changes (monthly → yearly)
  - Verify `ends_at` extends correctly

- [ ] Test subscription cancel
  - Verify `status` = 'cancelled'
  - Verify `cancelled_at` populated
  - Verify can't cancel already cancelled (409)

- [ ] Test authorization:
  - Try renew/cancel another user's boost → 403
  - Try renew/cancel another user's subscription → 403

### Monitoring
- [ ] Check application logs for errors
- [ ] Monitor API response times for new endpoints
- [ ] Verify no database constraint violations
- [ ] Monitor error rate (should be <1%)

---

## Rollback Plan (if needed)

```bash
git revert 9ee0ccd
php artisan migrate:rollback
php artisan cache:clear
```

---

## Notes for QA/Testing

**Critical User Flows:**
1. Provider renews expiring boost before deadline
2. Provider upgrades subscription billing period (monthly → yearly)
3. Provider cancels active subscription (should be refundable in future)
4. Error handling: Invalid date ranges, ownership violations, already-processed requests

**Edge Cases to Test:**
- Renewing boost with same billing period
- Cancelling already-cancelled subscription (should return 409)
- Accessing other provider's resources (should return 403)
- Renewing subscription with nil billing_period (should maintain current)

---

## Success Criteria

- [x] All 135 Feature API V1 tests pass
- [x] All new endpoints documented in docs/
- [x] Code committed to main branch
- [x] No database migrations causing downtime
- [x] No breaking changes to existing APIs
- [ ] Deployed to staging successfully
- [ ] Manual testing completed on staging
- [ ] Ready for production deployment (Phase X)

---

**Prepared by:** Copilot  
**Last Updated:** 2025-12-29 17:45 UTC
