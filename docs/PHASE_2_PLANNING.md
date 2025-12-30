# Phase 2 Planning — Controllers, API & Admin

**Planned:** Week 2 (January, 2026)  
**Status:** ⏳ PENDING - Ready to Start  
**Predecessor:** Phase 1 (✅ Complete)

---

## Overview

Phase 2 builds on the solid Phase 1 foundation. All backend infrastructure is ready:
- ✅ Database schema
- ✅ Payment integration (Stripe)
- ✅ Models with relations
- ✅ Services (BoostService, VisibilityService)

Now we need:
- API Controllers with proper validation
- Filament Admin Resources
- Feature tests for all endpoints
- Admin panel functionality

---

## Phase 2 Objectives

| Objective | Priority | Effort | Notes |
|-----------|----------|--------|-------|
| BoostController endpoints | CRITICAL | 1 day | 4 endpoints, validation, error handling |
| VisibilityController endpoints | HIGH | 1 day | Provider ranking, filtering, pagination |
| Form Request validation | HIGH | 0.5 day | Input validation for all endpoints |
| BoostResource (Filament) | HIGH | 1 day | Admin panel resource with filters/actions |
| Feature tests | HIGH | 1.5 day | Test all endpoints with real scenarios |
| API documentation | MEDIUM | 0.5 day | Update ARCHITECTURE.md with actual responses |
| Error handling | MEDIUM | 0.5 day | Consistent error format across API |
| **Total** | | **6 days** | Ready for Phase 3 after this |

---

## 2.1 BoostController Endpoints

### Deliverables

**Location:** `app/Http/Controllers/Api/V1/BoostController.php`

#### 2.1.1 Endpoint: POST /api/v1/boosts/purchase

**Purpose:** Initiate boost purchase with Stripe

**Request:**
```json
{
  "type": "city_boost",      // city_boost | spotlight
  "days": 7,                 // 7 | 14 | 30
  "city": "Warszawa",        // required for city_boost
  "category": "Elektrycy"    // required for spotlight
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Checkout session created",
  "data": {
    "checkout_url": "https://checkout.stripe.com/pay/cs_...",
    "session_id": "cs_test_...",
    "invoice_id": 123,
    "amount": 29.99,
    "currency": "PLN"
  }
}
```

**Validation Rules:**
- type: required|in:city_boost,spotlight
- days: required|in:7,14,30
- city: required_if:type,city_boost|string|max:100
- category: required_if:type,spotlight|string|max:100

**Authorization:** Authenticated provider only

**Implementation Steps:**
1. Create `StoreBoostRequest` form request
2. Validate input via form request
3. Call `BoostService::initiateBoostPurchase()`
4. Return checkout URL and session ID
5. Create feature test with valid data

---

#### 2.1.2 Endpoint: GET /api/v1/boosts/success?session_id=cs_...

**Purpose:** Confirm payment and activate boost

**Query Parameters:**
- `session_id` (required) - Stripe CheckoutSession ID

**Response (200):**
```json
{
  "success": true,
  "message": "Boost activated successfully",
  "data": {
    "id": 1,
    "type": "city_boost",
    "city": "Warszawa",
    "expires_at": "2026-01-05T15:30:00Z",
    "days_remaining": 7,
    "price": 29.99,
    "is_active": true
  }
}
```

**Error Cases:**
- Invalid session_id → 404
- Payment not completed → 402
- Authorization failed → 403

**Implementation Steps:**
1. Get session_id from query
2. Call `BoostService::confirmBoostAfterPayment($sessionId)`
3. Return activated boost details
4. Test payment confirmation flow

---

#### 2.1.3 Endpoint: GET /api/v1/boosts

**Purpose:** List provider's active boosts

**Query Parameters:**
- `per_page` (optional, default 20) - Items per page
- `page` (optional, default 1) - Page number
- `sort` (optional) - expires_at|price (with direction: expires_at_desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "city_boost",
      "city": "Warszawa",
      "expires_at": "2026-01-05T15:30:00Z",
      "days_remaining": 7,
      "price": 29.99,
      "is_active": true,
      "invoice": {
        "id": 123,
        "amount": 29.99,
        "status": "paid"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1
  }
}
```

**Authorization:** Authenticated provider only (see own boosts)

**Implementation Steps:**
1. Get current authenticated provider
2. Fetch boosts with pagination
3. Include invoice relationship
4. Sort by expires_at DESC
5. Test pagination and sorting

---

#### 2.1.4 Endpoint: GET /api/v1/boosts/{boostId}

**Purpose:** Get specific boost details

**Path Parameters:**
- `boostId` (required) - Boost ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "provider_id": 123,
    "type": "city_boost",
    "city": "Warszawa",
    "category": null,
    "expires_at": "2026-01-05T15:30:00Z",
    "days_remaining": 7,
    "price": 29.99,
    "is_active": true,
    "invoice": {
      "id": 123,
      "amount": 29.99,
      "status": "paid",
      "stripe_session_id": "cs_..."
    },
    "created_at": "2025-12-29T10:00:00Z"
  }
}
```

**Error Cases:**
- Boost not found → 404
- Authorization failed → 403

**Authorization:** Only boost owner can view

**Implementation Steps:**
1. Find boost or 404
2. Authorize user
3. Include invoice relationship
4. Test authorization on other user's boost

---

#### 2.1.5 Endpoint: PUT /api/v1/boosts/{boostId}/renew

**Purpose:** Przedłużenie aktywnego boost'a o wybraną liczbę dni

**Request:**
```json
{
  "days": 14   // 7 | 14 | 30
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Boost został przedłużony",
  "data": {
    "id": 1,
    "type": "city_boost",
    "city": "Warszawa",
    "category": null,
    "expires_at": "2026-01-15T15:30:00Z",
    "days_remaining": 17,
    "is_active": true
  }
}
```

**Error Cases:**
- 403: użytkownik nie jest właścicielem boost'a
- 409: brak aktywnego boost'a do przedłużenia (wygasł lub anulowany)

**Validation:** days required|in:7,14,30 (używa `RenewBoostRequest`)

**Authorization:** tylko właściciel boost'a (auth:sanctum)

**Implementation Steps:**
1. Walidacja przez `RenewBoostRequest`
2. Sprawdzenie ownership w kontrolerze
3. Wywołanie `BoostService::renewBoost()` z city/category boost'a
4. Zwrócenie zaktualizowanych danych boost'a
5. Testy: happy path, foreign owner 403, inactive boost 409

---

#### 2.1.6 Endpoint: DELETE /api/v1/boosts/{boostId}

**Purpose:** Anulowanie aktywnego boost'a (deaktywacja, pozostaje w historii)

**Response (200):**
```json
{
  "success": true,
  "message": "Boost został anulowany"
}
```

**Error Cases:**
- 403: użytkownik nie jest właścicielem boost'a
- 409: boost nie jest aktywny lub już anulowany

**Authorization:** tylko właściciel boost'a (auth:sanctum)

**Implementation Steps:**
1. Sprawdzenie ownership w kontrolerze
2. Wywołanie `BoostService::cancelBoost()`
3. Zwrócenie success lub 409 gdy brak aktywnego boost'a
4. Testy: happy path, foreign owner 403, inactive boost 409

---

## 2.2 SubscriptionController Endpoints

### Deliverables

**Location:** `app/Http/Controllers/Api/V1/SubscriptionController.php`

#### 2.2.1 Endpoint: GET /api/v1/subscriptions

**Purpose:** Pobierz aktywne i anulowane subskrypcje użytkownika

**Response (200):**
```json
{
  "success": true,
  "active_subscriptions": [
    {
      "id": 1,
      "plan_name": "Pro Plan",
      "billing_period": "monthly",
      "status": "active",
      "ends_at": "2026-01-10T10:00:00Z",
      "auto_renew": true
    }
  ]
}
```

**Authorization:** Authenticated user (auth:sanctum)

---

#### 2.2.2 Endpoint: GET /api/v1/subscriptions/{subscriptionId}

**Purpose:** Szczegóły konkretnej subskrypcji

**Error Cases:** 403: użytkownik nie jest właścicielem

**Authorization:** tylko właściciel (auth:sanctum)

---

#### 2.2.3 Endpoint: PUT /api/v1/subscriptions/{subscriptionId}/renew

**Purpose:** Przedłużenie aktywnej subskrypcji

**Request:**
```json
{
  "billing_period": "yearly"
}
```

**Error Cases:**
- 403: użytkownik nie jest właścicielem
- 409: subskrypcja nie jest aktywna

**Validation:** billing_period: nullable|in:monthly,yearly

**Authorization:** tylko właściciel (auth:sanctum)

---

#### 2.2.4 Endpoint: DELETE /api/v1/subscriptions/{subscriptionId}

**Purpose:** Anulowanie aktywnej subskrypcji

**Error Cases:**
- 403: użytkownik nie jest właścicielem
- 409: subskrypcja nie jest aktywna

**Authorization:** tylko właściciel (auth:sanctum)

---

### 2.1.5 Implementation Checklist

- [ ] Create `app/Http/Requests/StoreBoostRequest.php` with validation
- [ ] Create `BoostController` with 4 methods
- [ ] Add proper error handling and status codes
- [ ] Include relationships (invoice, provider)
- [ ] Test all validation scenarios
- [ ] Test authorization (own vs other provider)
- [ ] Test payment flow integration
- [ ] Add API documentation to ARCHITECTURE.md

**File to Create:**
```php
// app/Http/Controllers/Api/V1/BoostController.php
class BoostController extends Controller
{
    public function __construct(private BoostService $boostService) {}
    
    public function store(StoreBoostRequest $request): JsonResponse { ... }
    public function success(Request $request): JsonResponse { ... }
    public function index(): JsonResponse { ... }
    public function show(Boost $boost): JsonResponse { ... }
}
```

---

## 2.2 VisibilityController Endpoints

### Deliverables

**Location:** `app/Http/Controllers/Api/V1/VisibilityController.php`

#### 2.2.1 Endpoint: GET /api/v1/visibility/providers/{city}

**Purpose:** Get ranked providers for city with boosts

**Path Parameters:**
- `city` (required) - City name (Warszawa, Kraków, etc.)

**Query Parameters:**
- `category` (optional) - Filter by service category
- `page` (optional, default 1) - Page number
- `per_page` (optional, default 20) - Items per page
- `sort` (optional) - rank_score|trust_score (with direction)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "provider_id": 1,
      "name": "Jan Nowak",
      "city": "Warszawa",
      "trust_score": 85,
      "subscription_plan": "pro",
      "has_active_boost": true,
      "boost_expires_at": "2026-01-05T15:30:00Z",
      "rank_score": 425.50,
      "position": 1
    },
    {
      "provider_id": 2,
      "name": "Maria Kowalski",
      "city": "Warszawa",
      "trust_score": 72,
      "subscription_plan": null,
      "has_active_boost": false,
      "boost_expires_at": null,
      "rank_score": 86.00,
      "position": 2
    }
  ],
  "pagination": {
    "total": 142,
    "per_page": 20,
    "current_page": 1,
    "last_page": 8
  }
}
```

**Sorting Logic:**
1. First: Active boost (expires_at DESC)
2. Then: rank_score DESC
3. Then: trust_score DESC

**Query Optimization:**
- Use VisibilityService::rankProviders()
- Eager load boosts, subscriptions
- Cache results for 5 minutes

**Implementation Steps:**
1. Validate city parameter
2. Call VisibilityService::rankProviders($city, $category)
3. Apply pagination
4. Return ranked results with positions

---

### 2.2.2 Implementation Checklist

- [ ] Create `VisibilityController` with index method
- [ ] Implement ranking with correct sorting
- [ ] Add filtering by category
- [ ] Add pagination with correct page calculation
- [ ] Cache results for performance
- [ ] Test sorting order (boosts first)
- [ ] Test category filtering
- [ ] Test performance (no N+1 queries)

---

## 2.3 Form Request Validation

### Files to Create

#### StoreBoostRequest
```php
// app/Http/Requests/StoreBoostRequest.php
class StoreBoostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isProvider();
    }
    
    public function rules(): array
    {
        return [
            'type' => 'required|in:city_boost,spotlight',
            'days' => 'required|in:7,14,30',
            'city' => 'required_if:type,city_boost|string|max:100',
            'category' => 'required_if:type,spotlight|string|max:100',
        ];
    }
    
    public function messages(): array
    {
        return [
            'city.required_if' => 'Miasto wymagane dla City Boost',
            'category.required_if' => 'Kategoria wymagana dla Spotlight',
        ];
    }
}
```

### Validation Checklist

- [ ] Type validation (city_boost|spotlight)
- [ ] Days validation (7|14|30)
- [ ] City conditional required
- [ ] Category conditional required
- [ ] Custom error messages in Polish
- [ ] Authorization check (provider only)

---

## 2.4 Filament Admin Resources

### 2.4.1 BoostResource

**Location:** `app/Filament/Resources/BoostResource.php`

**Features:**
- List all boosts with filters
- View boost details
- Edit boost (admin only)
- Delete boost (with confirmation)
- Filter by: type, city, is_active, expires_at range
- Sort by: created_at, expires_at, price
- Bulk actions: Deactivate, Delete

**Columns:**
```php
TextColumn::make('provider.name')->searchable(),
TextColumn::make('type')->badge(),
TextColumn::make('city'),
DateTimeColumn::make('expires_at')->formatStateUsing(fn($state) => $state->diffForHumans()),
MoneyColumn::make('price')->currency('PLN'),
BooleanColumn::make('is_active'),
TextColumn::make('invoice.status')->badge(),
```

**Filters:**
```php
SelectFilter::make('type')->options(['city_boost' => 'City', 'spotlight' => 'Spotlight']),
SelectFilter::make('city')->options([...cities...]),
TernaryFilter::make('is_active'),
DateRangeFilter::make('expires_at'),
```

**Form:**
- provider_id (readonly - set on creation)
- type (select)
- city (text)
- category (text, nullable)
- expires_at (date picker)
- price (currency)
- is_active (toggle)

**Permissions:**
- view: Admin only
- create: Admin only
- edit: Admin only
- delete: Admin only

### 2.4.2 PlatformInvoiceResource

**Location:** `app/Filament/Resources/PlatformInvoiceResource.php`

**Features:**
- List all invoices
- View invoice details with payment info
- Filter by: status, currency, created_at range
- Sort by: amount, created_at, status
- Export invoices (optional)

**Columns:**
```php
TextColumn::make('provider.name')->searchable(),
MoneyColumn::make('amount')->currency('PLN'),
BadgeColumn::make('status'),
TextColumn::make('stripe_session_id'),
TextColumn::make('payment_details'),
DateTimeColumn::make('created_at')->dateTime(),
```

**Filters:**
```php
SelectFilter::make('status')->options([...statuses...]),
DateRangeFilter::make('created_at'),
```

### 2.4.3 Implementation Checklist

- [ ] Create BoostResource with all fields
- [ ] Create PlatformInvoiceResource
- [ ] Add navigation icons and labels
- [ ] Test all filters work correctly
- [ ] Test sorting works correctly
- [ ] Add authorization policies
- [ ] Test admin can CRUD resources
- [ ] Test non-admin cannot access
- [ ] Add to Filament navigation

---

## 2.5 Feature Tests

### Test Files to Create

**Location:** `tests/Feature/Api/V1/`

#### BoostControllerTest
```php
class BoostControllerTest extends TestCase
{
    use RefreshDatabase;
    
    protected User $provider;
    
    public function test_provider_can_purchase_city_boost(): void { ... }
    public function test_provider_can_purchase_spotlight(): void { ... }
    public function test_purchase_validates_required_fields(): void { ... }
    public function test_purchase_validates_conditional_fields(): void { ... }
    public function test_provider_can_confirm_payment(): void { ... }
    public function test_provider_can_list_boosts(): void { ... }
    public function test_provider_can_view_own_boost(): void { ... }
    public function test_provider_cannot_view_other_boost(): void { ... }
    public function test_customer_cannot_purchase_boost(): void { ... }
    public function test_unauthenticated_cannot_purchase(): void { ... }
}
```

#### VisibilityControllerTest
```php
class VisibilityControllerTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_get_providers_for_city(): void { ... }
    public function test_providers_sorted_by_active_boost_first(): void { ... }
    public function test_providers_sorted_by_rank_score(): void { ... }
    public function test_filter_by_category(): void { ... }
    public function test_pagination_works(): void { ... }
    public function test_active_boosts_appear_first(): void { ... }
    public function test_boost_expiry_affects_sorting(): void { ... }
}
```

### Test Implementation Checklist

- [ ] Mock Stripe API for payment tests
- [ ] Test valid request scenarios
- [ ] Test all validation error cases
- [ ] Test authorization (own vs other)
- [ ] Test sorting order (boosts first)
- [ ] Test pagination
- [ ] Test error responses
- [ ] Test status codes (200, 201, 403, 404, 422)
- [ ] Achieve 90%+ coverage

---

## 2.6 Error Handling & Response Format

### Standard Response Format

**Success (2xx):**
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Full stack trace (only in debug mode)"
}
```

### Implementation

**Create ApiResponse Trait:**
```php
// app/Http/Traits/ApiResponse.php
trait ApiResponse
{
    protected function successResponse($data, string $message = 'Success', int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }
    
    protected function errorResponse(string $message, int $code = 400, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
```

---

## Implementation Timeline

```
Day 1: BoostController + Form Requests
  - Create StoreBoostRequest
  - Implement 4 endpoints
  - Basic error handling
  - Create first tests

Day 2: VisibilityController + Tests
  - Create VisibilityController
  - Implement ranking endpoint
  - Complete BoostController tests
  - Add VisibilityController tests

Day 3: Filament Resources
  - Create BoostResource
  - Create PlatformInvoiceResource
  - Add filters and actions
  - Test admin panel

Day 4: Polish & Documentation
  - Complete all tests
  - Fix any issues
  - Update ARCHITECTURE.md with actual endpoints
  - Add API documentation examples

Day 5: Code Review & Optimization
  - Fix review comments
  - Optimize queries (N+1 prevention)
  - Add caching if needed
  - Final testing
```

---

## Success Criteria

✅ **Must Have:**
- [x] 4 BoostController endpoints implemented
- [x] VisibilityController with ranking
- [x] Form request validation
- [x] BoostResource & PlatformInvoiceResource in Filament
- [x] Feature tests for all endpoints
- [x] 90%+ test coverage
- [x] No N+1 queries

✅ **Nice to Have:**
- [ ] API endpoint caching
- [ ] Pagination optimization
- [ ] Bulk actions in Filament
- [ ] Export functionality
- [ ] Advanced filtering

---

## Dependencies & Prerequisites

**From Phase 1:**
- ✅ Boost model
- ✅ PlatformInvoice model
- ✅ BoostService
- ✅ VisibilityService
- ✅ Stripe integration
- ✅ Database migrations

**Need to Create (Phase 2):**
- [ ] StoreBoostRequest form request
- [ ] BoostController
- [ ] VisibilityController
- [ ] BoostResource
- [ ] PlatformInvoiceResource
- [ ] Feature tests
- [ ] ApiResponse trait

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| N+1 queries | Medium | High | Eager load all relations, test with debugbar |
| Authorization bypass | Low | Critical | Use policies, test cross-user access |
| Validation gaps | Medium | Medium | Comprehensive form request, test edge cases |
| Filament integration issues | Low | Medium | Test admin panel thoroughly |
| Performance (100+ providers) | Medium | Medium | Cache visibility results, paginate properly |

---

## Next Phase (Phase 3)

After Phase 2 is complete:
- Frontend Vue components for boost purchase UI
- Integration with Stripe Checkout redirect
- Success/cancel page handling
- Display active boosts with countdown timers
- Real-time notifications via WebSocket

---

# Phase 5 — Admin Resources & Management (CURRENT)

**Status:** ✅ COMPLETE (December 29, 2025)  
**Predecessor:** Phase 4 ✅  
**Effort:** 1 day

---

## Phase 5 Overview

Utrzymanie i rozszerzenie Admin Panelu Filament z zaawansowanymi akcjami zarządzania.

**Deliverables:**
- ✅ SubscriptionResource (nowe) z CRUD operations
- ✅ Boost renew/cancel actions w Filament (GUI)
- ✅ Subscription renew/cancel actions w Filament (GUI)
- ✅ Advanced filtering i sorting
- ✅ Livewire tests dla wszystkich resources

### 5.1 SubscriptionResource (NEW)

**File:** `app/Filament/Resources/SubscriptionResource.php`

**Features:**
- Pełny CRUD (Create, Read, Update, Delete)
- Soft-delete support (restore/force-delete)
- Filtry: status, billing_period, date range, trashed records
- Kolumny: User, Plan, Billing Period, Status, Expiration, Auto-renew
- Sortowanie domyślne: `ends_at DESC` (najpierw wygasające)

**Pages:**
- ListSubscriptions
- CreateSubscription
- EditSubscription

### 5.2 Boost Renew/Cancel Actions (Enhanced)

**Location:** `app/Filament/Resources/BoostResource.php`

**New Table Actions:**
- **Renew** (icon: arrow-path, green)
  - Visible only if boost is active (`is_active = true`)
  - Form: Select period (7, 14, 30 days)
  - Action: Update `expires_at` = now() + X days
  - Notification: "Boost odnowiony"

- **Cancel** (icon: x-mark, red)
  - Visible only if boost is active
  - Confirmation required
  - Action: Set `is_active = false`
  - Notification: "Boost anulowany"

**Result:** Admins can quickly manage boosts without API calls

### 5.3 Subscription Renew/Cancel Actions (NEW)

**Location:** `app/Filament/Resources/SubscriptionResource.php`

**New Table Actions:**
- **Renew** (icon: arrow-path, green)
  - Visible only if status = 'active'
  - Form: Select billing_period (monthly, yearly)
  - Action: Change period + extend ends_at
  - Notification: "Subskrypcja odnowiona"

- **Cancel** (icon: x-mark, red)
  - Visible only if status = 'active'
  - Form: Textarea for cancellation_reason
  - Confirmation modal
  - Action: Set status='cancelled', populate cancelled_at + reason
  - Notification: "Subskrypcja anulowana"

**Result:** Full subscription lifecycle management from admin panel

### 5.4 Filament Tests

**Location:** `tests/Filament/`

**Test Files:**
- `BoostResourceTest.php` (10 tests)
  - Access, list, renew, cancel, filters, sorting, edit, delete
- `SubscriptionResourceTest.php` (11 tests)
  - Access, list, create, renew, cancel, filters, sorting, edit, delete, restore
- `PlatformInvoiceResourceTest.php` (9 tests)
  - Access, list, view, filters, sorting, copy Stripe ID, edit restrictions

**Total Filament Tests:** 30 new tests

### 5.5 Features Breakdown

| Feature | Status | Details |
|---------|--------|---------|
| SubscriptionResource CRUD | ✅ | Create, edit, delete, restore |
| Boost Renew Action | ✅ | Form + confirmation |
| Boost Cancel Action | ✅ | Form + confirmation + notification |
| Subscription Renew Action | ✅ | Change period + extend date |
| Subscription Cancel Action | ✅ | Reason tracking |
| Filament Tests | ✅ | 30 comprehensive tests |
| Filters & Sorting | ✅ | All resources support advanced filtering |
| Soft Deletes | ✅ | Subscription resource supports restore |

---

## Implementation Details

### Files Created/Modified

**New Files:**
- `app/Filament/Resources/SubscriptionResource.php`
- `app/Filament/Resources/SubscriptionResource/Pages/ListSubscriptions.php`
- `app/Filament/Resources/SubscriptionResource/Pages/CreateSubscription.php`
- `app/Filament/Resources/SubscriptionResource/Pages/EditSubscription.php`
- `tests/Filament/BoostResourceTest.php`
- `tests/Filament/SubscriptionResourceTest.php`
- `tests/Filament/PlatformInvoiceResourceTest.php`

**Modified Files:**
- `app/Filament/Resources/BoostResource.php` (added renew/cancel actions)
- `app/Filament/Resources/PlatformInvoiceResource.php` (no changes, already complete)

### Code Examples

**Renew Action (Boost/Subscription):**
```php
Tables\Actions\Action::make('renew')
    ->label('Odnów')
    ->icon('heroicon-m-arrow-path')
    ->color('success')
    ->visible(fn ($record) => $record->is_active)  // or status = 'active'
    ->form([
        Forms\Components\Select::make('days')  // or 'billing_period'
            ->options([...])
            ->required(),
    ])
    ->action(function ($record, array $data) {
        $record->update(['expires_at' => now()->addDays($data['days'])]);
        Notification::make()->title('Odnowiono')->success()->send();
    }),
```

**Cancel Action:**
```php
Tables\Actions\Action::make('cancel')
    ->label('Anuluj')
    ->icon('heroicon-m-x-mark')
    ->color('danger')
    ->visible(fn ($record) => $record->is_active)
    ->form([
        Forms\Components\Textarea::make('reason')
            ->label('Powód'),
    ])
    ->requiresConfirmation()
    ->action(function ($record, array $data) {
        $record->update([
            'is_active' => false,
            'cancelled_at' => now(),
        ]);
        Notification::make()->success()->send();
    }),
```

---

## Test Coverage

**Filament Tests:** 30 new tests
- 10 Boost resource tests
- 11 Subscription resource tests
- 9 Platform Invoice tests

**Test Command:**
```bash
php artisan test tests/Filament/ --no-coverage
```

**All Tests:** 135+ (Feature API) + 30 (Filament) = **165+ total**

---

## Next Phase (Phase 6)

Planned priorities:
- [ ] Visibility/Ranking API improvements
- [ ] Provider dashboard widgets
- [ ] Analytics & reporting
- [ ] Webhook event handling
- [ ] Real-time updates via Reverb WebSocket

---

**Created:** 2025-12-29  
**Status:** ✅ COMPLETE  
**Owner:** Dev Team  
**Committed:** Phase 4 + Phase 5 combined
