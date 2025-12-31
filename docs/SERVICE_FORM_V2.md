# ServiceFormPageV2 - Dokumentacja

## 📋 Przegląd

Nowy formularz edycji usługi zbudowany z Radix UI primitives i custom form components.

## 🎨 Komponenty użyte

### Z `src/components/ui/form.tsx`:
```typescript
<FormField 
  label="Tytuł usługi" 
  required 
  error={errors.title}
  help="Min 5 znaków"
>
  <Input value={title} onChange={...} />
</FormField>
```
- **FormField** - wrapper dla każdego pola (label, error, help text)
- **FormSection** - sekcja z nagłówkiem i border
- **FormRow** - 2 kolumny na desktop, 1 na mobile
- **FormActions** - sticky footer z przyciskami
- **CharacterCount** - licznik znaków z limitem

### Z Radix UI:
```typescript
<RadioGroup value={pricingType} onValueChange={...}>
  <RadioGroupItem value="hourly" label="Płatność godzinowa" />
</RadioGroup>

<Slider 
  value={[maxDistanceKm]} 
  onValueChange={([val]) => setMaxDistanceKm(val)}
  min={0} max={100} step={5}
/>

<Switch 
  checked={willingToTravel} 
  onCheckedChange={setWillingToTravel}
/>

<Tabs.Root value={activeTab} onValueChange={setActiveTab}>
  <Tabs.List>
    <Tabs.Trigger value="basic">Podstawowe</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="basic">...</Tabs.Content>
</Tabs.Root>
```

## 📐 Struktura Formularza

### 4 główne TABy:
1. **Podstawowe** - tytuł, opis, kategoria, status
2. **Ceny** - pricing type (radio), ceny, jednostka
3. **Rezerwacja** - switches, min notice, duration
4. **Lokalizacja** - location select, travel slider, fee

### Przykład sekcji:

```typescript
function BasicInfoSection({ formData, onChange, errors, categories }) {
  return (
    <FormSection title="Podstawowe" description="...">
      <FormField label="Tytuł" required error={errors.title}>
        <Input 
          value={formData.title}
          onChange={e => onChange('title', e.target.value)}
        />
      </FormField>
    </FormSection>
  );
}
```

## 🔄 Flow Danych

### 1. Inicjalizacja:
```typescript
const [formData, setFormData] = useState<ServiceFormData>({
  title: '',
  description: '',
  category: null,
  pricingType: 'hourly',
  // ...
});
```

### 2. Change Handler (centralizowany):
```typescript
const handleChange = (field: keyof ServiceFormData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Wyczyść error dla tego pola
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

**CZEMU centralizowany handler?**
- Jeden punkt do update state
- Automatyczne czyszczenie błędów
- Type safety (TypeScript sprawdza klucze)
- Łatwiejszy debugging

### 3. Validation:
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (formData.title.length < 5) {
    newErrors.title = 'Tytuł musi mieć min 5 znaków';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 4. Save:
```typescript
const handleSave = async () => {
  if (!validateForm()) {
    toast.error('Popraw błędy');
    return;
  }
  
  setIsSaving(true);
  
  try {
    await updateService(serviceId, formData);
    toast.success('Zapisano!');
    navigate('/provider/services');
  } catch (error) {
    toast.error('Błąd');
  } finally {
    setIsSaving(false);
  }
};
```

## 🎯 Conditional Rendering

### Przykład 1: Różne pola dla różnych pricing types

```typescript
{(pricingType === 'hourly' || pricingType === 'fixed') && (
  <FormField label="Cena bazowa">
    <Input type="number" value={basePrice} />
  </FormField>
)}

{pricingType === 'quote' && (
  <FormRow>
    <FormField label="Cena od">...</FormField>
    <FormField label="Cena do">...</FormField>
  </FormRow>
)}
```

**CZEMU conditional?**
- UX: Klient widzi tylko relevantne pola
- Walidacja: Nie trzeba validować niewidocznych pól
- Backend: Wysyłamy tylko potrzebne dane

### Przykład 2: Travel settings tylko gdy willing to travel

```typescript
<Switch 
  checked={willingToTravel}
  onCheckedChange={checked => onChange('willingToTravel', checked)}
/>

{willingToTravel && (
  <>
    <Slider value={[maxDistanceKm]} ... />
    <Input value={travelFeePerKm} ... />
  </>
)}
```

## 🎨 Styling z Tailwind

### Responsive Design:
```typescript
<FormRow className="grid grid-cols-1 md:grid-cols-2">
  // Na mobile: 1 kolumna (stack)
  // Na desktop (md+): 2 kolumny obok siebie
</FormRow>
```

### Dark Mode:
```typescript
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
// Automatycznie przełącza się gdy user zmieni theme
```

### Sticky Footer:
```typescript
<FormActions className="fixed bottom-0 left-0 right-0 z-40">
  // Zawsze widoczny na dole podczas scrollowania
</FormActions>
```

## 📊 TypeScript Types

```typescript
type PricingType = 'hourly' | 'fixed' | 'quote';
type ServiceStatus = 'active' | 'paused' | 'draft';

interface ServiceFormData {
  // Podstawowe
  title: string;
  description: string;
  category: ServiceCategory | null;
  
  // Ceny
  pricingType: PricingType;
  basePrice: string;  // string bo z input, później Number()
  
  // Rezerwacja
  instantBooking: boolean;  // ze Switch
  minNoticeHours: string;
  
  // Lokalizacja
  maxDistanceKm: number;  // ze Slider
  willingToTravel: boolean;
}
```

**CZEMU string dla liczb?**
- Input value jest string
- User może wpisać "12.50" lub puste ""
- Konwertujemy do number przy save: `Number(basePrice)`

## 🔧 Dodawanie Nowej Sekcji

### Krok 1: Dodaj pola do ServiceFormData

```typescript
interface ServiceFormData {
  // ... existing
  newField: string;
}
```

### Krok 2: Dodaj do initial state

```typescript
const [formData, setFormData] = useState<ServiceFormData>({
  // ... existing
  newField: '',
});
```

### Krok 3: Stwórz komponent sekcji

```typescript
function NewSection({ formData, onChange, errors }) {
  return (
    <FormSection title="Nowa Sekcja" description="...">
      <FormField label="Nowe pole" error={errors.newField}>
        <Input 
          value={formData.newField}
          onChange={e => onChange('newField', e.target.value)}
        />
      </FormField>
    </FormSection>
  );
}
```

### Krok 4: Dodaj tab

```typescript
<Tabs.Trigger value="new">Nowa Sekcja</Tabs.Trigger>

<Tabs.Content value="new">
  <NewSection formData={formData} onChange={handleChange} errors={errors} />
</Tabs.Content>
```

## 🎓 Nauka: Jak to działa?

### 1. Radix UI Primitives
```typescript
<RadioGroup> // Kontener
  <RadioGroupItem value="hourly" /> // Pojedynczy radio
</RadioGroup>
```

**Korzyści:**
- ✅ Accessibility (keyboard navigation, screen readers)
- ✅ Headless (brak wbudowanych stylów - my kontrolujemy wygląd)
- ✅ Type safety (TypeScript z pudełka)
- ✅ Zero dependencies (oprócz React)

### 2. Controlled Components
```typescript
<Input 
  value={formData.title}  // React kontroluje wartość
  onChange={e => onChange('title', e.target.value)}  // Update state
/>
```

**CZEMU controlled?**
- React jest single source of truth
- Łatwa walidacja (bo wszystko w state)
- Można modyfikować value przed zapisem
- Łatwiejsze testowanie

### 3. Tabs dla Dużych Formularzy
```typescript
<Tabs.Root value={activeTab}>
  // Zmienia activeTab gdy user klika
</Tabs.Root>
```

**CZEMU tabs?**
- UX: Nie overwhelmujemy usera wszystkimi polami na raz
- Performance: Tylko aktywny tab się renderuje
- Mobile-friendly: Łatwiej scrollować małe sekcje

## ✅ Checklist - Co zostało

- [x] Sekcja 1: Podstawowe informacje
- [x] Sekcja 2: Ceny i model biznesowy
- [x] Sekcja 3: Rezerwacja i dostępność
- [x] Sekcja 4: Lokalizacja i dojazd
- [ ] Sekcja 5: Zawartość usługi (what included, requirements, tools)
- [ ] Sekcja 6: Polityki (cancellation policy)
- [ ] Sekcja 7: Zdjęcia (drag & drop)
- [ ] Sekcja 8: SEO (meta title, description)
- [ ] Backend API integration
- [ ] Testy unit/integration

## 🚀 Następne kroki

1. Dodać pozostałe 4 sekcje (5-8)
2. Zintegrować z backend API
3. Dodać photo upload z drag & drop
4. Implementować mapę (Leaflet)
5. Dodać testy
