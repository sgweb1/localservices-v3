# Dostępne komponenty Radix UI w projekcie LocalServices

## Zainstalowane pakiety Radix UI

Z `package.json`:
- `@radix-ui/react-checkbox` ^1.3.3
- `@radix-ui/react-dialog` ^1.1.15
- `@radix-ui/react-dropdown-menu` ^2.1.16
- `@radix-ui/react-label` ^2.1.8
- `@radix-ui/react-popover` ^1.1.15
- `@radix-ui/react-radio-group` ^1.3.8
- `@radix-ui/react-slider` ^1.3.6
- `@radix-ui/react-slot` ^1.2.4
- `@radix-ui/react-switch` ^1.2.6
- `@radix-ui/react-tabs` ^1.1.13

## Dostępne komponenty wrapper w `src/components/ui/`

### 1. **Button** (`button.tsx`)
Podstawowy przycisk z wariantami:
- `default`, `primary`, `secondary`, `outline`, `ghost`, `destructive`
- Rozmiary: `sm`, `md`, `lg`, `icon`
```tsx
<Button variant="primary" size="md">Zapisz</Button>
<Button variant="outline" size="sm">Anuluj</Button>
```

### 2. **Input** (`input.tsx`)
Pole tekstowe z automatycznym dark mode:
```tsx
<Input type="text" placeholder="Wpisz tekst..." />
<Input type="number" min={0} max={100} />
```

### 3. **Select** (`select.tsx`)
Lista rozwijana (native select):
```tsx
<Select value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="">Wybierz opcję</option>
  <option value="1">Opcja 1</option>
</Select>
```

### 4. **Combobox** (`combobox.tsx`)
Zaawansowana lista rozwijana z wyszukiwaniem (Radix Popover):
```tsx
<Combobox
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  placeholder="Wybierz miasto"
  searchPlaceholder="Szukaj miasta..."
  emptyText="Nie znaleziono"
  options={[
    { value: '1', label: 'Warszawa' },
    { value: '2', label: 'Kraków' },
  ]}
/>
```

### 5. **Label** (`label.tsx`)
Etykieta dla pól formularza (Radix Label):
```tsx
<Label htmlFor="name">Nazwa</Label>
<Input id="name" />
```

### 6. **Checkbox** (`checkbox.tsx`)
Pole wyboru (Radix Checkbox):
```tsx
<Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
```

### 7. **Switch** (`switch.tsx`)
Przełącznik on/off (Radix Switch):
```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### 8. **Slider** (`slider.tsx`)
Suwak wartości (Radix Slider):
```tsx
<Slider
  value={[rating]}
  onValueChange={(value) => setRating(value[0])}
  min={0}
  max={5}
  step={0.5}
/>
```

### 9. **Radio Group** (`radio-group.tsx`)
Grupa przycisków radio (Radix Radio Group):
```tsx
<RadioGroup value={selected} onValueChange={setSelected}>
  <RadioGroupItem value="1" id="opt1" />
  <Label htmlFor="opt1">Opcja 1</Label>
  <RadioGroupItem value="2" id="opt2" />
  <Label htmlFor="opt2">Opcja 2</Label>
</RadioGroup>
```

### 10. **Dialog** (`dialog.tsx`)
Modal/popup (Radix Dialog):
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>
    <Button>Otwórz dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tytuł</DialogTitle>
      <DialogDescription>Opis dialogu</DialogDescription>
    </DialogHeader>
    {/* Treść */}
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Zamknij</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 11. **Dropdown Menu** (`dropdown-menu.tsx`)
Menu kontekstowe (Radix Dropdown Menu):
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>Edytuj</DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>Usuń</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 12. **Tabs** (`tabs.tsx`)
Zakładki (Radix Tabs):
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="profile">Profil</TabsTrigger>
    <TabsTrigger value="settings">Ustawienia</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">Zawartość profilu</TabsContent>
  <TabsContent value="settings">Zawartość ustawień</TabsContent>
</Tabs>
```

### 13. **Card** (`card.tsx`)
Karta z ramką i paddingiem:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Tytuł karty</CardTitle>
    <CardDescription>Opis</CardDescription>
  </CardHeader>
  <CardContent>Zawartość</CardContent>
  <CardFooter>Stopka</CardFooter>
</Card>
```

### 14. **Badge** (`badge.tsx`)
Mała etykieta/oznaczenie:
```tsx
<Badge variant="default">Nowy</Badge>
<Badge variant="primary">Aktywny</Badge>
<Badge variant="success">Zaakceptowany</Badge>
<Badge variant="destructive">Błąd</Badge>
<Badge variant="neutral">Neutralny</Badge>
```

### 15. **Alert** (`alert.tsx`)
Komunikat informacyjny/ostrzeżenie:
```tsx
<Alert variant="default">
  <AlertTitle>Informacja</AlertTitle>
  <AlertDescription>Treść komunikatu</AlertDescription>
</Alert>
<Alert variant="destructive">
  <AlertTitle>Błąd</AlertTitle>
  <AlertDescription>Coś poszło nie tak</AlertDescription>
</Alert>
```

### 16. **Spinner** (`spinner.tsx`)
Animowany loader (nie Radix, custom):
```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

### 17. **Skeleton** (`skeleton.tsx`)
Placeholder podczas ładowania (nie Radix, custom):
```tsx
<Skeleton className="w-full h-12" />
<Skeleton className="w-24 h-6 rounded-full" />
```

### 18. **Textarea** (`textarea.tsx`)
Wieloliniowe pole tekstowe:
```tsx
<Textarea placeholder="Wpisz tekst..." rows={4} />
```

## Przykłady użycia w projekcie

### ServiceFilter (ServiceList.tsx)
- `Combobox` - wybór miasta z API locations
- `Select` - kategoria i sortowanie
- `Input` - search, cena min/max
- `Slider` - rating i trust score
- `Switch` - instant booking
- `Button` - apply filters, presets

### ServiceDetailsDialog (ServiceDetailsDialog.tsx)
- `Dialog` - modal ze szczegółami usługi
- `Button` - akcje (call, message, favorite)
- `Badge` - Trust Score, kategoria

### ServiceCard (ServiceCard.tsx)
- `Card` - layout usługi
- `Badge` - kategoria, instant booking
- `Button` - favorite (Heart icon)

## Dodatkowe komponenty Radix do rozważenia

Pakiety **nie** zainstalowane, ale warte uwagi:
- `@radix-ui/react-select` - zaawansowany select (alternatywa dla Combobox)
- `@radix-ui/react-toast` - powiadomienia toast
- `@radix-ui/react-tooltip` - tooltips
- `@radix-ui/react-accordion` - akordeon
- `@radix-ui/react-alert-dialog` - dialog potwierdzający
- `@radix-ui/react-context-menu` - menu kontekstowe PPM
- `@radix-ui/react-hover-card` - karty hover
- `@radix-ui/react-progress` - pasek postępu
- `@radix-ui/react-scroll-area` - zaawansowany scroll

## Stylowanie

Wszystkie komponenty używają:
- **Tailwind CSS** dla stylowania
- **CSS Variables** dla motywu (primary, accent, gray w app.css)
- **Dark Mode** automatyczny z `dark:` prefixem
- **clsx** dla warunkowych klas CSS

## Best Practices

1. **Zawsze używaj Label z Input/Select/Checkbox**:
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

2. **Dialog accessibility**:
```tsx
<DialogTitle>Tytuł</DialogTitle>  {/* Wymagany dla screen readers */}
<DialogDescription>Opis</DialogDescription>
```

3. **Keyboard navigation**:
- Wszystkie komponenty Radix wspierają klawiaturę out-of-the-box
- Użyj `Escape` do zamykania dialogów/popoverów
- `Tab` nawigacja między elementami

4. **Dark mode**:
- Dodaj `dark:` warianty do wszystkich custom stylów
- Testuj w obu trybach przed commitem

5. **Responsywność**:
- Użyj `sm:`, `md:`, `lg:` breakpointów
- Testuj na mobile (320px), tablet (768px), desktop (1024px+)
