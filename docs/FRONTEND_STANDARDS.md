# Standardy Frontend - LocalServices Provider Panel

## Przegląd
Ten dokument definiuje standardy designu i komponentów dla panelu providera w LocalServices (ls2).
Wszystkie nowe strony powinny używać tych wzorców dla spójności.

## Design System

### Kolory i Gradienty
- **Primary gradient**: `from-cyan-600 via-teal-500 to-cyan-500` (hero sections)
- **Accent gradient**: `from-cyan-400 to-teal-500` (ikony, akcenty)
- **Success**: `from-emerald-400 to-teal-500`
- **Warning**: `from-amber-400 to-orange-500`
- **Neutral**: `from-slate-400 to-slate-500`
- **Info**: `from-cyan-400 to-blue-500`

### Typografia
- **Hero title**: `text-4xl sm:text-5xl font-black` w kolorze white na gradiencie
- **Section title**: `text-2xl font-black text-slate-900`
- **Card title**: `text-lg font-bold text-slate-900`
- **Body text**: `text-sm text-slate-600`
- **Stats value**: `text-3xl font-black text-slate-900`

### Spacing & Layout
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`
- **Section spacing**: `space-y-8` (między głównymi sekcjami)
- **Card spacing**: `space-y-4` (wewnątrz karty)
- **Grid gaps**: `gap-4` (stats cards), `gap-6` (content grid)

### Rounded Corners
- **Hero sections**: `rounded-3xl`
- **Cards**: `rounded-2xl`
- **Buttons**: `rounded-xl`
- **Badges**: `rounded-lg`
- **Icons containers**: `rounded-xl`

## Komponenty Standardowe

### 1. PageHeader
**Lokalizacja**: `src/features/provider/components/PageHeader.tsx`

**Zastosowanie**: Header każdej strony providera z tytułem, statystykami i przyciskiem akcji.

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: StatCard[];
  actionButton?: {
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
  };
}

interface StatCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string; // np. 'from-emerald-400 to-teal-500'
}
```

**Przykład użycia**:
```tsx
<PageHeader
  title="Moje Usługi"
  subtitle="Zarządzaj ofertą"
  stats={[
    { label: 'Aktywne usługi', value: 10, icon: Sparkles, accent: 'from-emerald-400 to-teal-500' },
    { label: 'Wyświetlenia', value: 1234, icon: TrendingUp, accent: 'from-cyan-400 to-blue-500' },
  ]}
  actionButton={{
    label: 'Dodaj usługę',
    icon: Plus,
    href: '/provider/services/create',
  }}
/>
```

### 2. ServiceCard
**Lokalizacja**: `src/features/provider/components/ServiceCard.tsx`

**Zastosowanie**: Karta pojedynczej usługi w gridzie.

**Props**:
```typescript
interface ServiceCardProps {
  id: number;
  name: string;
  category: string;
  price: string;
  status: 'active' | 'inactive';
  views?: number;
  imageUrl?: string;
}
```

**Przykład użycia**:
```tsx
<ServiceCard
  id={1}
  name="Instalacja hydrauliczna"
  category="Hydraulika"
  price="150 zł/h"
  status="active"
  views={45}
/>
```

## Layout Pattern

### Standardowa struktura strony:
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    {/* Hero z PageHeader */}
    <PageHeader {...props} />

    {/* Główna zawartość */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Karty content */}
    </div>
  </div>
</div>
```

## Glass Card Pattern

**Klasa bazowa**: `glass-card`

**Definicja w CSS**:
```css
.glass-card {
  @apply bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-sm;
}
```

**Użycie w komponencie**:
```tsx
<div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
  {/* Content */}
</div>
```

### Warianty glass-card:
- **Standard**: `glass-card rounded-2xl p-6`
- **Hero stats**: `glass-card bg-white/90 border border-white/40 rounded-2xl p-4`
- **Empty state**: `glass-card rounded-2xl p-12 text-center`
- **Error state**: `glass-card rounded-2xl p-12 border-2 border-red-200 bg-red-50/50`

## Loading & Empty States

### Loading State:
```tsx
<div className="glass-card rounded-2xl p-12 text-center">
  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
    <Icon className="w-8 h-8 text-cyan-600 animate-pulse" />
  </div>
  <p className="text-slate-600 font-semibold">Ładowanie...</p>
</div>
```

### Empty State:
```tsx
<div className="glass-card rounded-2xl p-12 text-center">
  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
    <Icon className="w-10 h-10 text-cyan-600" />
  </div>
  <h3 className="text-2xl font-black text-slate-900 mb-3">Tytuł pustego stanu</h3>
  <p className="text-slate-600 mb-8">Opis co użytkownik może zrobić</p>
  <Button>Akcja CTA</Button>
</div>
```

## Buttons

### Primary Action (gradient):
```tsx
<button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
  <Icon className="w-6 h-6" />
  Akcja
</button>
```

### Secondary Action:
```tsx
<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all">
  <Icon className="w-4 h-4" />
  Akcja
</button>
```

### Tertiary/Ghost:
```tsx
<button className="px-4 py-2.5 rounded-xl text-cyan-600 hover:bg-cyan-50 font-semibold transition-all">
  Akcja
</button>
```

## Badges

### Status Badge:
```tsx
<span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
  status === 'active'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-600'
}`}>
  {label}
</span>
```

## Icon Containers

### Gradient Icon Box:
```tsx
<div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
  <Icon className="w-5 h-5" />
</div>
```

### Large Hero Icon:
```tsx
<div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center">
  <Icon className="w-10 h-10 text-cyan-600" />
</div>
```

## Responsive Grids

### 3-Column Content Grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Stats Grid (w hero):
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Stat cards */}
</div>
```

## Animacje i Transitions

- **Hover shadow**: `hover:shadow-xl transition-all`
- **Button hover**: `hover:scale-105 transition-all`
- **Card hover**: `hover:shadow-xl transition-all`
- **Color transitions**: `transition-colors`
- **Loading pulse**: `animate-pulse`

## Przykłady Implementacji

### ✅ Prawidłowo zaimplementowane strony:
1. **Dashboard** (`src/features/provider/dashboard/components/DashboardPage.tsx`)
   - Hero z Trust Score
   - Stat cards z gradientami
   - Glass cards dla Recent sections

2. **Calendar** (`src/features/provider/calendar/CalendarPage.tsx`)
   - Hero z filtrami
   - Glass cards dla slotów
   - Spójne buttony i badges

3. **Bookings** (`src/features/provider/pages/BookingsPageWithTabs.tsx`)
   - Tabs z gradientami
   - Glass cards dla rezerwacji
   - Empty states z CTA

4. **Services** (`src/features/provider/pages/ServicesPage.tsx`) - **NOWY**
   - Używa PageHeader component
   - ServiceCard dla gridów
   - Pełna spójność z innymi stronami

## Checklist dla Nowych Stron

- [ ] Używa `PageHeader` dla hero section
- [ ] Background: `bg-gradient-to-br from-slate-50 via-white to-slate-100`
- [ ] Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`
- [ ] Wszystkie karty używają `glass-card`
- [ ] Rounded corners: `rounded-2xl` lub `rounded-3xl`
- [ ] Gradienty konsystentne: cyan/teal
- [ ] Loading state z animated icon
- [ ] Empty state z CTA button
- [ ] Error state z border-red-200
- [ ] Responsywne gridy (md:grid-cols-2 xl:grid-cols-3)
- [ ] Icons z lucide-react
- [ ] Hover states i transitions

## Migracja Starych Stron

Jeśli spotykasz stary kod używający:
- ❌ `<Card>` z `@/components/ui/card` → zamień na `glass-card`
- ❌ `<PageTitle gradient>` → zamień na `PageHeader` component
- ❌ `<Button>` z ui/button → użyj gradient button patterns
- ❌ Inline gradient styles → użyj standardowych klas z tego dokumentu

## Narzędzia Dev

### Tailwind IntelliSense
W VSCode zainstaluj: `bradlc.vscode-tailwindcss`

### Prettier dla formatowania
```json
{
  "tailwindFunctions": ["clsx", "cn"]
}
```

## Kontakt i Pytania

Przy wątpliwościach co do stylu:
1. Sprawdź `DashboardPage.tsx` jako referencję
2. Użyj PageHeader jeśli możliwe
3. Zachowaj glass-card pattern
4. Konsultuj z tym dokumentem

---

**Ostatnia aktualizacja**: 2025-12-29  
**Wersja**: 1.0  
**Autor**: GitHub Copilot + Szymon
