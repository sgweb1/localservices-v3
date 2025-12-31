# Analiza Testów: Provider Dashboard (/provider/dashboard)

## 📊 Komponenty i Funkcjonalność

### Główny Komponent: DashboardPage.tsx

#### 1. **Hero Section** (Nagłówek z witaniem)
**Elementy:**
- Powitanie użytkownika: "Witaj, {firstName}!"
- Opis panelu
- 2 przyciski CTA:
  - "Przejdź do kalendarza" → `/provider/calendar`
  - "Zarządzaj rezerwacjami" → `/provider/bookings`
- Trust Score™ card (z ikoną, wartością, statusem premium)

**Co testować:**
```typescript
✅ Renderowanie nagłówka
  - Wyświetla imię użytkownika (firstName z user.name)
  - Pokazuje opis panelu
  - Oba przyciski są klikalne
  - Link do kalendarza działa
  - Link do bookings działa

✅ Trust Score Card
  - Wyświetla wartość Trust Score z API
  - Loader podczas ładowania
  - Status premium jeśli score >= 70
  - Komunikat "Cel: 70+" jeśli score < 70
```

---

#### 2. **Hero Stats** (3 karty statystyk)
**Dane z API: `/api/v1/provider/dashboard/widgets`**

**Karty:**
1. **Oczekujące** (bookingsStats.pending)
   - Ikona: Clock
   - Kolor: amber-orange gradient
   
2. **Potwierdzone** (bookingsStats.confirmed)
   - Ikona: CheckCircle2
   - Kolor: emerald-teal gradient
   
3. **Nieprzeczytane** (messageCenter.unread_count)
   - Ikona: MessageSquare
   - Kolor: cyan-blue gradient

**Co testować:**
```typescript
✅ Renderowanie stats
  - Wszystkie 3 karty są widoczne
  - Każda karta ma poprawną ikonę
  - Loader podczas ładowania
  - Wartości pochodzą z widgets API

✅ Dane z API
  - bookingsStats.pending wyświetla się w "Oczekujące"
  - bookingsStats.confirmed wyświetla się w "Potwierdzone"
  - unreadMessages wyświetla się w "Nieprzeczytane"
  - Wartości domyślne (0) gdy brak danych
```

---

#### 3. **Summary Cards** (4 karty podsumowania)
**Dane z API: `/api/v1/provider/dashboard/widgets`**

**Karty:**
1. **Zapytania ofertowe**
   - Wartość: requestsStats.incoming + requestsStats.quoted
   - Hint: "Ostatnie 30 dni"
   - Ikona: MessageSquare
   
2. **Potwierdzone rezerwacje**
   - Wartość: bookingsStats.confirmed
   - Hint: "Instant booking i ręczne"
   - Ikona: CheckCircle2
   
3. **Ukończone**
   - Wartość: bookingsStats.completed
   - Hint: "Zamknięte zlecenia"
   - Ikona: Calendar
   
4. **Trust Score™**
   - Wartość: trustScore
   - Hint: dynamiczny (>=70: "Premium...", <70: "Cel: 70+")
   - Ikona: Zap
   - Extra: Średni czas odpowiedzi (responseMinutes)

**Co testować:**
```typescript
✅ Renderowanie cards
  - Wszystkie 4 karty są widoczne
  - Każda karta ma tytuł, wartość, hint, ikonę
  - Loader podczas ładowania

✅ Obliczenia wartości
  - Zapytania = incoming + quoted
  - Potwierdzone = confirmed
  - Ukończone = completed
  - Trust Score = trustScore z API
  
✅ Trust Score card szczegóły
  - Pokazuje responseMinutes gdy dostępne
  - Format: "Śr. czas odpowiedzi: X min"
```

---

#### 4. **Performance Section** (Wydajność)
**Komponent: PerformanceMetrics**
**Dane z API: `/api/v1/provider/dashboard/performance`**

**Metryki (4 karty):**
1. **Wyświetlenia** (views)
   - Ikona: Eye
   - Kolor: blue-cyan
   
2. **Ulubione** (favorited)
   - Ikona: Heart
   - Kolor: rose-pink
   
3. **Czas odpowiedzi** (avg_response_time)
   - Ikona: Clock
   - Kolor: amber-orange
   
4. **Ocena** (rating)
   - Ikona: Star
   - Kolor: emerald-teal

**Co testować:**
```typescript
✅ PerformanceMetrics component
  - Renderuje 4 karty metryczne
  - Każda karta ma ikonę, label, wartość, opis
  - Loader podczas ładowania (4 skeleton cards)
  
✅ Formatowanie wartości
  - Wyświetla "-" gdy brak danych
  - Formatuje wartości poprawnie (views: "234", rating: "4.7")
  - Obsługuje null/undefined gracefully
  
✅ Fallback data
  - Gdy brak API response, używa mock data
  - Mock: views=234, favorited=18, avg_response_time="2.5h", rating=4.7
```

---

#### 5. **Recent Bookings + Messages** (2 kolumny)
**Komponenty: RecentBookings, RecentMessages**
**Dane z API:**
- `/api/v1/provider/dashboard/bookings?limit=5`
- `/api/v1/provider/dashboard/conversations?limit=5`

**Co testować:**
```typescript
✅ RecentBookings component
  - Renderuje listę ostatnich 5 rezerwacji
  - Każda rezerwacja ma: klient, usługa, data, status
  - Link "Zobacz wszystkie" → /provider/bookings
  
✅ RecentMessages component
  - Renderuje listę ostatnich 5 konwersacji
  - Każda wiadomość ma: klient, preview, czas, unread badge
  - Link "Zobacz wszystkie" → /provider/messages
```

---

## 🔗 API Endpoints używane na Dashboard

### 1. GET `/api/v1/provider/dashboard/widgets`
**Query params:** `?fields=pipeline,performance,insights,messages`

**Response structure:**
```json
{
  "pipeline": {
    "bookings": {
      "pending": 3,
      "confirmed": 12,
      "completed": 45
    },
    "requests": {
      "incoming": 8,
      "quoted": 5,
      "converted": 3
    }
  },
  "insights": {
    "trust_score": 85
  },
  "performance": {
    "trust_score": 85,
    "response_minutes": 45
  },
  "messages": {
    "unread_count": 7
  }
}
```

**Co testować:**
```typescript
✅ Endpoint availability
  - 200 status code
  - Response ma wszystkie wymagane pola
  - Wartości są liczbami
  
✅ Cache behavior (React Query)
  - Deduplikacja requestów (tylko 1 request dla wszystkich komponentów)
  - Cache 60s (staleTime)
  - Refetch co 5 min w tle
  
✅ Error handling
  - 401 → redirect do /dev/login
  - 500 → pokazuje error message
  - Network error → pokazuje retry
```

### 2. GET `/api/v1/provider/dashboard/bookings`
**Query params:** `?limit=5&sort=-created_at`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "customer_name": "Jan Kowalski",
      "service": "Malowanie ścian",
      "date": "2025-01-15",
      "time": "10:00",
      "status": "confirmed",
      "location": "Warszawa"
    }
  ]
}
```

**Co testować:**
```typescript
✅ Endpoint availability
  - 200 status
  - Response.data jest array
  - Każdy booking ma: id, customer_name, service, date, time, status, location
  
✅ Limit parameter
  - Domyślnie limit=5
  - Zwraca max 5 rezerwacji
```

### 3. GET `/api/v1/provider/dashboard/conversations`
**Query params:** `?limit=5&sort=-updated_at`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "customer_name": "Anna Nowak",
      "last_message": "Dzień dobry, czy...",
      "time": "2 godz. temu",
      "unread": 2
    }
  ]
}
```

**Co testować:**
```typescript
✅ Endpoint availability
  - 200 status
  - Response.data jest array
  - Każda konwersacja ma: id, customer_name, last_message, time, unread
```

### 4. GET `/api/v1/provider/dashboard/reviews`
**Query params:** `?limit=4&sort=-created_at`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "customer_name": "Piotr Wiśniewski",
      "rating": 5,
      "comment": "Świetna robota!",
      "date": "2025-01-10"
    }
  ]
}
```

**Co testować:**
```typescript
✅ Endpoint availability
  - 200 status
  - Response.data jest array
  - Każda recenzja ma: id, customer_name, rating, comment, date
```

### 5. GET `/api/v1/provider/dashboard/performance`
**Response:**
```json
{
  "views": 234,
  "favorited": 18,
  "avg_response_time": "2.5h",
  "rating": 4.7,
  "period_label": "Ostatnie 7 dni"
}
```

**Co testować:**
```typescript
✅ Endpoint availability
  - 200 status
  - Response ma wszystkie metryki
  - Wartości są w poprawnym formacie
```

---

## 🎯 Priorytety Testowania

### **CRITICAL (Priorytet 1)** - Muszą działać
1. ✅ Endpoint `/api/v1/provider/dashboard/widgets` → 200
2. ✅ Widgets ładują dane (nie null/undefined)
3. ✅ Trust Score wyświetla się poprawnie
4. ✅ Hero stats (3 karty) renderują wartości
5. ✅ Przyciski CTA są klikalne
6. ✅ 401 errors → redirect do login

### **HIGH (Priorytet 2)** - Ważna funkcjonalność
7. ✅ Summary cards (4 karty) wyświetlają dane
8. ✅ PerformanceMetrics renderuje 4 metryki
9. ✅ RecentBookings pokazuje listę
10. ✅ RecentMessages pokazuje listę
11. ✅ Loading states (Loader2 animations)
12. ✅ React Query deduplication (1 request na queryKey)

### **MEDIUM (Priorytet 3)** - Nice to have
13. ✅ Fallback values (0, "-") gdy brak danych
14. ✅ Trust Score premium message (>=70)
15. ✅ Response minutes wyświetla się w Trust Score card
16. ✅ Obliczenia: zapytania = incoming + quoted
17. ✅ Skeleton loaders podczas fetch

### **LOW (Priorytet 4)** - Estetyka/UX
18. ✅ Gradienty CSS renderują się poprawnie
19. ✅ Ikony Lucide wyświetlają się
20. ✅ Responsive layout (mobile/desktop)

---

## 📝 Przykładowe Testy

### Test 1: Dashboard renderuje się poprawnie
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardPage } from './DashboardPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

describe('DashboardPage', () => {
  const queryClient = new QueryClient()
  
  const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
  
  it('should render hero section with welcome message', () => {
    render(<DashboardPage />, { wrapper })
    
    expect(screen.getByText(/Witaj,/)).toBeInTheDocument()
    expect(screen.getByText('Panel providera')).toBeInTheDocument()
  })
  
  it('should render 3 hero stats cards', () => {
    render(<DashboardPage />, { wrapper })
    
    expect(screen.getByText('Oczekujące')).toBeInTheDocument()
    expect(screen.getByText('Potwierdzone')).toBeInTheDocument()
    expect(screen.getByText('Nieprzeczytane')).toBeInTheDocument()
  })
  
  it('should render CTA buttons', () => {
    render(<DashboardPage />, { wrapper })
    
    const calendarButton = screen.getByText('Przejdź do kalendarza')
    const bookingsButton = screen.getByText('Zarządzaj rezerwacjami')
    
    expect(calendarButton).toBeInTheDocument()
    expect(bookingsButton).toBeInTheDocument()
  })
})
```

### Test 2: API endpoints smoke test
```typescript
import { describe, it, expect } from 'vitest'
import axios from 'axios'

const BASE_URL = 'http://localhost:5173/api/v1'

describe('Dashboard API Endpoints', () => {
  it('should return 401 for widgets without auth', async () => {
    try {
      await axios.get(`${BASE_URL}/provider/dashboard/widgets`)
      expect.fail('Should have thrown 401')
    } catch (error: any) {
      expect(error.response?.status).toBe(401)
    }
  })
  
  it('should return 401 for bookings without auth', async () => {
    try {
      await axios.get(`${BASE_URL}/provider/dashboard/bookings`)
      expect.fail('Should have thrown 401')
    } catch (error: any) {
      expect(error.response?.status).toBe(401)
    }
  })
  
  it('should return 401 for performance without auth', async () => {
    try {
      await axios.get(`${BASE_URL}/provider/dashboard/performance`)
      expect.fail('Should have thrown 401')
    } catch (error: any) {
      expect(error.response?.status).toBe(401)
    }
  })
})
```

### Test 3: React Query deduplication
```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardWidgets } from './useDashboardWidgets'
import { apiClient } from '@/api/client'

vi.mock('@/api/client')

describe('useDashboardWidgets deduplication', () => {
  it('should deduplicate multiple hook calls', async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: {} })
    vi.mocked(apiClient.get).mockImplementation(mockGet)
    
    const queryClient = new QueryClient()
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    
    // Wywołaj hook 3 razy (symulacja 3 komponentów)
    renderHook(() => useDashboardWidgets(), { wrapper })
    renderHook(() => useDashboardWidgets(), { wrapper })
    renderHook(() => useDashboardWidgets(), { wrapper })
    
    await waitFor(() => {
      // React Query powinien zrobić tylko 1 request
      expect(mockGet).toHaveBeenCalledTimes(1)
    })
  })
})
```

---

## 🚀 Plan Implementacji Testów

### Faza 1: API Smoke Tests (1-2h)
- [ ] Test wszystkich 5 endpointów (widgets, bookings, conversations, reviews, performance)
- [ ] Sprawdź 401 errors bez auth
- [ ] Sprawdź response structure

### Faza 2: Component Tests (2-3h)
- [ ] Test DashboardPage renderowania
- [ ] Test PerformanceMetrics
- [ ] Test RecentBookings
- [ ] Test RecentMessages
- [ ] Test loading states

### Faza 3: Hook Tests (1-2h)
- [ ] Test useDashboardWidgets deduplication
- [ ] Test useRecentBookings, useRecentMessages, useRecentReviews
- [ ] Test cache behavior

### Faza 4: Integration Tests (2-3h)
- [ ] Test full dashboard flow (mount → API → render)
- [ ] Test error handling (401, 500)
- [ ] Test retry logic

**Total: 6-10h roboczych**
