# Provider Dashboard - Szczegółowy Breakdown Widgetów

Data: 2025-12-19
Cel: Identyczny wygląd i działanie jak LocalServices DashboardNew

---

## 1. PLAN CARD

### Dane (z API)
```typescript
{
  plan_name: string;          // "FREE", "BASIC", "PRO", "PREMIUM"
  plan_slug: string;          // "free", "basic", "pro", "premium"
  expires_at: string | null;  // "31.12.2025" lub null
  items: Array<{
    key: string;              // "max_listings", "max_service_categories"
    title: string;            // "Ogłoszenia", "Kategorie usług"
    description: string;      // "Widoczne w katalogu"
    icon: string;             // "heroicon-o-rectangle-stack"
    current: number;          // 5
    limit: number;            // 10
    percentage: number;       // 50
    is_unlimited: boolean;    // false
    is_exceeded: boolean;     // false
  }>;
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: 
  - Plan name (font-bold, text-lg) + badge z kolorem per plan
  - Expires date (text-xs, text-gray-500) - jeśli nie FREE
  - CTA "Upgrade" (btn-gradient) - jeśli nie najwyższy plan
- **Body**: 
  - Lista limitów (2 items: max_listings, max_service_categories)
  - Każdy limit: icon (w icon-gradient-1), title, description, ProgressBar
  - Ostrzeżenie (bg-error/10, text-error) jeśli is_exceeded
- **Footer**: Link "Zarządzaj subskrypcją" → `/provider/subscription/plans`

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-bold text-lg">{plan_name}</h3>
        {expires_at && (
          <p className="text-xs text-gray-500">Wygasa: {expires_at}</p>
        )}
      </div>
      <BadgeGradient>{plan_name}</BadgeGradient>
    </div>
    
    {/* Limits */}
    {items.map(item => (
      <div key={item.key} className="space-y-2">
        <div className="flex items-center gap-3">
          <IconGradient variant={1}>
            <Icon name={item.icon} className="w-5 h-5 text-white" />
          </IconGradient>
          <div className="flex-1">
            <p className="font-semibold text-sm">{item.title}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
        </div>
        <ProgressBar 
          current={item.current}
          limit={item.limit}
          isUnlimited={item.is_unlimited}
          isExceeded={item.is_exceeded}
        />
        {item.is_exceeded && (
          <div className="text-xs text-error bg-error/10 p-2 rounded-lg">
            ⚠️ Przekroczono limit - usuń {item.current - item.limit} pozycji
          </div>
        )}
      </div>
    ))}
    
    {/* Footer */}
    <a href="/provider/subscription/plans" className="text-xs text-primary-600">
      Zarządzaj subskrypcją →
    </a>
  </div>
</GlassCard>
```

---

## 2. ADDONS CAROUSEL

### Dane (z API)
```typescript
[
  {
    key: string;              // "instant-booking", "analytics"
    title: string;            // "Instant Booking"
    description: string;      // "Pozwalaj klientom rezerwować..."
    feature: string;          // "instant_booking"
    required_plan: string;    // "PRO"
    icon: string;             // "heroicon-o-bolt"
    available: boolean;       // true
    cta_url: string;          // "/provider/analytics" lub "/provider/subscription/plans"
    badge: string;            // "Aktywne" lub "Od PRO"
  }
]
```

### UI (LocalServices design)
- **Layout**: Carousel (2 karty obok siebie na desktop, scroll horizontal mobile)
- **Card**: glass-card, rounded-2xl, p-6, hover:shadow-xl
- **Header**: 
  - Icon (icon-gradient-2 lub icon-gradient-3 per addon)
  - Badge (badge-gradient jeśli available, bg-gray-200 jeśli nie)
- **Body**: 
  - Title (font-bold, text-lg)
  - Description (text-sm, text-gray-600)
- **Footer**: CTA button (btn-gradient jeśli available, btn-outline jeśli nie)

### Komponenty React
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {addons.map(addon => (
    <GlassCard key={addon.key} hover className="rounded-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <IconGradient variant={addon.key === 'instant-booking' ? 2 : 3}>
            <Icon name={addon.icon} className="w-6 h-6 text-white" />
          </IconGradient>
          {addon.available ? (
            <BadgeGradient>Aktywne</BadgeGradient>
          ) : (
            <span className="badge bg-gray-200 text-gray-700">Od {addon.required_plan}</span>
          )}
        </div>
        
        {/* Body */}
        <div>
          <h4 className="font-bold text-lg">{addon.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
        </div>
        
        {/* Footer */}
        <a 
          href={addon.cta_url}
          className={addon.available ? 'btn-gradient' : 'btn-outline'}
        >
          {addon.available ? 'Zobacz więcej' : 'Aktywuj'}
        </a>
      </div>
    </GlassCard>
  ))}
</div>
```

---

## 3. PIPELINE BOARD

### Dane (z API)
```typescript
{
  period: string;             // "Ostatnie 30 dni"
  can_view_details: boolean;  // true jeśli hasFeature('instant_booking' + 'messaging')
  requests: {
    incoming: number;         // 12
    quoted: number;           // 8
    converted: number;        // 5
    conversion_rate: number;  // 20.0 (%)
  };
  bookings: {
    pending: number;          // 3
    confirmed: number;        // 7
    completed: number;        // 15
  };
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: 
  - "Pipeline" title
  - Period badge (text-xs, bg-gray-100)
- **Body (2 sekcje)**: 
  1. **Zapytania**: 3 kolumny (incoming → quoted → converted), strzałki między
     - Liczba + label per kolumna
     - Konwersja % (text-gradient, font-bold, text-2xl) poniżej
  2. **Rezerwacje**: 3 kolumny (pending → confirmed → completed)
     - Liczba + label per kolumna
- **Gating**: Jeśli !can_view_details, blur liczby + overlay "Aktywuj plan PRO"

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg">Pipeline</h3>
      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">{period}</span>
    </div>
    
    {/* Zapytania */}
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Zapytania ofertowe</p>
      <div className="grid grid-cols-3 gap-4 relative">
        {!can_view_details && (
          <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
            <div className="glass-card p-4 text-center">
              <p className="text-sm font-semibold">Aktywuj plan PRO</p>
              <a href="/provider/subscription/plans" className="btn-gradient mt-2">
                Zobacz plany
              </a>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{requests.incoming}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Przychodzące</p>
        </div>
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{requests.quoted}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Wycenione</p>
        </div>
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{requests.converted}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Przekonwertowane</p>
        </div>
      </div>
      
      {/* Conversion rate */}
      <div className="text-center">
        <TextGradient strong className="text-2xl font-bold">
          {requests.conversion_rate}%
        </TextGradient>
        <p className="text-xs text-gray-500">Konwersja leadów</p>
      </div>
    </div>
    
    {/* Rezerwacje (analogicznie) */}
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Rezerwacje</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{bookings.pending}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Oczekujące</p>
        </div>
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{bookings.confirmed}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Potwierdzone</p>
        </div>
        <div className="text-center">
          <TextGradient className="text-3xl font-bold">{bookings.completed}</TextGradient>
          <p className="text-xs text-gray-600 mt-1">Zakończone</p>
        </div>
      </div>
    </div>
  </div>
</GlassCard>
```

---

## 4. INSIGHTS CARD

### Dane (z API)
```typescript
{
  trust_score: number;        // 85
  trust_delta: number;        // +15 (względem progu 70)
  click_rate: number | null;  // 5.2 (%) lub null
  completed: number;          // 12 (w tym miesiącu)
  traffic_sources: Array<{
    label: string;            // "Katalog LocalServices"
    value: number;            // 45
  }>;
  period_label: string;       // "Ostatnie 30 dni"
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Insights" + period badge
- **Body (4 sekcje)**: 
  1. **Trust Score™**: duża liczba (text-gradient, text-5xl), delta per kolor (green/red)
  2. **CTR**: % (text-2xl, text-gray-700), label poniżej (text-xs)
  3. **Completed**: liczba (text-2xl, text-gray-700), label "Zakończonych zleceń"
  4. **Traffic Sources**: mini bar chart (3 paski z label + value)

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-6">
    <h3 className="font-bold text-lg">Insights</h3>
    
    {/* Trust Score */}
    <div className="text-center">
      <TextGradient strong className="text-5xl font-bold">{trust_score}</TextGradient>
      <p className="text-xs text-gray-500 mt-1">Trust Score™</p>
      <p className={`text-sm font-semibold mt-2 ${trust_delta >= 0 ? 'text-success' : 'text-error'}`}>
        {trust_delta >= 0 ? '+' : ''}{trust_delta} od progu (70)
      </p>
    </div>
    
    {/* CTR */}
    {click_rate && (
      <div>
        <p className="text-2xl font-bold text-gray-700">{click_rate}%</p>
        <p className="text-xs text-gray-500">Wskaźnik klikalności</p>
      </div>
    )}
    
    {/* Completed */}
    <div>
      <p className="text-2xl font-bold text-gray-700">{completed}</p>
      <p className="text-xs text-gray-500">Zakończonych zleceń (ten miesiąc)</p>
    </div>
    
    {/* Traffic Sources */}
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Źródła ruchu</p>
      <div className="space-y-2">
        {traffic_sources.map(source => (
          <div key={source.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">{source.label}</span>
              <span className="font-semibold">{source.value}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500"
                style={{ width: `${(source.value / traffic_sources.reduce((sum, s) => sum + s.value, 0)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</GlassCard>
```

---

## 5. TASKS CARD

### Dane (z API)
```typescript
{
  progress: number;           // 60 (%)
  items: Array<{
    id: string;               // "portfolio", "instant-booking-optin"
    title: string;            // "Dodaj zdjęcia realizacji"
    description: string;      // "Minimum 3 zdjęcia..."
    completed: boolean;       // false
    route: string;            // "/provider/profile/edit"
    reward: string | null;    // "+5 Trust Score™"
  }>;
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: 
  - "Zadania" title
  - Progress bar circular (60%) + "6/10 wykonanych"
- **Body**: 
  - Lista zadań (max 5 widocznych, "Zobacz więcej" jeśli >5)
  - Każde zadanie: checkbox (completed), title, description, reward badge, CTA arrow
- **Footer**: CTA "Uzupełnij profil" jeśli progress < 100

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg">Zadania</h3>
      <div className="text-right">
        <TextGradient className="text-2xl font-bold">{progress}%</TextGradient>
        <p className="text-xs text-gray-500">{items.filter(i => i.completed).length}/{items.length}</p>
      </div>
    </div>
    
    {/* Tasks list */}
    <div className="space-y-3">
      {items.slice(0, 5).map(task => (
        <a 
          key={task.id}
          href={task.route}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
        >
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
            task.completed 
              ? 'bg-success border-success' 
              : 'border-gray-300'
          }`}>
            {task.completed && (
              <Icon name="check" className="w-3 h-3 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
            {task.reward && !task.completed && (
              <BadgeGradient className="mt-2">{task.reward}</BadgeGradient>
            )}
          </div>
          <Icon name="chevron-right" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
        </a>
      ))}
    </div>
    
    {/* Footer */}
    {progress < 100 && (
      <button className="btn-gradient w-full">
        Uzupełnij profil
      </button>
    )}
  </div>
</GlassCard>
```

---

## 6. PERFORMANCE SNAPSHOT

### Dane (z API)
```typescript
{
  response_minutes: number | null;   // 45 (min) lub null
  completion_rate: number | null;    // 92.5 (%) lub null
  repeat_customers: number | null;   // 8 lub null
  cancellation_rate: number | null;  // 2.1 (%) lub null
  trust_score: number;               // 85
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Wydajność" title
- **Body**: Grid 2x2 (4 metryki), każda:
  - Icon w icon-gradient (per metryka)
  - Wartość (text-2xl, font-bold)
  - Label (text-xs, text-gray-500)
  - Kolor wartości per metryka (green/red/gray)

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    <h3 className="font-bold text-lg">Wydajność</h3>
    
    <div className="grid grid-cols-2 gap-4">
      {/* Response Time */}
      <div className="text-center">
        <IconGradient variant={1}>
          <Icon name="clock" className="w-5 h-5 text-white" />
        </IconGradient>
        <p className="text-2xl font-bold text-gray-700 mt-2">
          {response_minutes ? `${response_minutes} min` : '—'}
        </p>
        <p className="text-xs text-gray-500">Czas odpowiedzi</p>
      </div>
      
      {/* Completion Rate */}
      <div className="text-center">
        <IconGradient variant={3}>
          <Icon name="check-circle" className="w-5 h-5 text-white" />
        </IconGradient>
        <p className={`text-2xl font-bold mt-2 ${
          completion_rate && completion_rate >= 90 ? 'text-success' : 'text-gray-700'
        }`}>
          {completion_rate ? `${completion_rate}%` : '—'}
        </p>
        <p className="text-xs text-gray-500">Ukończonych</p>
      </div>
      
      {/* Repeat Customers */}
      <div className="text-center">
        <IconGradient variant={2}>
          <Icon name="users" className="w-5 h-5 text-white" />
        </IconGradient>
        <p className="text-2xl font-bold text-gray-700 mt-2">
          {repeat_customers ?? '—'}
        </p>
        <p className="text-xs text-gray-500">Powracających</p>
      </div>
      
      {/* Cancellation Rate */}
      <div className="text-center">
        <IconGradient variant={1}>
          <Icon name="x-circle" className="w-5 h-5 text-white" />
        </IconGradient>
        <p className={`text-2xl font-bold mt-2 ${
          cancellation_rate && cancellation_rate > 5 ? 'text-error' : 'text-gray-700'
        }`}>
          {cancellation_rate ? `${cancellation_rate}%` : '—'}
        </p>
        <p className="text-xs text-gray-500">Anulowanych</p>
      </div>
    </div>
    
    {/* Trust Score footer */}
    <div className="text-center pt-4 border-t border-gray-200">
      <TextGradient strong className="text-3xl font-bold">{trust_score}</TextGradient>
      <p className="text-xs text-gray-500 mt-1">Trust Score™</p>
    </div>
  </div>
</GlassCard>
```

---

## 7. CALENDAR GLANCE

### Dane (z API)
```typescript
{
  slots: Record<string, Array<{
    date: string;             // "2025-12-20"
    title: string;            // "Rezerwacja" (blur jeśli !can_view_details)
    status: string;           // "pending", "confirmed", "completed"
    time: string | null;      // "10:00" lub null (blur)
    is_blurred: boolean;      // true jeśli brak uprawnień
  }>>;                        // max 3 dni, 2 sloty/dzień
  can_view_details: boolean;  // true jeśli hasFeature('instant_booking' + 'messaging')
  calendar_url: string;       // "/provider/availability"
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Kalendarz" title + CTA "Zobacz wszystkie" → calendar_url
- **Body**: 
  - 3 kolumny (po dacie), każda:
    - Data (dzień/miesiąc, text-sm, text-gray-700)
    - Max 2 sloty (title + time + badge status)
    - Blur text jeśli is_blurred + overlay "Aktywuj plan"
- **Footer**: Link "Zarządzaj dostępnością"

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg">Kalendarz</h3>
      <a href={calendar_url} className="text-xs text-primary-600">
        Zobacz wszystkie →
      </a>
    </div>
    
    {/* Slots (3 dni) */}
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(slots).slice(0, 3).map(([date, daySlots]) => (
        <div key={date} className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            {new Date(date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
          </p>
          {daySlots.slice(0, 2).map((slot, idx) => (
            <div 
              key={idx}
              className={`p-2 rounded-lg border ${slot.is_blurred ? 'blur-sm' : ''}`}
            >
              <p className="text-xs font-semibold">{slot.title}</p>
              {slot.time && (
                <p className="text-xs text-gray-500">{slot.time}</p>
              )}
              <span className={`badge text-[10px] mt-1 ${
                slot.status === 'confirmed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
              }`}>
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
    
    {!can_view_details && (
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">Aktywuj plan PRO, aby zobaczyć szczegóły</p>
      </div>
    )}
    
    {/* Footer */}
    <a href={calendar_url} className="text-xs text-primary-600">
      Zarządzaj dostępnością →
    </a>
  </div>
</GlassCard>
```

---

## 8. MESSAGE CENTER

### Dane (z API)
```typescript
{
  requests: Array<{
    id: number;               // 123
    customer: string;         // "Jan Kowalski"
    status: string;           // "pending", "quoted", "accepted"
    created_at: string;       // "2 godziny temu"
    quote_due: string | null; // "31.12" (data ważności oferty)
  }>;                         // max 4
  unread_notifications: number; // 3
  messages_url: string;       // "/provider/messages"
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Wiadomości" + badge z unread_notifications
- **Body**: 
  - Lista 4 ostatnich zapytań (customer, status badge, created_at)
  - Status badge per kolor (pending=orange, quoted=blue, accepted=green)
  - Quote due (jeśli quoted) - czerwony jeśli < 24h
- **Footer**: CTA "Zobacz wszystkie wiadomości"

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg">Wiadomości</h3>
      {unread_notifications > 0 && (
        <BadgeGradient>{unread_notifications} nowych</BadgeGradient>
      )}
    </div>
    
    {/* Requests list */}
    <div className="space-y-2">
      {requests.map(request => (
        <a 
          key={request.id}
          href={`${messages_url}/${request.id}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{request.customer}</p>
            <p className="text-xs text-gray-500">{request.created_at}</p>
            {request.quote_due && (
              <p className="text-xs text-error mt-1">Do: {request.quote_due}</p>
            )}
          </div>
          <span className={`badge text-xs ${
            request.status === 'pending' ? 'bg-warning/20 text-warning' :
            request.status === 'quoted' ? 'bg-accent/20 text-accent' :
            'bg-success/20 text-success'
          }`}>
            {request.status}
          </span>
        </a>
      ))}
    </div>
    
    {/* Footer */}
    <a href={messages_url} className="btn-outline w-full">
      Zobacz wszystkie wiadomości
    </a>
  </div>
</GlassCard>
```

---

## 9. NOTIFICATIONS CARD

### Dane (z API)
```typescript
{
  notifications: Array<{
    id: string;               // "uuid"
    type: string;             // "App\Notifications\BookingCreated"
    data: object;             // { message: "Nowa rezerwacja" }
    read_at: string | null;   // "2 godziny temu" lub null
    created_at: string;       // "2 godziny temu"
  }>;                         // max 5
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Powiadomienia" title
- **Body**: 
  - Lista 5 ostatnich powiadomień (icon per type, message, created_at)
  - Nieprzeczytane: bg-primary/10, font-semibold
  - Przeczytane: bg-white, font-normal
- **Footer**: Link "Zobacz wszystkie" → `/provider/notifications`

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    <h3 className="font-bold text-lg">Powiadomienia</h3>
    
    <div className="space-y-2">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-3 rounded-lg ${
            !notification.read_at ? 'bg-primary/10' : 'bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon name="bell" className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                !notification.read_at ? 'font-semibold' : 'font-normal'
              }`}>
                {notification.data.message}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{notification.created_at}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <a href="/provider/notifications" className="text-xs text-primary-600">
      Zobacz wszystkie →
    </a>
  </div>
</GlassCard>
```

---

## 10. SERVICES CARD

### Dane (z API)
```typescript
{
  services: Array<{
    id: number;               // 123
    title: string;            // "Naprawa instalacji wodnych"
    status: string;           // "active", "draft", "paused"
    views_count: number;      // 145
    category: string;         // "Hydraulika"
  }>;                         // top 6 by views_count
}
```

### UI (LocalServices design)
- **Layout**: glass-card, rounded-2xl, p-6
- **Header**: "Top usługi" title + CTA "Zarządzaj" → `/provider/services`
- **Body**: 
  - Grid 2 kolumny (3 rzędy)
  - Każda usługa: title (truncate), category badge, views_count (icon + liczba)
  - Status badge (active=green, draft=gray, paused=orange)
- **Footer**: Link "Dodaj nową usługę" + "Zobacz wszystkie"

### Komponenty React
```tsx
<GlassCard className="rounded-2xl">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg">Top usługi</h3>
      <a href="/provider/services" className="text-xs text-primary-600">
        Zarządzaj →
      </a>
    </div>
    
    {/* Services grid */}
    <div className="grid grid-cols-2 gap-3">
      {services.map(service => (
        <a 
          key={service.id}
          href={`/provider/services/${service.id}/edit`}
          className="p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition"
        >
          <p className="text-sm font-semibold truncate">{service.title}</p>
          <p className="text-xs text-gray-500 mt-1">{service.category}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Icon name="eye" className="w-3 h-3" />
              <span>{service.views_count}</span>
            </div>
            <span className={`badge text-[10px] ${
              service.status === 'active' ? 'bg-success/20 text-success' :
              service.status === 'draft' ? 'bg-gray-200 text-gray-700' :
              'bg-warning/20 text-warning'
            }`}>
              {service.status}
            </span>
          </div>
        </a>
      ))}
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
      <a href="/provider/services/create" className="text-xs text-primary-600 font-semibold">
        + Dodaj nową
      </a>
      <a href="/provider/services" className="text-xs text-gray-500">
        Zobacz wszystkie →
      </a>
    </div>
  </div>
</GlassCard>
```

---

## PODSUMOWANIE

**Wszystkie 10 widgetów gotowe do implementacji w React:**

1. ✅ Plan Card - limity + progress bars
2. ✅ Addons Carousel - Instant Booking + Analytics PRO
3. ✅ Pipeline Board - leady + rezerwacje + konwersja
4. ✅ Insights Card - Trust Score + CTR + traffic sources
5. ✅ Tasks Card - onboarding + growth + progress %
6. ✅ Performance Snapshot - 4 metryki + Trust Score
7. ✅ Calendar Glance - 3 dni, 2 sloty/dzień, blur gating
8. ✅ Message Center - 4 ostatnie zapytania + unread badge
9. ✅ Notifications Card - 5 ostatnich powiadomień
10. ✅ Services Card - top 6 usług by views_count

**Design System:**
- ✅ Shared UI: GlassCard, TextGradient, BadgeGradient, ProgressBar, IconGradient
- ✅ Tailwind custom: .glass-card, .hero-gradient, .icon-gradient-*, .badge-gradient
- ✅ Paleta: primary (cyan), accent (blue), glass (white/opacity), gray
- ✅ Fonts: Archivo, rounded-2xl/3xl, backdrop-blur

**Backend API:**
- ✅ ProviderDashboardApiService - 10 metod prepare*
- ✅ ProviderDashboardController - GET /api/v1/provider/dashboard/widgets
- ✅ Route zarejestrowany w routes/api/v1/provider.php

**Następne kroki:**
1. TypeScript types dla wszystkich 10 widgetów
2. API Client + hook useDashboardWidgets
3. Implementacja 10 komponentów widgets/ (React)
4. DashboardGrid, DashboardHero, DashboardPage
