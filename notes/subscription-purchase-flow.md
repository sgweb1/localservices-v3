# 🛒 Ścieżka Zakupu Subskrypcji & Zarządzanie Planami

**Data**: 24 grudnia 2025  
**Status**: Planowanie implementacji  
**Opcje**: SOFT (na koniec okresu) + HARD LOCK (natychmiastowy)

---

## 📋 Dostępne Plany Subskrypcji

| Plan | Cena | Okres | Usługi | Zdjęcia/usługa | Portfolio | Kalendarz | Instant Booking | Messaging | Subdomena | Analityka |
|------|------|-------|--------|---|----------|-----------|-----------------|-----------|-----------|-----------|
| **FREE** | 0 PLN | - | 1 | 3 | 10 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **BASIC** | 49 PLN | M / 416,50 PLN (R) | 3 | 10 | 20 | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PRO** | 99 PLN | M / 841,50 PLN (R) | 10 | 30 | 50 | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PREMIUM** | 199 PLN | M / 1691,50 PLN (R) | 50 | 50 | 100 | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legenda**: M = Miesięcznie, R = Rocznie (~15% rabat)

---

## 🛣️ Krok 1: Przeglądanie Planów

### Lokalizacja
- **URL**: `/pricing` lub `/subscription/plans`
- **Route**: `provider.subscription.plans`
- **Komponent**: `PricingTable.tsx` lub `SubscriptionPlansPage.tsx`

### Wyświetlanie
```
┌─────────────────────────────────────┐
│  Plany Subskrypcji                  │
├─────────────────────────────────────┤
│ FREE    │ BASIC★ │ PRO  │ PREMIUM  │
│ 0 PLN   │ 49 PLN │ 99 PLN│ 199 PLN │
│ Miesięc │ Rocz:  │ Rocz: │ Rocz:   │
│ -       │ 416,50 │ 841,50│1691,50  │
│         │        │       │         │
│ Funkcje:         │ Subdomain ✅ ✅  │
│ 1 ogł.  │ 3 ogł. │ 10 og. │ 30 og. │
│ ❌ Cal  │ ✅ Cal │ ✅ Cal │ ✅ Cal │
│ ❌ Chat │ ✅ Chat│ ✅ Chat│ ✅ Chat │
│ ...     │ ...    │ ...    │ ...     │
└─────────────────────────────────────┘
```

### Logika wyświetlania
- Zaznacz **obecny plan** użytkownika (background inny)
- Oznacz ⭐ popularny plan (BASIC)
- Pokaż **rabat roczny** poniżej ceny
- Wyświetl przycisk: "Wybierz plan" / "Już posiadasz" / "Zmień plan"

---

## 🛣️ Krok 2: Selekcja Planu & Potwierdzenie

### Ekran potwierdzenia
Po kliknie "Wybierz plan", wyświetl modal/stronę z:

```
Podsumowanie zamówienia
═════════════════════════════════════

Plan: BASIC
Cena: 49,00 PLN / miesiąc

Data startu:
○ Natychmiast (zmiana już dziś)
○ Na koniec okresu (SOFT - bezpłatnie)

Obecny plan: FREE
Zmiana: FREE → BASIC

Funkcje które otrzymasz:
✅ 3 ogłoszenia (zamiast 1)
✅ Instant Booking
✅ System Wiadomości
✅ Galeria zdjęć
✅ Kalendarz dostępności

─────────────────────────────────────
Całkowita kwota: 49,00 PLN

[Anuluj]  [Przejdź do płatności]
```

### Walidacje
- ✅ Można zmienić tylko na plan wyższy (bez downgrade'u tutaj)
- ✅ Jeśli wybrano "SOFT", pokaż datę wygaśnięcia obecnego planu
- ✅ Jeśli użytkownik ma FREE → BASIC, pokaż "Pierwsza transakcja"
- ⚠️ **BEZ ZWROTÓW** - jasno wypisz: "Płatności nie podlegają zwrotowi"

---

## 🛣️ Krok 3: Metoda Płatności

### Payment Gateway (Stripe/PayU)
```
Metoda płatności
═════════════════════════════════════

Numer karty:  [__ __ __ __][__ __ __ __]...
Wygasa:       [MM/YY]
CVV:          [___]

Imię:         [____________]
Adres:        [____________]

☑ Zapamiętaj tę kartę
☑ Zgadzam się z regulaminem
☑ Rozumiem, że nie ma zwrotów

[Anuluj]  [Zapłać 49,00 PLN]
```

### Obsługa błędów
- Kartę odrzucono → "Spróbuj inną kartę"
- Limit wydatków → "Przekroczono limit karty"
- 3x błąd → "Skontaktuj się z obsługą"

---

## 🛣️ Krok 4: Potwierdzenie Płatności & Aktywacja

### Sukces
```
✅ Płatność potwierdzona!

Numer transakcji: TRX_20251224_12345

Plan BASIC został aktywowany
Okres: 24 grudnia 2025 - 24 stycznia 2026

Nowe możliwości:
✅ 3 ogłoszenia (było: 1)
✅ Instant Booking
✅ Wiadomości
✅ Galeria

Następna płatność: 24 stycznia 2026 (49,00 PLN)
Możesz anulować w dowolnym momencie

[Przejdź do dashboardu]
```

### Email potwierdzenia
```
Temat: ✅ Subskrypcja BASIC aktywna

Cześć [Imię],

Twoja subskrypcja BASIC została aktywowana.

Plan: BASIC
Cena: 49,00 PLN/miesiąc
Data startu: 24 grudnia 2025
Następna płatność: 24 stycznia 2026

Funkcje:
✅ 3 ogłoszenia
✅ Instant Booking
✅ System wiadomości
✅ Galeria (do 50 zdjęć)
✅ Kalendarz

Możesz zmienić lub anulować plan tutaj:
[Link do ustawień]

Pozdrawiamy,
LocalServices Team
```

---

## ⏰ Krok 5: Automatyczny Downgrade po Wygaśnięciu

### Scenario: Koniec okresu subskrypcji

```
DATA WYGAŚNIĘCIA: 24 stycznia 2026

1. PRZED 7 DNIAMI (17 stycznia)
   └─ Email: "Twoja subskrypcja BASIC wygasa za 7 dni"
      - Opcja: Przedłużyć za 1 klik
      - Opcja: Zmienić na inny plan
      - Opcja: Anulować (downgrade do FREE)

2. DZIEŃ PRZED (23 stycznia)
      └─ Email: "Ostatnia szansa! Wygasa jutro"
         - Przypomnienie ceny
         - Link do przedłużenia

3. DZIEŃ WYGAŚNIĘCIA (24 stycznia)
   ├─ Rano: Email "Dziękujemy za współpracę"
   ├─ Licznik: "Twoja subskrypcja wygasa dziś o 23:59"
   ├─ Dashboard: Widoczny alert
   │  "Plan BASIC kończy się dziś o 23:59"
   │  [Przedłużyć za 49 PLN] [X]
   │
   └─ 23:59: AUTOMATYCZNY DOWNGRADE
      └─ Plan zmieniony: BASIC → FREE
      └─ Email: "Plan zmieniony na FREE"

4. PO WYGAŚNIĘCIU (25 stycznia +)
   ├─ Dashboard: Nowy plan FREE
   ├─ Ograniczenia aktywne:
   │  ❌ Widoczna tylko 1 z 3 usług
   │  ❌ Instant Booking wyłączony
   │  ❌ Wiadomości dostępne (RO)
   │
   └─ UI pokaże:
      "Plan FREE — możesz mieć maksymalnie
       1 usługę. Pozostałe 2 ukryte.
       [Upgrade do BASIC] Aby je pokazać"
```

---

## 🔒 Limity & Blocking Logika

### OPCJA 2: SOFT (Na koniec okresu)
```
SCENARIUSZ: Użytkownik ma BASIC, chce PRO
- Cena: 99 PLN (dodatkowo)
- Datę startu: "Na koniec okresu"
- Wygaśnięcie: 24 stycznia 2026
- Zmiana: 24 stycznia 2026 o 00:00
- Cena PRO: Pierwszy miesiąc proporcjonalny

LOGIKA:
1. Zapamiętaj nowy plan w kolumnie "pending_plan"
2. W dniu wygaśnięcia: UPDATE users.subscription_plan_id = PRO
3. Cofnij limity starego planu
4. Aktywuj limity nowego planu
```

### OPCJA B: HARD LOCK (Natychmiastowe)
```
SCENARIUSZ: Downgrade z PRO na BASIC
- Zmiana: Natychmiast
- Limity: Natychmiastowe
- Co się dzieje:

❌ LOCK NATYCHMIASTOWY:
   - Usługi: Pokaż tylko pierwsze N
   - Pozostałe usługi → HIDDEN (grey-out)
   - Zdjęcia usługi: Pokaz tylko pierwsze M
   - Dodatkowe zdjęcia → HIDDEN (grey-out, overlay)
   - Portfolio: Pokazuj tylko pierwsze K zdjęć
   - Reszta: Niedostępna (overlay: "Upgrade do {plan}")

💾 DANE: Bezpieczne!
   - Usługi nie są usuwane
   - Zdjęcia pozostają na serwerze
   - Portfolio pozostaje na serwerze
   - Można je odblokować upgradem

🔄 GDY ZMIANA PLANU:
   - BASIC → PRO: Od razu dostęp do 7 ukrytych
   - PRO → BASIC: Ukrycie 7 ogłoszeń (5s animacja)
```

---

## 📊 Tabela limitów po HARD LOCK

| Funkcja | FREE | BASIC | PRO | PREMIUM |
|---------|------|-------|-----|---------|
| **Usługi** | 1 (aktywna) | 3 (aktywne) | 10 (aktywnych) | 50 (aktywnych) |
| **Dodatkowe usługi** | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Zdjęcia per usługa** | 3 | 10 | 30 | 50 |
| **Dodatkowe zdjęcia usługi** | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Portfolio (galeria)** | 10 zdjęć | 20 zdjęć | 50 zdjęć | 100 zdjęć |
| **Dodatkowe zdjęcia portfolio** | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Wideo promocyjne (URL)** | ❌ | ✅ (1) | ✅ (1) | ✅ (1) |
| **Instant Booking** | ❌ | ✅ | ✅ | ✅ |
| **Kalendarz** | ❌ | ✅ | ✅ | ✅ |
| **Wiadomości** | ❌ | ✅ | ✅ | ✅ |
| **Subdomena** | ❌ | ❌ | ✅ | ✅ |
| **Analityka** | ❌ | ❌ | ✅ (Podstawowa) | ✅ (Pełna) |

---

## 📈 Analityka - Co w Jakim Planie?

### **FREE** ❌ 
Brak dostępu do analityki.

### **BASIC** ❌
Brak dostępu do analityki.

### **PRO** ✅ **Podstawowa Analityka**
```
📊 DOSTĘP DO:
  ├─ Liczba wyświetleń profilu (ostatnie 30 dni)
  ├─ Liczba kliknięć na "Kontakt"
  ├─ Liczba wiadomości otrzymanych
  ├─ Liczba rezerwacji / zapytań
  ├─ Najpopularniejsza usługa
  ├─ TOP 5 usług (ranking)
  ├─ Czas odpowiedzi średni
  └─ Rata konwersji (szacunkowa)

📅 DOSTĘPNE OKRESY:
  └─ Ostatnie 7 dni, 30 dni

📊 FORMAT:
  └─ Przegląd w dashboardzie (karty)
  └─ Eksport: CSV (ostatnie 30 dni)
```

### **PREMIUM** ✅ **Pełna Analityka**
```
📊 WSZYSTKO Z PRO PLUS:
  ├─ Liczba wyświetleń per usługa (szczegół)
  ├─ Liczba kliknięć per usługa
  ├─ Godzina/dzień/tydzień piku popularności
  ├─ Geolokacja klientów (miasto)
  ├─ Źródło klienta (organic, direct, referral)
  ├─ Mobilność (mobile vs desktop)
  ├─ Trend konwersji (linia na wykresie)
  ├─ Średnia wartość zamówienia
  ├─ ROI kampanii (przychód vs koszt subskrypcji)
  ├─ Porównanie z poprzednim okresem (Δ %)
  ├─ Top regiony geograficzne
  └─ Predykcja zysku (30/60/90 dni)

📅 DOSTĘPNE OKRESY:
  └─ Dowolny zakres dat
  └─ Porównanie rok do roku (YoY)
  └─ Roczne trendy

📊 FORMAT:
  ├─ Interaktywne wykresy (line, bar, pie)
  ├─ Raporty na email (tygodniowo/miesięcznie)
  ├─ Eksport: CSV, PDF, Excel
  └─ API dostęp: NIE (zaplanowany na Q2 2026)
```

---

## 🎬 Wideo Promocyjne

| Aspekt | Details |
|--------|---------|
| **Format** | URL (YouTube, Vimeo) |
| **Limit BASIC/PRO/PREMIUM** | 1 URL na profil |
| **Przechowywanie** | Nie przechowujemy pliku (tylko link) |
| **Walidacja** | Sprawdzenie czy URL jest poprawny |
| **Wyświetlanie** | Embed iframe na profilu |
| **Usuwanie** | Użytkownik sam kasuje link w ustawieniach |

### Walidacja URL
```javascript
// Akceptuj:
- https://youtube.com/watch?v=XXX
- https://youtu.be/XXX
- https://vimeo.com/XXX
- https://www.youtube.com/embed/XXX

// Odrzuć:
- Inne domeny
- Bare linki bez https://
- Pliki MP4 (muszą być na YouTube/Vimeo)
```

---

## ⚠️ API - Status

**Aktualnie**: ❌ Brak  
**Planuje się**: Q2 2026  
**Dla**: Integracje z CRM, Automatyzacja raportów, Dashboard partnerski

```
⏳ CZEKAMY NA:
  ├─ Stabilizację platformy
  ├─ Finalizację schematu bazy danych
  ├─ Feedback z użytkowników
  └─ Rate limiting policy

DOSTĘP API BĘDZIE W Premium PLAN DOPIERO PO ZAPLANOWANIU
```

---

## 🚨 Bez Zwrotów - Polityka

### Jasne komunikaty w UI
```
⚠️ UWAGA: Refundacja niemożliwa

Płatności za subskrypcje nie podlegają zwrotowi.
W przypadku anulowania planu, dostęp do planu
zachowasz do końca okresu rozliczeniowego.

Przykład:
- Zakup: 24 grudnia 2025 za 49 PLN
- Wygaśnięcie: 24 stycznia 2026
- Anulowanie: 25 grudnia 2025
- Dostęp: Do 24 stycznia 2026
- Refund: ❌ Brak zwrotu za pozostałe dni
```

### W emailu potwierdzenia
```
"Rozumiesz, że płatności za subskrypcje nie
podlegają zwrotowi. W przypadku anulowania,
zachowasz dostęp do końca okresu
rozliczeniowego."
```

---

## 🗓️ Timeline Automacji

```
┌─────────────────────────────────────────────────────────┐
│ AUTOMATYCZNE PROCESY (Cron/Queue)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ CODZIENNIE O 00:00                                      │
│ └─ Sprawdzenie: czy wygasa dziś jakiś plan?            │
│    └─ TAK → Zmiana planu na FREE/poprzedni             │
│    └─ Email potwierdzenia                              │
│                                                         │
│ CO 7 DNI (np. poniedziałek)                            │
│ └─ Sprawdzenie: czy wygasa za 7 dni?                   │
│    └─ TAK → Email przypomnienia                        │
│                                                         │
│ CO GODZINĘ                                              │
│ └─ Sprawdzenie: czy przedłużania w kolejce?            │
│    └─ Przetworzenie płatności                          │
│    └─ Aktywacja nowego okresu                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Struktury Bazy Danych

### Tabela: `users`
```sql
ALTER TABLE users ADD COLUMN (
  subscription_plan_id BIGINT UNSIGNED,
  pending_plan_id BIGINT UNSIGNED NULL,
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  subscription_status ENUM('active', 'pending_upgrade', 'expired', 'cancelled'),
  subscription_auto_renew BOOLEAN DEFAULT TRUE,
  last_payment_intent_id VARCHAR(255),
  next_billing_date DATE
);
```

### Tabela: `subscription_transactions`
```sql
CREATE TABLE subscription_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED,
  plan_id BIGINT UNSIGNED,
  type ENUM('payment', 'refund', 'downgrade'),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'PLN',
  transaction_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'cancelled'),
  metadata JSON,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Tabela: `subscription_events` (Audit log)
```sql
CREATE TABLE subscription_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED,
  event_type ENUM('upgraded', 'downgraded', 'renewed', 'cancelled', 'expired'),
  from_plan_id BIGINT UNSIGNED NULL,
  to_plan_id BIGINT UNSIGNED,
  reason VARCHAR(255),
  created_at TIMESTAMP
);
```

---

## 🎯 Implementacja - Kolejność

- [ ] **Faza 1**: Wyświetlanie planów + selekcja
- [ ] **Faza 2**: Integracja Stripe/PayU + processing płatności
- [ ] **Faza 3**: Email automacji (7 dni, 1 dzień, 0 dni)
- [ ] **Faza 4**: Automatyczny downgrade (cron job)
- [ ] **Faza 5**: HARD LOCK logika (hiding limitów)
- [ ] **Faza 6**: Testing + refinement UI

---

## ✅ Checklist Implementacji

### Backend
- [ ] Model `SubscriptionTransaction`
- [ ] Model `SubscriptionEvent`
- [ ] Controller: `SubscriptionController@show` (lista planów)
- [ ] Controller: `SubscriptionController@upgrade` (zmiana planu)
- [ ] Job: `ProcessSubscriptionRenewals` (cron)
- [ ] Job: `SendSubscriptionReminders` (7 dni, 1 dzień)
- [ ] Job: `AutoDowngradeExpiredPlans` (zmiana na FREE)
- [ ] Policy: `SubscriptionPolicy` (autoryzacja)
- [ ] Service: `SubscriptionService` (logika biznesowa)

### Frontend (React)
- [ ] Komponent: `PricingTable.tsx`
- [ ] Komponent: `SubscriptionModal.tsx` (potwierdzenie)
- [ ] Komponent: `PaymentForm.tsx` (Stripe Elements)
- [ ] Hook: `useSubscription()` (state + API)
- [ ] Store: Redux/Context (limit alerts)
- [ ] Alert UI: Gdy limit wygasa (countdown)

### Notifications
- [ ] Email: "Plan wygasa za 7 dni"
- [ ] Email: "Plan wygasa jutro"
- [ ] Email: "Plan zmieniony na FREE"
- [ ] Email: "Płatność odrzucona"
- [ ] In-app: Banner "Limit zdjęć osiągnięty"

---

**Data ostatniej aktualizacji**: 24 grudnia 2025
