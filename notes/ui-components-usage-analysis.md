# Analiza Wykorzystania Komponentów UI - Możliwości Refaktoringu

## Dostępne Komponenty w `src/components/ui`

```
✅ button.tsx          - Button component
✅ input.tsx           - Input component
✅ select.tsx          - Select component
✅ textarea.tsx        - Textarea component
✅ checkbox.tsx        - Checkbox component
✅ radio-group.tsx     - Radio group component
✅ switch.tsx          - Switch component
✅ dialog.tsx          - Dialog component
✅ tabs.tsx            - Tabs component
✅ badge.tsx           - Badge component
✅ alert.tsx           - Alert component
✅ dropdown-menu.tsx   - Dropdown menu component
✅ combobox.tsx        - Combobox component
✅ slider.tsx          - Slider component
✅ spinner.tsx         - Spinner component
✅ ProgressBar.tsx     - Progress bar component
✅ label.tsx           - Label component
✅ time-picker.tsx     - Time picker component
✅ day-multi-select.tsx - Day multi-select
✅ skeleton-loader.tsx - Skeleton loader
✅ empty-state.tsx     - Empty state
✅ card.tsx            - Card component
✅ number-stepper.tsx  - Number stepper
✅ GlassCard.tsx       - Glass card
✅ HeroGradient.tsx    - Hero gradient
✅ TextGradient.tsx    - Text gradient
✅ BadgeGradient.tsx   - Badge gradient
✅ IconGradient.tsx    - Icon gradient
```

---

## Pliki Wymagające Refaktoringu

### 1. **AuthDemo.tsx**
**Lokalizacja:** `src/features/auth/components/AuthDemo.tsx`

**Problem:** Używa natywnych `<input>` i `<button>` bez stylowania

**Do refaktoring:**
- Linia 15-16: `<input>` → zastąpić `<Input />`
- Linia 17-19: `<button>` → zastąpić `<Button />`

---

### 2. **ProfileEditForm.tsx**
**Lokalizacja:** `src/features/profile/components/ProfileEditForm.tsx`

**Problem:** Wielokrotne użycia natywnych `<input>` i `<button>`

**Do refaktoring:**
- Linie 89, 101, 126, 143, 170: `<input>` → `<Input />`
- Linia 197: `<button>` → `<Button />`

**Spodziewany wynik:** Spójne stylowanie z resztą aplikacji

---

### 3. **AvatarUpload.tsx**
**Lokalizacja:** `src/features/profile/components/AvatarUpload.tsx`

**Problem:** Natywne przyciski zamiast `<Button />`

**Do refaktoring:**
- Linie 152, 170, 191: `<button>` → `<Button />`
- Linia 120: `<input type="file">` - sprawdzić czy potrzebny komponent

---

### 4. **PasswordChangeForm.tsx**
**Lokalizacja:** `src/features/profile/components/PasswordChangeForm.tsx`

**Problem:** Mieszanka natywnych i stylowanych inputów

**Do refaktoring:**
- Linie 88, 104, 136, 150: `<input>` → `<Input />`
- Linia 175: `<button>` → `<Button />`

---

### 5. **NotificationsTab.tsx**
**Lokalizacja:** `src/features/provider/settings/NotificationsTab.tsx`

**Problem:** Wiele niestylizowanych elementów HTML

**Do refaktoring:**
- Linia 389: Custom badge (inline className) → `<Badge />`
- Linie 399, 459, 465: `<button>` → `<Button />`
- Linie 479, 490, 498, 526: `<input>` → `<Input />`
- Linia 511: `<select>` → `<Select />`

**Uwaga:** Ten plik ma wiele błędów TypeScript (NodeJS undefined) - wymaga przeglądu

---

### 6. **BlockModal.tsx**
**Lokalizacja:** `src/features/provider/calendar/BlockModal.tsx`

**Problem:** Natywne elementy zamiast komponentów

**Do refaktoring:**
- Linie 120, 132: `<input>` → `<Input />`
- Linia 145: `<select>` → `<Select />`
- Linie 171, 186: `<button>` → `<Button />`
- Linie 226, 230: Custom badge → `<Badge />`

---

## Podsumowanie

| Plik | Input | Button | Select | Badge | Button | Priorytet |
|------|-------|--------|--------|-------|--------|-----------|
| AuthDemo.tsx | ✓ | ✓ | - | - | - | 🟢 Niski |
| ProfileEditForm.tsx | ✓✓✓✓ | ✓ | - | - | - | 🟡 Średni |
| AvatarUpload.tsx | ✓ | ✓✓✓ | - | - | - | 🟡 Średni |
| PasswordChangeForm.tsx | ✓✓✓✓ | ✓ | - | - | - | 🟡 Średni |
| NotificationsTab.tsx | ✓✓ | ✓✓ | ✓ | ✓ | - | 🔴 Wysoki |
| BlockModal.tsx | ✓✓ | ✓✓ | ✓ | ✓ | - | 🔴 Wysoki |

---

## Zalecenia Refaktoringu

### Faza 1 (Wysoki priorytet):
- [ ] NotificationsTab.tsx - standaryzacja UI
- [ ] BlockModal.tsx - konsystencja z resztą modali

### Faza 2 (Średni priorytet):
- [ ] ProfileEditForm.tsx - spójne input fieldy
- [ ] PasswordChangeForm.tsx - spójne input fieldy
- [ ] AvatarUpload.tsx - spójne buttony

### Faza 3 (Niski priorytet):
- [ ] AuthDemo.tsx - demo component

---

## Potencjalne Korzyści

✅ **Spójność designu** - Wszystkie input/button/select zgodne z design systemem
✅ **Zmniejszenie kodu** - Komponent UI zawiera stylowanie i logikę
✅ **Łatwiejsze testy** - Komponenty UI testowe
✅ **Accessibility** - Komponenty UI mają wbudowaną dostępność
✅ **Responsive design** - Komponenty obsługują mobile automatycznie
✅ **Dark mode** - Jeśli komponenty obsługują dark mode

---

Created: 2024-12-23
