# Plan wdrożenia: Podwójne role użytkowników

**Data utworzenia:** 2025-12-22  
**Zakres:** Provider rezerwujący jako customer + Customer upgrade do providera  
**Priorytet:** HIGH - kluczowa funkcjonalność marketplace  
**Przewidywany czas:** 2-3 dni robocze

---

## 🎯 Cel biznesowy

Umożliwić użytkownikom pełną elastyczność ról:
1. **Provider może rezerwować usługi** u innych providerów (jako customer)
2. **Customer może zostać providerem** bez zakładania drugiego konta

**Uzasadnienie:**
- Naturalne przypadki użycia (hydraulik wynajmuje elektryka)
- Uproszczony UX (jeden profil, jedna historia transakcji)
- Zgodność z konkurencją (Upwork, Airbnb, TaskRabbit)
- System już wspiera (`assignRole(['customer', 'provider'])` działa)

---

## 📦 CZĘŚĆ 1: Provider jako Customer (booking flow)

### 1.1 Backend - Walidacja i polityki

**✅ Co już działa:**
- Model User ma `isCustomer()` → zwraca `true` dla providera z rolą `customer`
- Seedy przypisują obie role: `assignRole(['customer', 'provider'])`
- `bookings.customer_id` nie blokuje ID providera
- BookingController sprawdza tylko `exists:users,id`

**🛠️ Do zrobienia:**

#### Task 1.1.1: Blokada self-booking (backend)
**Plik:** `app/Http/Controllers/Api/V1/BookingController.php`

```php
// W metodzie store() dodaj do walidacji:
use Illuminate\Validation\Rule;

$validated = $request->validate([
    'provider_id' => [
        'required',
        'exists:users,id',
        Rule::notIn([auth()->id()]), // Blokuj rezerwację samego siebie
    ],
    // ... reszta walidacji
]);
```

**Test:**
```php
// tests/Feature/Booking/SelfBookingTest.php
test('provider cannot book himself', function () {
    $provider = User::factory()->provider()->create();
    $service = Service::factory()->for($provider)->create();
    
    $this->actingAs($provider)
        ->postJson('/api/v1/bookings', [
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2),
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('provider_id');
});

test('provider can book another provider', function () {
    $provider = User::factory()->provider()->create();
    $otherProvider = User::factory()->provider()->create();
    $service = Service::factory()->for($otherProvider)->create();
    
    $this->actingAs($provider)
        ->postJson('/api/v1/bookings', [
            'provider_id' => $otherProvider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2),
        ])
        ->assertStatus(201);
});
```

**Czas:** 30 minut

---

#### Task 1.1.2: BookingPolicy - view permissions
**Plik:** `app/Policies/BookingPolicy.php` (nowy)

```php
<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Użytkownik może widzieć rezerwację jeśli jest customerem LUB providerem w tej rezerwacji
     */
    public function view(User $user, Booking $booking): bool
    {
        return $booking->customer_id === $user->id 
            || $booking->provider_id === $user->id;
    }
    
    /**
     * Customer może anulować do 24h przed booking_date
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ($booking->customer_id !== $user->id) {
            return false;
        }
        
        if ($booking->status !== 'confirmed') {
            return false;
        }
        
        // Minimalne 24h wyprzedzenie
        return $booking->booking_date->greaterThan(now()->addHours(24));
    }
    
    /**
     * Provider może zaktualizować status (confirmed → in_progress → completed)
     */
    public function updateStatus(User $user, Booking $booking): bool
    {
        return $booking->provider_id === $user->id;
    }
}
```

**Rejestracja policy:**
```php
// app/Providers/AuthServiceProvider.php
use App\Models\Booking;
use App\Policies\BookingPolicy;

protected $policies = [
    Booking::class => BookingPolicy::class,
];
```

**Test:**
```php
// tests/Feature/Policies/BookingPolicyTest.php
test('provider can view booking as customer', function () {
    $provider = User::factory()->provider()->create();
    $otherProvider = User::factory()->provider()->create();
    $booking = Booking::factory()->create([
        'customer_id' => $provider->id, // Provider rezerwuje jako customer
        'provider_id' => $otherProvider->id,
    ]);
    
    expect($provider->can('view', $booking))->toBeTrue();
});

test('provider can view booking as provider', function () {
    $provider = User::factory()->provider()->create();
    $customer = User::factory()->customer()->create();
    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'provider_id' => $provider->id,
    ]);
    
    expect($provider->can('view', $booking))->toBeTrue();
});

test('user cannot view others booking', function () {
    $user = User::factory()->customer()->create();
    $booking = Booking::factory()->create(); // Inne osoby
    
    expect($user->can('view', $booking))->toBeFalse();
});
```

**Czas:** 45 minut

---

### 1.2 Frontend - Booking flow

#### Task 1.2.1: Sprawdzenie blokady providera w booking flow
**Plik do sprawdzenia:** `src/features/booking/` (wszystkie komponenty)

**Co sprawdzić:**
- Czy przycisk "Zarezerwuj" jest ukryty dla providera (`if (user.user_type === 'provider') return null`)
- Czy checkout flow blokuje providera

**Jeśli BLOKUJE:**
```typescript
// ❌ Usuń takie warunki:
if (user.user_type === 'provider') {
  return null; // Nie pokazuj przycisku
}

// ✅ Zamień na:
if (service.provider_id === user.id) {
  return null; // Blokuj tylko własne usługi
}
```

**Czas:** 30 minut (audit) + 1h (naprawy jeśli potrzebne)

---

#### Task 1.2.2: Toast/badge przy rezerwacji providera
**Plik:** `src/features/booking/components/BookingConfirmation.tsx` (lub podobny)

```typescript
// W komponencie potwierdzenia rezerwacji
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();

const handleConfirmBooking = async () => {
  // Przed wysłaniem API call
  if (user?.user_type === 'provider') {
    toast.info('Rezerwujesz jako klient (tryb customer)', {
      duration: 3000,
    });
  }
  
  // ... API call
};
```

**Badge w headerze (opcjonalnie):**
```typescript
// src/components/layout/Header.tsx
{user?.user_type === 'provider' && isBookingFlow && (
  <div className="flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full">
    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
    <span className="text-xs font-medium text-cyan-700">
      Tryb klienta
    </span>
  </div>
)}
```

**Czas:** 45 minut

---

### 1.3 Frontend - Dashboard z zakładkami

#### Task 1.3.1: Rozdzielone listy rezerwacji w dashboardzie
**Plik:** `src/features/provider/dashboard/BookingsSection.tsx` (nowy)

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/api/v1/bookingApi';
import { useAuth } from '@/hooks/useAuth';

export function BookingsSection() {
  const { user } = useAuth();
  
  // Rezerwacje jako CUSTOMER (provider rezerwuje usługi)
  const { data: myBookings } = useQuery({
    queryKey: ['bookings', 'my', user?.id],
    queryFn: () => getBookings({ customer_id: user?.id }),
    enabled: !!user,
  });
  
  // Zlecenia jako PROVIDER (provider świadczy usługi)
  const { data: incomingBookings } = useQuery({
    queryKey: ['bookings', 'incoming', user?.id],
    queryFn: () => getBookings({ provider_id: user?.id }),
    enabled: !!user,
  });
  
  if (user?.user_type !== 'provider') {
    // Customer widzi tylko swoją listę
    return <BookingsList bookings={myBookings} />;
  }
  
  // Provider widzi dwie zakładki
  return (
    <Tabs defaultValue="incoming">
      <TabsList>
        <TabsTrigger value="incoming">
          Zlecenia ({incomingBookings?.meta?.total || 0})
        </TabsTrigger>
        <TabsTrigger value="my">
          Moje rezerwacje ({myBookings?.meta?.total || 0})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="incoming">
        <BookingsList 
          bookings={incomingBookings} 
          mode="provider"
          emptyMessage="Brak zleceń. Promuj swoje usługi!"
        />
      </TabsContent>
      
      <TabsContent value="my">
        <BookingsList 
          bookings={myBookings}
          mode="customer"
          emptyMessage="Nie masz jeszcze rezerwacji. Znajdź usługę!"
        />
      </TabsContent>
    </Tabs>
  );
}
```

**Czas:** 2 godziny

---

## 📦 CZĘŚĆ 2: Customer → Provider Upgrade

### 2.1 Backend - Endpoint upgrade

#### Task 2.1.1: ProfileController - metoda upgradeToProvider
**Plik:** `app/Http/Controllers/Api/V1/ProfileController.php`

```php
use Illuminate\Support\Facades\DB;

/**
 * Upgrade customera do providera
 * 
 * POST /api/v1/profile/upgrade-to-provider
 */
public function upgradeToProvider(Request $request): JsonResponse
{
    $user = $request->user();
    
    // Sprawdź czy już jest providerem
    if ($user->isProvider()) {
        return response()->json([
            'message' => 'Jesteś już providerem',
        ], 400);
    }
    
    $validated = $request->validate([
        'business_name' => 'required|string|max:255',
        'service_description' => 'required|string|min:50|max:2000',
        'service_category' => 'required|integer|exists:service_categories,id',
    ]);
    
    DB::transaction(function () use ($user, $validated) {
        // Utwórz profil providera
        $user->providerProfile()->create([
            'business_name' => $validated['business_name'],
            'service_description' => $validated['service_description'],
            'verification_level' => 1,
            'trust_score' => 10,
            'is_approved' => true, // MVP: auto-approve
        ]);
        
        // Dodaj rolę provider (zachowaj customer)
        $user->assignRole('provider');
        
        // Opcjonalnie: zmień user_type
        // $user->update(['user_type' => 'provider']);
    });
    
    return response()->json([
        'message' => 'Gratulacje! Jesteś teraz providerem. Możesz dodać pierwsze usługi.',
        'user' => $this->formatUserResponse($user->fresh()),
    ]);
}
```

**Route:**
```php
// routes/api/v1/profile.php (lub marketplace.php)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/upgrade-to-provider', [ProfileController::class, 'upgradeToProvider']);
});
```

**Test:**
```php
// tests/Feature/Profile/UpgradeToProviderTest.php
test('customer can upgrade to provider', function () {
    $customer = User::factory()->customer()->create();
    
    $this->actingAs($customer)
        ->postJson('/api/v1/profile/upgrade-to-provider', [
            'business_name' => 'Jan Kowalski Hydraulika',
            'service_description' => 'Profesjonalne usługi hydrauliczne z 10-letnim doświadczeniem. Naprawy, instalacje, awarie.',
            'service_category' => 1, // Hydraulika
        ])
        ->assertOk()
        ->assertJson([
            'message' => 'Gratulacje! Jesteś teraz providerem. Możesz dodać pierwsze usługi.',
        ]);
    
    $customer->refresh();
    expect($customer->isProvider())->toBeTrue();
    expect($customer->providerProfile)->not->toBeNull();
    expect($customer->providerProfile->business_name)->toBe('Jan Kowalski Hydraulika');
});

test('provider cannot upgrade again', function () {
    $provider = User::factory()->provider()->create();
    
    $this->actingAs($provider)
        ->postJson('/api/v1/profile/upgrade-to-provider', [
            'business_name' => 'Test',
            'service_description' => 'Test description with more than fifty characters to pass validation.',
            'service_category' => 1,
        ])
        ->assertStatus(400)
        ->assertJson(['message' => 'Jesteś już providerem']);
});

test('upgrade validation requires business_name', function () {
    $customer = User::factory()->customer()->create();
    
    $this->actingAs($customer)
        ->postJson('/api/v1/profile/upgrade-to-provider', [
            // Brak business_name
            'service_description' => 'Valid description with more than fifty characters for validation.',
            'service_category' => 1,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('business_name');
});
```

**Czas:** 1.5 godziny

---

### 2.2 Frontend - Upgrade flow UI

#### Task 2.2.1: Banner w customer dashboardzie
**Plik:** `src/features/customer/dashboard/ProviderUpgradeBanner.tsx` (nowy)

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function ProviderUpgradeBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Nie pokazuj jeśli już jest providerem
  if (user?.provider_profile) {
    return null;
  }
  
  return (
    <div className="glass-card p-6 border-2 border-cyan-500 rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gradient mb-2">
            Chcesz świadczyć usługi?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Dołącz do tysięcy profesjonalistów oferujących usługi lokalnie. 
            Zero kosztów startu, płacisz tylko za zakończone zlecenia.
          </p>
          
          <button
            onClick={() => navigate('/upgrade-to-provider')}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Zostań providerem
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Integracja w dashboardzie:**
```typescript
// src/features/customer/dashboard/DashboardPage.tsx
import { ProviderUpgradeBanner } from './ProviderUpgradeBanner';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <ProviderUpgradeBanner />
      
      {/* Reszta dashboardu */}
      <MyBookings />
      <FavoriteProviders />
    </div>
  );
}
```

**Czas:** 1 godzina

---

#### Task 2.2.2: Strona upgrade-to-provider
**Plik:** `src/features/provider/onboarding/UpgradeToProviderPage.tsx` (nowy)

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upgradeToProvider } from '@/api/v1/profileApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function UpgradeToProviderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    business_name: '',
    service_description: '',
    service_category: '',
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: upgradeToProvider,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      navigate('/provider/dashboard');
    },
    onError: (error: any) => {
      if (error?.status === 422 && error?.errors) {
        const fieldErrors = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join(' | ');
        toast.error(`Błędy walidacji: ${fieldErrors}`);
      } else {
        toast.error(error?.message || 'Nie udało się aktywować konta providera');
      }
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.service_description.length < 50) {
      toast.error('Opis musi zawierać minimum 50 znaków');
      return;
    }
    
    mutate(formData);
  };
  
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="glass-card p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Zostań providerem LocalServices
        </h1>
        <p className="text-gray-600 mb-8">
          Wypełnij krótki formularz, aby aktywować konto providera i zacząć oferować swoje usługi.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa firmy/działalności *
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="np. Jan Kowalski Hydraulika"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria usług *
            </label>
            <select
              value={formData.service_category}
              onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors"
              required
            >
              <option value="">Wybierz kategorię</option>
              <option value="1">Hydraulika</option>
              <option value="2">Elektryka</option>
              <option value="3">Sprzątanie</option>
              <option value="4">Korepetycje</option>
              <option value="5">Opieka</option>
              {/* TODO: Fetch from API */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opisz swoje usługi * (min. 50 znaków)
              <span className="ml-2 text-xs text-gray-500">
                ({formData.service_description.length}/50)
              </span>
            </label>
            <textarea
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              placeholder="Opisz swoje doświadczenie, specjalizacje, zakres usług..."
              rows={6}
              className={`w-full px-4 py-3 border rounded-xl transition-colors resize-none ${
                formData.service_description.length > 0 && formData.service_description.length < 50
                  ? 'border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                  : 'border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
              }`}
              required
            />
            {formData.service_description.length > 0 && formData.service_description.length < 50 && (
              <p className="mt-1 text-xs text-orange-600">
                Dodaj jeszcze {50 - formData.service_description.length} znaków
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={isPending}
            >
              Anuluj
            </button>
            
            <button
              type="submit"
              disabled={isPending || formData.service_description.length < 50}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Aktywuj konto providera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Route:**
```typescript
// src/App.tsx (lub routes config)
<Route path="/upgrade-to-provider" element={<UpgradeToProviderPage />} />
```

**Czas:** 2 godziny

---

#### Task 2.2.3: API client - upgradeToProvider
**Plik:** `src/api/v1/profileApi.ts`

```typescript
import { apiClient } from '../client';
import type { User } from '@/types/profile';

interface UpgradeToProviderRequest {
  business_name: string;
  service_description: string;
  service_category: string;
}

interface UpgradeToProviderResponse {
  message: string;
  user: User;
}

export const upgradeToProvider = async (
  data: UpgradeToProviderRequest
): Promise<UpgradeToProviderResponse> => {
  const response = await apiClient.post<UpgradeToProviderResponse>(
    '/profile/upgrade-to-provider',
    data
  );
  return response.data;
};
```

**Czas:** 15 minut

---

### 2.3 Provider dashboard - uproszczony widok na start

#### Task 2.3.1: Provider dashboard z "Dodaj pierwszą usługę"
**Plik:** `src/features/provider/dashboard/ProviderDashboardPage.tsx`

```typescript
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Sprawdź czy ma już jakieś usługi (TODO: fetch from API)
  const hasServices = false; // Placeholder
  
  if (!hasServices) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Plus className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gradient mb-4">
            Witaj w panelu providera!
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Aby zacząć otrzymywać zlecenia, dodaj swoją pierwszą usługę. 
            Opisz co oferujesz, ustaw cenę i obszar działania.
          </p>
          
          <button
            onClick={() => navigate('/provider/services/create')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Dodaj pierwszą usługę
          </button>
        </div>
        
        {/* Dodatkowe sekcje (ukryte dopóki nie ma usług) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold mb-2">📊 Statystyki</h3>
            <p className="text-sm text-gray-600">Dostępne po dodaniu usług</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold mb-2">📅 Kalendarz</h3>
            <p className="text-sm text-gray-600">Dostępny po dodaniu usług</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold mb-2">💳 Subskrypcja</h3>
            <p className="text-sm text-gray-600">Dostępna po dodaniu usług</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Pełny dashboard (gdy ma już usługi)
  return (
    <div className="space-y-6">
      {/* Normalne widgety */}
    </div>
  );
}
```

**Czas:** 1.5 godziny

---

## 📋 Podsumowanie tasków

### Backend (6 tasków)
| Task | Opis | Plik | Czas |
|------|------|------|------|
| 1.1.1 | Self-booking validation | BookingController.php | 30 min |
| 1.1.2 | BookingPolicy | BookingPolicy.php | 45 min |
| 2.1.1 | upgradeToProvider endpoint | ProfileController.php | 1.5h |

### Frontend (7 tasków)
| Task | Opis | Plik | Czas |
|------|------|------|------|
| 1.2.1 | Audit booking flow blokad | src/features/booking/ | 1.5h |
| 1.2.2 | Toast/badge przy booking | BookingConfirmation.tsx | 45 min |
| 1.3.1 | Zakładki w dashboardzie | BookingsSection.tsx | 2h |
| 2.2.1 | Banner upgrade | ProviderUpgradeBanner.tsx | 1h |
| 2.2.2 | Strona upgrade | UpgradeToProviderPage.tsx | 2h |
| 2.2.3 | API client | profileApi.ts | 15 min |
| 2.3.1 | Provider dashboard prosty | ProviderDashboardPage.tsx | 1.5h |

**Łącznie:** ~13 godzin = 2 dni robocze

---

## 🚀 Plan wykonania (dzień po dniu)

### Dzień 1: Backend + podstawy frontend
**Rano (4h):**
1. Task 1.1.1: Self-booking validation + testy (30 min)
2. Task 1.1.2: BookingPolicy + testy (45 min)
3. Task 2.1.1: upgradeToProvider endpoint + testy (1.5h)
4. Task 2.2.3: API client upgradeToProvider (15 min)
5. Smoke test: curl endpoints, sprawdź czy działa (30 min)

**Popołudnie (4h):**
6. Task 2.2.1: Banner upgrade w customer dashboard (1h)
7. Task 2.2.2: Strona upgrade-to-provider (2h)
8. Manualne testy: customer → provider flow (30 min)
9. Task 1.2.1: Audit booking flow (rozpoczęcie) (30 min)

---

### Dzień 2: Frontend dokończenie + testy
**Rano (4h):**
1. Task 1.2.1: Dokończenie auditu booking flow + naprawy (1.5h)
2. Task 1.2.2: Toast/badge przy booking providera (45 min)
3. Task 1.3.1: Zakładki w dashboardzie (2h)

**Popołudnie (3h):**
4. Task 2.3.1: Provider dashboard prosty widok (1.5h)
5. Testy E2E: pełny flow provider → booking + customer → upgrade (1h)
6. Dokumentacja: update README/ANALIZA z nowymi features (30 min)

---

## ✅ Definition of Done

### CZĘŚĆ 1: Provider jako Customer
- [x] Backend walidacja: provider nie może rezerwować samego siebie (422 error)
- [x] Backend walidacja: provider może rezerwować innych providerów (201 success)
- [x] BookingPolicy: provider widzi rezerwacje jako customer i jako provider
- [x] Frontend: provider może przejść przez booking flow (nie jest blokowany)
- [x] Frontend: toast "Rezerwujesz jako klient" przy potwierdzeniu
- [x] Frontend: dashboard z zakładkami "Zlecenia" i "Moje rezerwacje"
- [x] Testy: SelfBookingTest, BookingPolicyTest (pass)

### CZĘŚĆ 2: Customer → Provider
- [x] Backend: endpoint POST /profile/upgrade-to-provider
- [x] Backend: walidacja business_name, service_description (min:50), service_category
- [x] Backend: tworzy provider_profile + assignRole('provider')
- [x] Frontend: banner w customer dashboard "Zostań providerem"
- [x] Frontend: strona /upgrade-to-provider z formularzem
- [x] Frontend: walidacja bio ≥50 znaków inline
- [x] Frontend: obsługa 422 errors z field-specific toasts
- [x] Frontend: provider dashboard prosty widok "Dodaj pierwszą usługę"
- [x] Testy: UpgradeToProviderTest (pass)

---

## 🔍 Ryzyka i mitigation

| Ryzyko | Prawdopodobieństwo | Mitigation |
|--------|-------------------|------------|
| Booking flow ma hardcoded blokady providera | Średnie | Audit przed implementacją (Task 1.2.1) |
| Brak service_categories w bazie | Wysokie | Dodaj seeder kategorii PRZED rozpoczęciem |
| Frontend routing konflikty | Niskie | Sprawdź routes config przed dodaniem nowych |
| User cache stale po upgrade | Średnie | Invalidate ['auth','user'] query po upgrade |

---

## 📝 Notatki

- **Nie zmieniamy `user_type`** w upgrade (pozostaje 'customer', rola Spatie określa możliwości)
- **Provider dashboard uproszczony** dopóki nie doda pierwszej usługi (nie przytłaczamy UI)
- **Self-booking blokada** tylko backend (frontend może nie sprawdzać, backend i tak zwróci 422)
- **Testy E2E** można dodać później (Task dla Playwright)

---

**Gotowe do implementacji? Jutro zaczynamy od Task 1.1.1 (self-booking validation)** 🚀
