# Plan implementacji: Provider Settings Page

**Data:** 2025-12-23  
**Zakres:** Odtworzenie `/provider/settings` z localservices → ls2  
**Priorytet:** MEDIUM  
**Czas:** 1-2 dni robocze

---

## 🎯 Analiza źródłowa (localservices)

### Struktura Settings w localservices

**Komponenty Livewire:**
1. `BusinessProfile.php` - profil biznesu (logo, nazwa, bio, social media)
2. `NotificationSettings.php` - preferencje powiadomień (email, push)
3. `Security.php` - bezpieczeństwo (zmiana hasła, 2FA)
4. `BankAccountSettings.php` - dane bankowe (wypłaty)
5. `SubdomainSettings.php` - własna subdomena

**Layout:** Zakładki (tabs) w jednym widoku

---

## 📋 Plan implementacji dla ls2 (React + TypeScript)

### Faza 1: Backend API (Laravel)

#### 1.1 Endpoint: GET /api/v1/provider/settings
**Plik:** `app/Http/Controllers/Api/V1/Provider/SettingsController.php`

```php
public function index(Request $request): JsonResponse
{
    $user = $request->user();
    $provider = $user->providerProfile;
    
    return response()->json([
        'success' => true,
        'data' => [
            // Business Profile
            'business' => [
                'name' => $provider->business_name,
                'short_description' => $provider->service_description,
                'bio' => $user->bio,
                'logo' => $user->avatar,
                'video_url' => $provider->video_introduction_url,
                'website' => $provider->website_url,
                'social_media' => $provider->social_media ?? [],
            ],
            
            // Notification Preferences
            'notifications' => [
                'email' => [
                    'new_booking' => $user->notificationPreferences->email_booking_created ?? true,
                    'booking_cancelled' => $user->notificationPreferences->email_booking_cancelled ?? true,
                    'new_message' => $user->notificationPreferences->email_message_received ?? true,
                    'new_review' => $user->notificationPreferences->email_review_received ?? true,
                ],
                'push' => [
                    'new_booking' => $user->notificationPreferences->app_booking_created ?? true,
                    'new_message' => $user->notificationPreferences->app_message_received ?? true,
                    'new_review' => $user->notificationPreferences->app_review_received ?? true,
                ],
            ],
            
            // Security
            'security' => [
                'two_factor_enabled' => $user->two_factor_secret !== null,
                'email' => $user->email,
                'email_verified' => $user->email_verified_at !== null,
            ],
        ],
    ]);
}
```

**Czas:** 1h

---

#### 1.2 Endpoint: PUT /api/v1/provider/settings/business
**Plik:** `app/Http/Controllers/Api/V1/Provider/SettingsController.php`

```php
public function updateBusiness(Request $request): JsonResponse
{
    $validated = $request->validate([
        'business_name' => 'required|string|min:2|max:255',
        'short_description' => 'nullable|string|max:120',
        'bio' => 'nullable|string|max:1000',
        'video_url' => 'nullable|url|max:2048',
        'website' => 'nullable|url|max:2048',
        'social_media' => 'nullable|array',
        'social_media.facebook' => 'nullable|url',
        'social_media.instagram' => 'nullable|url',
        'social_media.linkedin' => 'nullable|url',
        'social_media.tiktok' => 'nullable|url',
    ]);
    
    $user = $request->user();
    $provider = $user->providerProfile;
    
    DB::transaction(function () use ($user, $provider, $validated) {
        $provider->update([
            'business_name' => $validated['business_name'],
            'service_description' => $validated['short_description'],
            'video_introduction_url' => $validated['video_url'],
            'website_url' => $validated['website'],
            'social_media' => $validated['social_media'] ?? [],
        ]);
        
        $user->update([
            'bio' => $validated['bio'],
        ]);
    });
    
    return response()->json([
        'success' => true,
        'message' => 'Profil biznesu zaktualizowany',
    ]);
}
```

**Czas:** 45 minut

---

#### 1.3 Endpoint: POST /api/v1/provider/settings/logo
**Plik:** `app/Http/Controllers/Api/V1/Provider/SettingsController.php`

```php
public function uploadLogo(Request $request): JsonResponse
{
    $request->validate([
        'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
    ]);
    
    $user = $request->user();
    
    // Usuń stare logo
    if ($user->avatar) {
        Storage::disk('public')->delete($user->avatar);
    }
    
    // Upload nowego
    $path = $request->file('logo')->store('avatars', 'public');
    
    $user->update(['avatar' => $path]);
    
    return response()->json([
        'success' => true,
        'message' => 'Logo zaktualizowane',
        'data' => [
            'logo_url' => Storage::url($path),
        ],
    ]);
}
```

**Czas:** 30 minut

---

#### 1.4 Endpoint: PUT /api/v1/provider/settings/notifications
**Plik:** `app/Http/Controllers/Api/V1/Provider/SettingsController.php`

```php
public function updateNotifications(Request $request): JsonResponse
{
    $validated = $request->validate([
        'email.new_booking' => 'boolean',
        'email.booking_cancelled' => 'boolean',
        'email.new_message' => 'boolean',
        'email.new_review' => 'boolean',
        'push.new_booking' => 'boolean',
        'push.new_message' => 'boolean',
        'push.new_review' => 'boolean',
    ]);
    
    $user = $request->user();
    
    $preferences = $user->notificationPreferences()->firstOrCreate([
        'user_id' => $user->id,
    ]);
    
    $preferences->update([
        'email_booking_created' => $validated['email']['new_booking'] ?? true,
        'email_booking_cancelled' => $validated['email']['booking_cancelled'] ?? true,
        'email_message_received' => $validated['email']['new_message'] ?? true,
        'email_review_received' => $validated['email']['new_review'] ?? true,
        'app_booking_created' => $validated['push']['new_booking'] ?? true,
        'app_message_received' => $validated['push']['new_message'] ?? true,
        'app_review_received' => $validated['push']['new_review'] ?? true,
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Preferencje powiadomień zaktualizowane',
    ]);
}
```

**Czas:** 30 minut

---

#### 1.5 Endpoint: PUT /api/v1/provider/settings/password
**Plik:** `app/Http/Controllers/Api/V1/Provider/SettingsController.php`

```php
public function updatePassword(Request $request): JsonResponse
{
    $validated = $request->validate([
        'current_password' => 'required|current_password',
        'new_password' => 'required|string|min:8|confirmed|different:current_password',
    ]);
    
    $user = $request->user();
    
    $user->update([
        'password' => Hash::make($validated['new_password']),
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Hasło zostało zmienione',
    ]);
}
```

**Czas:** 20 minut

---

#### 1.6 Route registration
**Plik:** `routes/api/v1/provider.php`

```php
// Settings
Route::prefix('settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index'])->name('api.provider.settings.index');
    Route::put('/business', [SettingsController::class, 'updateBusiness'])->name('api.provider.settings.business');
    Route::post('/logo', [SettingsController::class, 'uploadLogo'])->name('api.provider.settings.logo');
    Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('api.provider.settings.notifications');
    Route::put('/password', [SettingsController::class, 'updatePassword'])->name('api.provider.settings.password');
});
```

**Czas:** 10 minut

---

### Faza 2: Frontend (React + TypeScript)

#### 2.1 API Client
**Plik:** `src/api/v1/settingsApi.ts`

```typescript
export interface SettingsData {
  business: {
    name: string;
    short_description: string | null;
    bio: string | null;
    logo: string | null;
    video_url: string | null;
    website: string | null;
    social_media: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      tiktok?: string;
    };
  };
  notifications: {
    email: {
      new_booking: boolean;
      booking_cancelled: boolean;
      new_message: boolean;
      new_review: boolean;
    };
    push: {
      new_booking: boolean;
      new_message: boolean;
      new_review: boolean;
    };
  };
  security: {
    two_factor_enabled: boolean;
    email: string;
    email_verified: boolean;
  };
}

export async function getSettings(): Promise<{ success: boolean; data: SettingsData }> {
  const response = await apiClient.get('/provider/settings');
  return response.data;
}

export async function updateBusiness(data: Partial<SettingsData['business']>) {
  const response = await apiClient.put('/provider/settings/business', data);
  return response.data;
}

export async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await apiClient.post('/provider/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function updateNotifications(notifications: SettingsData['notifications']) {
  const response = await apiClient.put('/provider/settings/notifications', notifications);
  return response.data;
}

export async function updatePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  const response = await apiClient.put('/provider/settings/password', data);
  return response.data;
}
```

**Czas:** 45 minut

---

#### 2.2 Settings Page z Tabs
**Plik:** `src/features/provider/pages/SettingsPage.tsx`

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/ui/typography';
import { getSettings } from '@/api/v1/settingsApi';
import { 
  Building2, 
  Bell, 
  Shield, 
  Landmark, 
  Globe 
} from 'lucide-react';
import { BusinessProfileTab } from '../settings/BusinessProfileTab';
import { NotificationsTab } from '../settings/NotificationsTab';
import { SecurityTab } from '../settings/SecurityTab';

export const SettingsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: getSettings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle gradient>Ustawienia</PageTitle>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Profil biznesu
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Powiadomienia
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Bezpieczeństwo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <BusinessProfileTab data={data?.data.business} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab data={data?.data.notifications} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityTab data={data?.data.security} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

**Czas:** 1h

---

#### 2.3 Business Profile Tab
**Plik:** `src/features/provider/settings/BusinessProfileTab.tsx`

**Zawartość:**
- Logo upload (drag & drop)
- Nazwa firmy (input)
- Krótki opis (textarea 120 znaków)
- Bio (textarea 1000 znaków)
- URL wideo (input)
- Website (input)
- Social media: Facebook, Instagram, LinkedIn, TikTok (inputs)
- Przyciski: Anuluj, Zapisz

**Funkcje:**
- Upload logo z preview
- Walidacja formularza (Zod)
- Toast po zapisie
- Loading state

**Czas:** 2-3h

---

#### 2.4 Notifications Tab
**Plik:** `src/features/provider/settings/NotificationsTab.tsx`

**Zawartość:**
- Sekcja "Email" (checkboxy):
  - Nowa rezerwacja
  - Anulowanie rezerwacji
  - Nowa wiadomość
  - Nowa opinia
- Sekcja "Push" (checkboxy):
  - Nowa rezerwacja
  - Nowa wiadomość
  - Nowa opinia
- Przycisk: Zapisz preferencje

**Funkcje:**
- Toggle switches
- Auto-save lub manual save
- Toast po zapisie

**Czas:** 1-1.5h

---

#### 2.5 Security Tab
**Plik:** `src/features/provider/settings/SecurityTab.tsx`

**Zawartość:**
- **Zmiana hasła:**
  - Aktualne hasło (input type password)
  - Nowe hasło (input type password)
  - Potwierdź hasło (input type password)
  - Przycisk: Zmień hasło
  
- **Dwuskładnikowe uwierzytelnianie:**
  - Status: Włączone/Wyłączone
  - Przycisk: Włącz 2FA / Wyłącz 2FA
  - QR code (jeśli włączanie)
  - Input kodu weryfikacyjnego

**Funkcje:**
- Walidacja siły hasła
- Sprawdzenie czy hasła się zgadzają
- Toast po zmianie
- 2FA setup flow (opcjonalnie MVP)

**Czas:** 1.5-2h

---

#### 2.6 Routing
**Plik:** `src/main.tsx`

```tsx
<Route path="settings" element={<SettingsPage />} />
```

**Czas:** 5 minut

---

### Faza 3: Testy

#### 3.1 Backend Tests
**Plik:** `tests/Feature/Api/V1/Provider/SettingsTest.php`

Testy:
- `test_provider_can_get_settings()`
- `test_provider_can_update_business_profile()`
- `test_provider_can_upload_logo()`
- `test_provider_can_update_notifications()`
- `test_provider_can_change_password()`
- `test_customer_cannot_access_provider_settings()`

**Czas:** 1.5h

---

## 📊 Podsumowanie czasu

| Faza | Zadanie | Czas |
|------|---------|------|
| **Backend** | SettingsController + routes | 3h 15min |
| **Frontend** | API client | 45min |
| **Frontend** | SettingsPage + Tabs | 1h |
| **Frontend** | BusinessProfileTab | 2.5h |
| **Frontend** | NotificationsTab | 1.25h |
| **Frontend** | SecurityTab | 1.75h |
| **Frontend** | Routing | 5min |
| **Testy** | Backend tests | 1.5h |
| **RAZEM** | | **~12h** |

---

## 🎯 MVP (Minimum Viable Product)

**Priorytet 1 (must-have):**
- Business Profile (nazwa, logo, bio, social media)
- Notifications (email + push toggles)
- Security (zmiana hasła)

**Priorytet 2 (nice-to-have):**
- 2FA setup
- Bank account settings
- Subdomain settings

---

## 🔧 Dodatkowe uwagi

1. **Uploadowane pliki:** Logo przechowywać w `storage/app/public/avatars/`
2. **Notification preferences:** Tabela `notification_preferences` już istnieje w localservices
3. **2FA:** Można pominąć w MVP (dodać później)
4. **Zgodność z designem:** Glass cards, rounded-2xl, gradient buttons
5. **Mobile responsive:** Tabs → dropdown na mobile
6. **Dark mode:** Respektować theme z Tailwind

---

## ✅ Kolejność implementacji

1. Backend: SettingsController (GET + PUT business)
2. Frontend: API client + SettingsPage scaffold
3. Frontend: BusinessProfileTab (najprostszy)
4. Backend: Upload logo endpoint
5. Frontend: Logo upload w BusinessProfileTab
6. Backend: Notifications endpoint
7. Frontend: NotificationsTab
8. Backend: Password change endpoint
9. Frontend: SecurityTab (bez 2FA)
10. Testy backend
11. Test manualny frontend

**Rozpoczynamy od zadania 1?**
