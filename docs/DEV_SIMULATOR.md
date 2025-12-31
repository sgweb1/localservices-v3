# Dev Simulator - Dokumentacja

## 📋 Przegląd

**Dev Simulator** to narzędzie deweloperskie umożliwiające testowanie i symulację całej logiki biznesowej platformy Local Services bez konieczności ręcznego tworzenia danych w bazie.

## 🎯 Cel

Strona została stworzona aby:
- ✅ Umożliwić szybkie testowanie wszystkich funkcji systemu
- ✅ Generować realistyczne dane testowe
- ✅ Symulować eventy i zmiany statusów
- ✅ Testować notyfikacje i komunikację
- ✅ Ułatwić debugging i development

## 🚀 Dostęp

**URL:** `/provider/dev-simulator`

**Wymagania:**
- Tylko w trybie development (`import.meta.env.DEV === true`)
- Zalogowany użytkownik z rolą `provider`
- Strona NIE jest dostępna na production

**Lokalizacja w kodzie:**
- Komponent: `src/features/provider/pages/DevSimulatorPage.tsx`
- Route: `src/main.tsx` (linia ~342)
- Nawigacja: `src/features/provider/dashboard/components/Sidebar.tsx`

## 📑 Zakładki (Tabs)

### 1. 📅 Rezerwacje (Bookings)

#### Funkcje:
- **Generuj rezerwacje** - Tworzy X testowych rezerwacji
  - Endpoint: `POST /dev/simulate-events`
  - Payload: `{ type: 'bookings', count: 3 }`
  - Invaliduje: `['bookings']`, `['dashboard']`

- **Zmień status rezerwacji** - Symuluje workflow rezerwacji
  - Statusy: `confirmed`, `in_progress`, `completed`, `cancelled`
  - Endpointy:
    - Accept: `POST /provider/bookings/{id}/accept`
    - Start: `POST /provider/bookings/{id}/start`
    - Complete: `POST /provider/bookings/{id}/complete`
    - Decline: `POST /provider/bookings/{id}/decline`
  - Invaliduje: `['bookings']`, `['dashboard']`

#### Use Case:
```typescript
// Wygeneruj 5 rezerwacji
await apiClient.post('/dev/simulate-events', {
  type: 'bookings',
  count: 5
});

// Zaakceptuj rezerwację #123
await apiClient.post('/provider/bookings/123/accept');

// Rozpocznij wykonanie
await apiClient.post('/provider/bookings/123/start');

// Zakończ
await apiClient.post('/provider/bookings/123/complete');
```

---

### 2. 💬 Wiadomości (Messages)

#### Funkcje:
- **Wyślij wiadomość** - Wysyła wiadomość do użytkownika
  - Endpoint: `POST /conversations`
  - Payload: `{ participant_id: 123, message: "Treść..." }`
  - Invaliduje: `['conversations']`, `['messages']`

- **Generuj konwersacje** - Tworzy 5 przykładowych konwersacji
  - Status: Funkcja w development (wymaga backend)

- **Symuluj otrzymanie wiadomości** - Symuluje incoming message
  - Status: Funkcja w development (wymaga backend)

#### Use Case:
```typescript
// Wyślij wiadomość do użytkownika #456
await apiClient.post('/conversations', {
  participant_id: 456,
  message: 'Dzień dobry, interesuje mnie Pana oferta.'
});
```

---

### 3. ⭐ Opinie (Reviews)

#### Funkcje:
- **Dodaj opinię** - Symuluje otrzymanie opinii od klienta
  - Endpoint: `POST /dev/simulate-events`
  - Payload: `{ type: 'review', rating: 5, comment: "Świetna usługa!" }`
  - Invaliduje: `['reviews']`, `['dashboard']`

- **Generuj 5 opinii** - Tworzy losowe opinie (różne oceny)
  - Endpoint: `POST /dev/simulate-events`
  - Payload: `{ type: 'reviews', count: 5 }`
  - Invaliduje: `['reviews']`, `['dashboard']`

- **Odpowiedz na opinię** - Symuluje odpowiedź providera
  - Status: Funkcja w development

#### Use Case:
```typescript
// Dodaj opinię 5/5
await apiClient.post('/dev/simulate-events', {
  type: 'review',
  rating: 5,
  comment: 'Polecam! Profesjonalna obsługa.'
});

// Wygeneruj 5 losowych opinii
await apiClient.post('/dev/simulate-events', {
  type: 'reviews',
  count: 5
});
```

---

### 4. 📦 Usługi (Services)

#### Funkcje:
- **Dodaj nową usługę** - Tworzy testową usługę
- **Zmień widoczność** - Toggle visibility usługi
- **Edytuj ostatnią** - Otwiera edycję ostatnio utworzonej usługi
- **Aktywuj boost** - Symuluje zakup boost dla usługi
- **Symuluj zakup promocji** - Testuje flow płatności boost

**Status:** Funkcje w development (wymagają implementacji)

---

### 5. 🔔 Notyfikacje (Notifications)

#### Funkcje:
- **Wyślij notyfikację** - Symuluje różne typy notyfikacji:
  - 🔔 Nowa rezerwacja
  - ✅ Zaakceptowano rezerwację
  - 💬 Nowa wiadomość
  - ⭐ Nowa opinia

- **Testuj push** - Wysyła test push notification
- **Wyczyść wszystkie** - Usuwa wszystkie notyfikacje

**Status:** Funkcje w development

---

### 6. 💳 Płatności (Payments)

#### Funkcje:
- **Kup plan Basic/Premium** - Symuluje zakup subskrypcji
- **Odnów subskrypcję** - Testuje renewal flow
- **Opłać rezerwację** - Symuluje płatność za rezerwację
- **Potwierdź płatność** - Zmienia status payment na `paid`

**Status:** Funkcje w development

---

### 7. 📅 Kalendarz (Calendar)

#### Funkcje:
- **Generuj sloty (tydzień)** - Tworzy dostępność na 7 dni
  - Endpoint: `POST /dev/calendar/generate-bookings`
  - Payload: `{ days: 7, slotsPerDay: 4 }`
  - Invaliduje: `['calendar']`

- **Generuj rezerwacje** - Wypełnia kalendarz rezerwacjami
  - Endpoint: `POST /dev/calendar/generate-bookings`
  - Invaliduje: `['calendar']`, `['bookings']`

- **Wyczyść testowe dane** - Usuwa testowe wpisy z kalendarza
  - Endpoint: `DELETE /dev/calendar/clear-test-bookings`
  - Invaliduje: `['calendar']`, `['bookings']`

#### Use Case:
```typescript
// Wygeneruj sloty na tydzień
await apiClient.post('/dev/calendar/generate-bookings', {
  days: 7,
  slotsPerDay: 4
});

// Wyczyść testowe dane
await apiClient.delete('/dev/calendar/clear-test-bookings');
```

---

## 🎨 UI/UX

### Struktura:
- **Header** - Tytuł + Quick Actions (Odśwież cache, Wyczyść logi)
- **User Info Card** - Informacje o zalogowanym użytkowniku
- **Tabs** - 7 zakładek z różnymi kategoriami funkcji
- **Results Log** - Konsola z logami akcji (timestamp + emoji + message)

### Kolory (Gradient per kategoria):
- Rezerwacje: Cyan (`from-cyan-500`)
- Wiadomości: Purple (`from-purple-500`)
- Opinie: Yellow (`from-yellow-500`)
- Usługi: Green (`from-green-500`)
- Notyfikacje: Orange (`from-orange-500`)
- Płatności: Emerald (`from-emerald-500`)
- Kalendarz: Violet (`from-violet-500`)

### Komponenty używane:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Radix UI)
- `Button`, `Input`, `Textarea`, `Select` (src/components/ui)
- `Card`, `Badge` (src/components/ui)
- `PageTitle`, `Text` (src/components/ui/typography)
- Icons z `lucide-react`

---

## 🔧 Backend Endpoints

### Istniejące (używane):
```
POST   /dev/simulate-events           - Generuj rezerwacje/opinie
POST   /provider/bookings/{id}/accept - Zaakceptuj rezerwację
POST   /provider/bookings/{id}/start  - Rozpocznij wykonanie
POST   /provider/bookings/{id}/complete - Zakończ
POST   /provider/bookings/{id}/decline - Odrzuć
POST   /conversations                  - Wyślij wiadomość
POST   /dev/calendar/generate-bookings - Generuj sloty/rezerwacje
DELETE /dev/calendar/clear-test-bookings - Wyczyść testowe dane
```

### Do implementacji:
```
POST   /dev/simulate-events?type=message         - Generuj wiadomości
POST   /dev/simulate-events?type=notification    - Wyślij notyfikację
POST   /dev/simulate-events?type=service         - Generuj usługi
POST   /dev/calendar/add-slot                    - Dodaj slot
POST   /dev/calendar/add-vacation                - Dodaj urlop
```

---

## 📊 React Query Cache Management

### Invalidation Strategy:
Każda akcja invaliduje odpowiednie query keys:

```typescript
// Rezerwacje
await queryClient.invalidateQueries({ queryKey: ['bookings'] });
await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// Wiadomości
await queryClient.invalidateQueries({ queryKey: ['conversations'] });
await queryClient.invalidateQueries({ queryKey: ['messages'] });

// Opinie
await queryClient.invalidateQueries({ queryKey: ['reviews'] });
await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// Kalendarz
await queryClient.invalidateQueries({ queryKey: ['calendar'] });
```

### Global Refresh:
```typescript
// Odśwież wszystkie queries (Quick Action)
await queryClient.invalidateQueries();
```

---

## 🧪 Testing Workflow

### Przykładowy flow testowania rezerwacji:

1. **Wygeneruj dane**
   - Przejdź do zakładki "Rezerwacje"
   - Ustaw ilość: 5
   - Kliknij "Generuj rezerwacje"
   - Sprawdź logi - powinno być 5 wpisów

2. **Zmień status**
   - Skopiuj ID rezerwacji z logu
   - Wklej do pola "ID Rezerwacji"
   - Wybierz status: "Potwierdzona"
   - Kliknij "Zmień status"

3. **Weryfikuj w UI**
   - Przejdź do `/provider/bookings`
   - Sprawdź czy rezerwacja ma nowy status
   - Sprawdź dashboard widgets

4. **Wyczyść**
   - Wróć do Dev Simulator
   - Kliknij "Wyczyść logi"
   - Kliknij "Odśwież cache"

---

## ⚠️ Uwagi i ograniczenia

### Security:
- ✅ Strona dostępna TYLKO w dev mode (`import.meta.env.DEV`)
- ✅ Backend endpoints `/dev/*` chronione przez middleware
- ✅ NIE jest deployowane na production
- ✅ Wymaga autoryzacji jako provider

### Performance:
- Generowanie dużej ilości danych (>20) może trwać kilka sekund
- Cache invalidation powoduje refetch - widoczne w Network tab
- Logi są limitowane tylko w UI (brak limitu w state)

### Limity:
- Maksymalna ilość rezerwacji: 20 (zabezpieczenie backendu)
- Logi w konsoli: bez limitu (mogą zużywać pamięć - wyczyść regularnie)

### Known Issues:
- Niektóre funkcje (usługi, notyfikacje) wymagają implementacji backend
- Brak progress bar dla długich operacji
- Brak real-time updates (trzeba ręcznie odświeżyć cache)

---

## 🚀 Rozszerzanie

### Dodawanie nowej zakładki:

1. **Dodaj w `TabsList`:**
```tsx
<TabsTrigger value="analytics" className="flex items-center gap-2">
  <ChartBar className="w-4 h-4" />
  Analytics
</TabsTrigger>
```

2. **Dodaj komponent:**
```tsx
function AnalyticsSimulator({ addResult, isLoading, setIsLoading }: SimulatorProps) {
  const generateAnalytics = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/dev/generate-analytics');
      addResult('Analytics wygenerowane', 'success');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Button onClick={generateAnalytics}>Generuj analytics</Button>
    </Card>
  );
}
```

3. **Dodaj w content:**
```tsx
<TabsContent value="analytics">
  <AnalyticsSimulator 
    addResult={addResult} 
    isLoading={isLoading} 
    setIsLoading={setIsLoading}
  />
</TabsContent>
```

### Dodawanie nowej akcji:

```typescript
const myNewAction = async () => {
  setIsLoading(true);
  try {
    // Call API
    const response = await apiClient.post('/dev/my-action');
    
    // Log success
    addResult('Akcja wykonana pomyślnie', 'success');
    
    // Invalidate cache
    await queryClient.invalidateQueries({ queryKey: ['my-data'] });
    
  } catch (error: any) {
    addResult(`Błąd: ${error.message}`, 'error');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📝 Changelog

### v1.0.0 (2025-01-31)
- ✅ Initial release
- ✅ 7 zakładek (Rezerwacje, Wiadomości, Opinie, Usługi, Notyfikacje, Płatności, Kalendarz)
- ✅ Integracja z istniejącymi endpointami DEV
- ✅ Live logging konsola
- ✅ Cache management
- ✅ Sidebar link (tylko dev mode)

### Planowane:
- [ ] Real-time progress indicators
- [ ] Export/Import test data
- [ ] Preset scenarios (np. "Full booking workflow")
- [ ] WebSocket event simulation
- [ ] Bulk operations (np. "Accept all pending bookings")

---

## 🤝 Contributing

Przy dodawaniu nowych funkcji pamiętaj:
1. Wszystkie akcje loguj przez `addResult()`
2. Invaliduj odpowiednie query keys po mutacji
3. Obsłuż errory gracefully
4. Dodaj informacje o statusie ("Funkcja w development")
5. Zaktualizuj tę dokumentację

## 📚 Zobacz też

- [API Endpoints](./API_ENDPOINTS.md) - Lista wszystkich endpointów
- [Dev Tools](./DEV_TOOLS.md) - Inne narzędzia deweloperskie
- [Testing Guide](./TESTING.md) - Strategie testowania
