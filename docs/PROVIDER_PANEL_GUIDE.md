# 📊 Panel Providera - Kompletny Opis Funkcjonalności

**Data:** 29 grudnia 2025  
**Wersja:** Phase 7 MVP  
**Status:** ✅ Production Ready

---

## 🎯 Przegląd Panelu

Panel providera to kompleksowe narzędzie do zarządzania biznesem usług. Składa się z 8 głównych sekcji dostępnych z lewego menu (Sidebar).

### Struktura Nawigacji

```
Panel Providera (/provider)
├── 📊 Dashboard (główna)
├── 📅 Rezerwacje (Zlecenia + Moje rezerwacje)
├── 🗓️ Kalendarz (Dostępność)
├── 💬 Wiadomości (Chat)
├── 🛠️ Usługi (CRUD usług)
├── 👤 Profil (Dane + Weryfikacja)
├── 💳 Monetyzacja (Boost + Subskrypcja)
└── ⚙️ Ustawienia (Profil biznesu + Powiadomienia + Bezpieczeństwo)
```

---

## 1️⃣ DASHBOARD - Pulpit Główny

**URL:** `/provider/dashboard`  
**Przeznaczenie:** Szybki przegląd biznesu - KPI na pierwszy rzut oka

### 📌 Główne Komponenty

#### A) Hero Section (Nagłówek z powitaniem)
```
┌─────────────────────────────────────────────────┐
│  Witaj, [Imię]!                                 │
│  Panel providera                                │
│                                                 │
│  [Przejdź do kalendarza] [Zarządzaj rezerwacjami]
│                    │  Trust Score™ Badge       │
│                    │  [Wartość 0-100]          │
└─────────────────────────────────────────────────┘
```

**Opcje:**
- ✅ Wyświetlanie imienia providera z greetingiem
- ✅ Szybkie linki do kalendarza i rezerwacji
- ✅ Badge Trust Score™ z kolorem (amber jeśli < 70)
- ✅ Trust Score = reputacja (jeśli < 70, brak premium visibility)

#### B) Hero Stats (3 metryki)
```
┌─────────────┬──────────────┬──────────────┐
│ Oczekujące  │ Potwierdzone │ Nieprzeczytane
│ [liczba]    │ [liczba]     │ [liczba]
└─────────────┴──────────────┴──────────────┘
```

**Opcje:**
- ✅ Liczba rezerwacji oczekujących (pending)
- ✅ Liczba potwierdzone rezerwacji (confirmed)
- ✅ Liczba nieprzeczytanych wiadomości (unread)
- ✅ Real-time aktualizacja z API

#### C) Summary Cards (4 karty podsumowania)
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Zapytania        │ Potwierdzone     │ Ukończone        │ Trust Score™     │
│ ofertowe         │ rezerwacje       │                  │                  │
│ [liczba]         │ [liczba]         │ [liczba]         │ [0-100]          │
│ Ostatnie 30 dni  │ Instant+ręczne   │ Zamknięte zl.    │ Premium visible? │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Opcje:**
- ✅ Zapytania ofertowe (incoming + quoted)
- ✅ Potwierdzone rezerwacje (instant booking + ręczne)
- ✅ Ukończone rezerwacje (completed)
- ✅ Trust Score™ z podpowiedź na temat premium visibility

#### D) Performance Metrics (Wydajność)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Wyświetlenia │ Ulubione     │ Ś.w. odpow   │ Ocena        │
│ [liczba]     │ [liczba]     │ [liczba h]   │ [liczba/5]   │
│ W ostatnich  │ W ostatnich  │ Średni czas  │ Z opinii     │
│ 7 dni        │ 7 dni        │ odpowiedzi   │ klientów     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Opcje:**
- ✅ Wyświetlenia profilu (ostatnie 7 dni)
- ✅ Liczba dodanych do ulubionych
- ✅ Średni czas odpowiedzi na wiadomości
- ✅ Średnia ocena z opinii klientów
- ✅ Dane pobierane z real-time API

#### E) Recent Bookings & Messages (2-kolumnowy grid)
```
┌─────────────────────────┬─────────────────────────┐
│ Ostatnie Rezerwacje     │ Ostatnie Wiadomości     │
│                         │                         │
│ • [Data] [Klient]       │ • [Klient]: [wiadom.]   │
│   [Usługa] [Status]     │   [Data] [Unread icon]  │
│ • [Data] [Klient]       │ • [Klient]: [wiadom.]   │
│   [Usługa] [Status]     │   [Data]                │
│                         │                         │
│ [Przejdź do rezerwacji] │ [Przejdź do czatu]      │
└─────────────────────────┴─────────────────────────┘
```

**Opcje:**
- ✅ 2-5 ostatnich rezerwacji z datą, klientem, usługą, statusem
- ✅ 2-5 ostatnich wiadomości z klientem i preview tekstu
- ✅ Bezpośrednie linki do pełnych sekcji
- ✅ Loading state i empty state

---

## 2️⃣ REZERWACJE - Zarządzanie Zleceniami

**URL:** `/provider/bookings`  
**Przeznaczenie:** Pełne zarządzanie rezerwacjami w roli providera i klienta

### 📌 Struktura - Dual Role

System obsługuje **2 role jednocześnie** dla providera:
1. **Provider Role** - rezerwacje jako świadczący usługi
2. **Customer Role** - rezerwacje jako klient

### 📌 Zakładka 1: "Zlecenia" (Provider View)

```
┌────────────────────────────────────────────┐
│ Rezerwacje > [Zlecenia] [Moje rezerwacje] │
├────────────────────────────────────────────┤
│ Filtry:                                     │
│ [Status ▼] [Data ▼] [Klient ▼]            │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ [Data] Klient: Jan Nowak             │  │
│ │ Usługa: Sprzątanie biura              │  │
│ │ Status: PENDING | Cena: 200 PLN      │  │
│ │ [Szczegóły] [Akceptuj] [Odrzuć]      │  │
│ └──────────────────────────────────────┘  │
│ ┌──────────────────────────────────────┐  │
│ │ [Data] Klient: Maria Kowalska        │  │
│ │ Usługa: Usługi konsultingowe         │  │
│ │ Status: CONFIRMED | Cena: 500 PLN    │  │
│ │ [Szczegóły] [Anuluj] [Oznacz jako]   │  │
│ └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

**Dostępne Opcje:**
- ✅ Filtrowanie po statusie (Oczekujące, Potwierdzone, Ukończone, Anulowane)
- ✅ Filtrowanie po dacie
- ✅ Filtrowanie po kliencie
- ✅ Wyszukiwanie
- ✅ Sortowanie (data, cena, status)

**Akcje na Rezerwacji:**
- ✅ **PENDING** → Akceptuj (zmienia na CONFIRMED)
- ✅ **PENDING** → Odrzuć (zmienia na REJECTED z powodem)
- ✅ **CONFIRMED** → Oznacz jako completed
- ✅ **CONFIRMED** → Anuluj (z powodem)
- ✅ **Dowolny** → Wyświetl szczegóły (klient, data, godzina, cena, lokalizacja)
- ✅ **Dowolny** → Wyślij wiadomość do klienta
- ✅ **Dowolny** → Dodaj notatkę wewnętrzną

**Status Rezerwacji:**
```
PENDING     → oczekuje na akceptację providera
CONFIRMED   → potwierdzono (gotowe do realizacji)
COMPLETED   → zakończono (z opinią klienta)
REJECTED    → odrzucono (z powodem)
CANCELLED   → anulowano (z powodem)
```

### 📌 Zakładka 2: "Moje Rezerwacje" (Customer View)

**Wyświetlanie rezerwacji gdzie provider jest KLIENTEM** (używa aplikacji do rezerwacji usług u innych providerów)

```
┌────────────────────────────────────────────┐
│ Rezerwacje > [Zlecenia] [Moje rezerwacje] │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  │
│ │ [Data] Provider: Adam Serwis         │  │
│ │ Usługa: Naprawa lodówki              │  │
│ │ Status: CONFIRMED | Cena: 150 PLN    │  │
│ │ [Szczegóły] [Anuluj] [Dodaj opinię]  │  │
│ └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

**Dostępne Opcje:**
- ✅ Przeglądanie rezerwacji u innych providerów
- ✅ Filtrowanie i sortowanie
- ✅ Anulowanie rezerwacji
- ✅ Dodawanie opinii
- ✅ Komunikacja z providerem

---

## 3️⃣ KALENDARZ - Zarządzanie Dostępnością

**URL:** `/provider/calendar`  
**Przeznaczenie:** Zarządzanie harmonogramem, slotami dostępności, blokami czasu

### 📌 Widok Tygodniowy

```
┌──────────────────────────────────────────────────────────────┐
│ Kalendarz Dostępności                                        │
│ [◀ Poprzedni] Tydzień: 25-31 grudnia 2025 [Następny ▶]     │
├──────────────────────────────────────────────────────────────┤
│  Pon 25    Wt 26     Śr 27     Czw 28    Pt 29   Sob 30  Nie 31
│ ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ │ Wolne │ Wolne │ Zajęte │ Blok   │ Wolne  │ Wolne  │ Wolne  │
│ │ 08-17 │ 08-17 │        │        │ 10-14  │ DZIEŃ  │ DZIEŃ  │
│ │        │       │ Rezerwacja  │ (dostepny │ OFF    │ OFF    │
│ │        │       │ 09:00-11:00 │ po rezerwacji) │       │
│ │        │       │        │ 14:00-15:00│       │       │
│ └────────┴────────┴────────┴────────┴────────┴────────┴────────┘
└──────────────────────────────────────────────────────────────┘
```

### 📌 Operacje na Dostępności

#### A) Dodaj Slot (Dostępność)
```
[+ Dodaj dostępność] → Modal:
- Data: [Data picker]
- Godzina od: [Time picker]
- Godzina do: [Time picker]
- Powtarzaj: [Brak / Co tydzień / Co miesiąc]
- [Anuluj] [Dodaj]
```

**Opcje:**
- ✅ Ustawienie dnia i godzin dostępności
- ✅ Powtarzanie (jednorazowo, tygodniowo, miesięcznie)
- ✅ Edycja po dodaniu
- ✅ Usunięcie
- ✅ Duplikowanie (Copy)

#### B) Dodaj Blok (Niedostępność)
```
[+ Blokada czasu] → Modal:
- Typ: [Urlop / Zajęty / Niedostępny]
- Data od: [Date picker]
- Data do: [Date picker]
- Powód (opcjonalnie): [Tekst]
- Powtarzaj: [Brak / Co tydzień]
- [Anuluj] [Zablokuj]
```

**Opcje:**
- ✅ Blokowanie dnia/godzin
- ✅ Powtarzające się bloki (urlopy, dni niezdolności)
- ✅ Dodanie opisu powodu (widoczny dla klientów)
- ✅ Edycja i usunięcie

#### C) Godziny Pracy (Ustawienia)
```
Ustawienia domyślne godzin pracy:
- Poniedziałek: 08:00 - 17:00
- Wtorek:       08:00 - 17:00
- Środa:        08:00 - 17:00
- Czwartek:     08:00 - 17:00
- Piątek:       08:00 - 17:00
- Sobota:       [Wyłączone] / 08:00 - 14:00
- Niedziela:    [Wyłączone]

[Zapisz zmiany]
```

**Opcje:**
- ✅ Ustawienie godzin dla każdego dnia tygodnia
- ✅ Włączenie/wyłączenie dni
- ✅ Zastosowanie dla wszystkich dni jednocześnie
- ✅ Automatyczne generowanie slotów na miesiąc

### 📌 Statystyki Kalendarza

```
┌─────────────────────────────────────────┐
│ Statystyki Dostępności (Ostatnie 30 dni)│
├─────────────────────────────────────────┤
│ Godziny dostępne:      168 godz          │
│ Godziny zarezerwowane: 32 godz (19%)     │
│ Godziny wolne:         136 godz (81%)    │
│ Średnia rez./dzień:    1,07               │
│ Wskaźnik wypełnienia:  19%                │
└─────────────────────────────────────────┘
```

**Opcje:**
- ✅ Przegląd statystyk dostępności
- ✅ Wskaźnik wypełnienia harmonogramu
- ✅ Średnia rezerwacji dziennie
- ✅ Eksport harmonogramu (ICS/PDF)

---

## 4️⃣ WIADOMOŚCI - System Czatu

**URL:** `/provider/messages`  
**Przeznaczenie:** Komunikacja z klientami w stylu Facebook Messenger

### 📌 Interfejs

```
┌──────────────────┬─────────────────────────────────────┐
│ Wiadomości       │ Chat z: Jan Nowak                   │
│ [🔍 Szukaj]      ├─────────────────────────────────────┤
│                  │ Dziś 14:32                          │
│ Aktywne|Ukryte  │ Jan: Czy możesz jutro?              │
│                  │                                     │
│ • Jan Nowak      │ Ty: Oczywiście! 10:00 czy 11:00?   │
│   Czy możesz..   │ Dziś 15:15                          │
│   3h temu        │                                     │
│                  │ Jan: 11:00 super!                   │
│ • Maria K.       │                                     │
│   Ok, dziękuję   │ ┌────────────────────────────────┐  │
│   1d temu        │ │ [📎] Wpisze wiadomość...  [➤]  │  │
│                  │ └────────────────────────────────┘  │
│ • Adam S.        │                                     │
│   Jaki jest adres│                                     │
│   2d temu        │                                     │
│                  │                                     │
└──────────────────┴─────────────────────────────────────┘
```

### 📌 Opcje Wiadomości

- ✅ **Wysyłanie wiadomości tekstowych**
- ✅ **Załączniki** (zdjęcia, dokumenty)
- ✅ **Emoji picker**
- ✅ **Historia czatu** - pełna historia konwersacji
- ✅ **Oznaczeń jako przeczytane** - automatyczne
- ✅ **Mute konwersacji** - wyłączenie notyfikacji
- ✅ **Archiwum konwersacji** - "Ukryte" konwersacje
- ✅ **Szukanie** - szukanie po kontaktach i tekście
- ✅ **Notyfikacje** - badge z liczbą nieprzeczytanych
- ✅ **Status online** - czy klient/provider jest dostępny

### 📌 Filtry

```
[Aktywne] [Ukryte]
- Aktywne: wszystkie bieżące konwersacje
- Ukryte: zarchiwizowane konwersacje
```

---

## 5️⃣ USŁUGI - Zarządzanie Ofertą

**URL:** `/provider/services`  
**Przeznaczenie:** CRUD usług - tworzenie, edycja, publikacja, archiwizacja

### 📌 Lista Usług

```
┌──────────────────────────────────────────────────────────┐
│ Moje Usługi - Zarządzaj ofertą                           │
│                                                           │
│ Statystyki:                                               │
│ • Aktywne usługi: 12    • Wyświetlenia: 3.456           │
│ • Nieaktywne: 2         • Dodane do ulubionych: 87       │
│                                                           │
│ [+ Dodaj usługę]                                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ┌────────────────────────┬────────────────────────┐      │
│ │ 🔧 Naprawa komputerów  │ 💇 Strzyżenie męskie  │      │
│ │ Status: AKTYWNA        │ Status: AKTYWNA       │      │
│ │ Cena: 80 PLN           │ Cena: 45 PLN          │      │
│ │ Wyświetlenia: 234      │ Wyświetlenia: 156     │      │
│ │                        │                       │      │
│ │ [Edytuj] [Archiwizuj]  │ [Edytuj] [Archiwizuj] │      │
│ └────────────────────────┴────────────────────────┘      │
│                                                           │
│ ┌────────────────────────────────────────────────┐      │
│ │ 📚 Korepetycje z matematyki                    │      │
│ │ Status: ARCHIWALNA | Cena: 60 PLN              │      │
│ │ Wyświetlenia: 89                               │      │
│ │ [Przywróć] [Usuń]                              │      │
│ └────────────────────────────────────────────────┘      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 📌 Dodaj/Edytuj Usługę

```
[+ Dodaj usługę] → Formularz:

┌────────────────────────────────────────┐
│ Dane Podstawowe                         │
├────────────────────────────────────────┤
│ Nazwa usługi: [Tekst]                   │
│ Kategoria: [Dropdown]                   │
│ Podkategoria: [Dropdown]                │
│ Opis: [Textarea - rich text]            │
│ Cena bazowa: [Liczba] PLN               │
│ Typ ceny: [Stała / Od-Do / Godzinowa]   │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Zdjęcia (do 10)                    │ │
│ │ [+ Dodaj zdjęcia]                  │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐         │ │
│ │ │ Foto │ │ Foto │ │ Foto │         │ │
│ │ │[X]   │ │[X]   │ │[X]   │         │ │
│ │ └──────┘ └──────┘ └──────┘         │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Szczegóły                          │ │
│ │ □ Usługa wewnątrz (salon, pracownia)
│ │ □ Wyjazd do klienta                │ │
│ │ □ Dostępna online                  │ │
│ │ Czas realizacji: [Liczba] [min/h]  │ │
│ │ Minimum wstępnego: [Liczba] dni     │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Obszary działania                  │ │
│ │ □ Warszawa                         │ │
│ │ □ Piaseczno                        │ │
│ │ □ Konstancin                       │ │
│ │ [+ Dodaj miasto]                   │ │
│ └────────────────────────────────────┘ │
│                                         │
│ [Anuluj] [Zapisz jako szkic] [Publikuj]│
└────────────────────────────────────────┘
```

### 📌 Akcje na Usłudze

- ✅ **Edycja** - zmiana wszystkich pól
- ✅ **Publikacja** - uaktywnienie usługi (widoczna dla klientów)
- ✅ **Archiwizacja** - ukrycie bez usunięcia
- ✅ **Duplikowanie** - szybkie tworzenie podobnej usługi
- ✅ **Usunięcie** - trwałe usunięcie (tylko szkice)
- ✅ **Wznowienie** - przywrócenie z archiwum

### 📌 Statystyki Usługi

```
• Wyświetlenia: 234 (ostatnie 30 dni)
• Dodane do ulubionych: 12
• Rezerwacje: 5
• Ocena średnia: 4.8/5
• Liczba opinii: 23
```

---

## 6️⃣ PROFIL - Dane Providera

**URL:** `/provider/profile`  
**Przeznaczenie:** Zarządzanie profilem biznesu, weryfikacją, portfolio

### 📌 Zakładka 1: Dane Podstawowe

```
┌────────────────────────────────────────┐
│ Profil Providera                        │
│                                         │
│ ┌──────┐                                │
│ │      │ Imię i nazwisko:  [Jan Nowak] │
│ │ FOTO │ Telefon:          [+48...]    │
│ │      │ Email:            [jan@...]   │
│ │      │ Bio:              [Tekst]     │
│ │ [▲]  │ Lokalizacja:      [Warszawa]  │
│ └──────┘ Lata doświadczenia: [10]      │
│                                         │
│ [Edytuj] [Zmień zdjęcie]                │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Edycja imienia, nazwiska
- ✅ Zmiana telefonu, emaila
- ✅ Edycja bio (opis profesjonalny)
- ✅ Zmiana zdjęcia profilowego
- ✅ Lata doświadczenia
- ✅ Historia edycji

### 📌 Zakładka 2: Weryfikacja (5 poziomów)

```
┌────────────────────────────────────────┐
│ Status Weryfikacji                      │
│                                         │
│ Level 1: ✅ Telefon              (2024-01-15)
│ Level 2: ✅ Email                (2024-01-16)
│ Level 3: ⏳ Tożsamość            (oczekuje...)
│ Level 4: ❌ Dokumenty biznesu     (odrzucono)
│ Level 5: ❌ Doświadczenie         (nie przesłano)
│                                         │
│ Trust Score™: 35/100 (Niska)           │
│                                         │
│ [Przesłij tożsamość] [Przesłij dokumenty]
└────────────────────────────────────────┘
```

**Poziomy Weryfikacji:**
- **Level 1** - Telefon: SMS weryfikacja (wymóg)
- **Level 2** - Email: Link weryfikacyjny (wymóg)
- **Level 3** - Tożsamość: Selfie + dokument (KYC)
- **Level 4** - Dokumenty biznesu: Faktura VAT/Umowa
- **Level 5** - Doświadczenie: Certyfikaty/Portfolio

**Trust Score Zależy Od:**
- ✅ Poziomów weryfikacji
- ✅ Liczby pozytywnych opinii
- ✅ Szybkości odpowiedzi na wiadomości
- ✅ Kompletności profilu
- ✅ Historii rezerwacji

### 📌 Zakładka 3: Portfolio (Zdjęcia)

```
┌────────────────────────────────────────┐
│ Portfolio - Moje Prace                  │
│ [+ Dodaj zdjęcia]                       │
│                                         │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │      │ │      │ │      │             │
│ │ Foto │ │ Foto │ │ Foto │ ...         │
│ │ 1    │ │ 2    │ │ 3    │             │
│ │[X]   │ │[X]   │ │[X]   │             │
│ └──────┘ └──────┘ └──────┘             │
│                                         │
│ Opis: [Edytowalny tekst pod każdym]    │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Upload do 30 zdjęć
- ✅ Drag & drop reordering
- ✅ Opis dla każdego zdjęcia
- ✅ Usunięcie
- ✅ Ustawienie jako główne (cover image)

### 📌 Zakładka 4: Dokumenty

```
┌────────────────────────────────────────┐
│ Dokumenty Weryfikacyjne                 │
│ [+ Prześlij dokument]                   │
│                                         │
│ Dokumenty przesłane:                    │
│ • Faktura VAT (2024-01-20) ✅ ZAAKCEPTOWANA
│ • Świadectwo (2024-02-01) ⏳ OCZEKUJE
│ • Umowa (2024-02-05) ❌ ODRZUCONE       │
│   Powód: Rozmyty podpis                 │
│   [Prześlij ponownie]                   │
│                                         │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Upload dokumentów (PDF, JPG, PNG)
- ✅ Śledzenie statusu (Oczekuje/Zaakceptowane/Odrzucone)
- ✅ Wiadomość z powodem odrzucenia
- ✅ Ponowne przesyłanie

### 📌 Dodatkowe Dane

- ✅ Liczba recenzji: [liczba]
- ✅ Średnia ocena: [liczba/5]
- ✅ Procent rekomendacji: [%]
- ✅ Data dołączenia: [data]
- ✅ Ostatnia aktywność: [kiedy]

---

## 7️⃣ MONETYZACJA - Boost + Subskrypcja

**URL:** `/provider/monetization/boost` i `/provider/monetization/subscription`  
**Przeznaczenie:** Promocja usług i zarządzanie limitami

### 📌 Boost - Promocja Szybka

#### A) Kup Boost
```
[Boost] - Podnieś widoczność na x dni

┌────────────────────────────────────────┐
│ Dostępne opcje:                         │
│                                         │
│ ┌────────────────────┐                 │
│ │ 3 DNI              │                 │
│ │ 29 PLN             │                 │
│ │ +300% widoczności  │                 │
│ │ [Kup teraz]        │                 │
│ └────────────────────┘                 │
│                                         │
│ ┌────────────────────┐                 │
│ │ 7 DNI              │                 │
│ │ 59 PLN             │                 │
│ │ +500% widoczności  │                 │
│ │ Oszczędź 10%       │                 │
│ │ [Kup teraz]        │                 │
│ └────────────────────┘                 │
│                                         │
│ ┌────────────────────┐                 │
│ │ 14 DNI             │                 │
│ │ 99 PLN             │                 │
│ │ +700% widoczności  │                 │
│ │ Oszczędź 25%       │                 │
│ │ [Kup teraz]        │                 │
│ └────────────────────┘                 │
│                                         │
└────────────────────────────────────────┘
```

#### B) Moje Boost'y
```
Aktywne:
┌────────────────────────────────────────┐
│ Boost aktywny - Wygasa: 31.12.2025     │
│ Poziom: Premium                        │
│ Widoczność: +700%                      │
│ [Odnów] [Anuluj]                       │
└────────────────────────────────────────┘

Historia:
• 29.10.2025 - 14-dniowy (09:00 - 16:00) (zakończony)
• 15.10.2025 - 7-dniowy (08:30 - 15:30) (zakończony)
```

**Opcje:**
- ✅ Wiele aktywnych boost'ów jednocześnie
- ✅ Automatyczne odnowienie (subskrypcja)
- ✅ Anulowanie (natychmiastowe)
- ✅ Historia boost'ów
- ✅ Statystyki boost'ów (ile rezerwacji?)

### 📌 Subskrypcja - Plany

#### A) Aktualny Plan
```
┌────────────────────────────────────────┐
│ Plan Podstawowy 👑                      │
│ "Dla firm chcących się rozwijać"       │
│                                         │
│ Wygasa: 31.03.2025 (58 dni)             │
│ Płatność: Miesięczna (49 PLN/msc)       │
│                                         │
│ Limity w tym planie:                    │
│ • Do 25 usług (16 w użyciu)             │
│ • 50 zdjęć (32 w użyciu)                │
│ • Priorytetowe powiadomienia ✅         │
│ • Statystyki podstawowe ✅              │
│ • Subdomena ✅                          │
│                                         │
│ [Zmień plan] [Rozszerz podpis]         │
└────────────────────────────────────────┘
```

#### B) Porównanie Planów
```
┌───────────────────────────────────────────────────────────────┐
│              FREE      BASIC       PRO        PREMIUM         │
├───────────────────────────────────────────────────────────────┤
│ Usługi     5         25         ∞          ∞                 │
│ Zdjęcia    5         50         ∞          ∞                 │
│ API        ❌        ❌         ❌         ✅                │
│ Wsparcie   Email     Email      24/7       Dedykowany       │
│ Cena       Gratis    49 PLN/m   99 PLN/m   199 PLN/m        │
│                                                               │
│                              [Wybierz] [Wybierz] [Wybierz]  │
└───────────────────────────────────────────────────────────────┘
```

**Opcje:**
- ✅ Zmiana planu (upgrade/downgrade)
- ✅ Pause subskrypcji (3 miesiące)
- ✅ Anulowanie subskrypcji
- ✅ Historia płatności
- ✅ Faktury (do pobrania)
- ✅ Automatyczne odnowienie

**Limity Planów:**
```
FREE:
- Do 5 usług
- 5 zdjęć
- Podstawowe powiadomienia
- Bez analityki
- Bez subdomeny

BASIC:
- Do 25 usług
- 50 zdjęć
- Priorytetowe powiadomienia
- Statystyki podstawowe
- Subdomena

PRO:
- Nieograniczone usługi
- Nieograniczone zdjęcia
- Wsparcie 24/7
- Zaawansowana analityka
- API dostęp
- Subdomena +

PREMIUM:
- Wszystko z PRO
- Dedykowany menedżer
- White label opcje
- Priorytet w wyszukiwaniu
```

---

## 8️⃣ USTAWIENIA - Konfiguracja Konta

**URL:** `/provider/settings`  
**Przeznaczenie:** Zarządzanie kontem, powiadomieniami, bezpieczeństwem

### 📌 Zakładka 1: Profil Biznesu

```
┌────────────────────────────────────────┐
│ Profil Biznesu                          │
│                                         │
│ Logo firmy: [Upload] [Usuń]             │
│                                         │
│ Nazwa firmy: [Nazwa Firmy Sp. z o.o]  │
│ Tagline: [Profesjonalne usługi...]     │
│ Website: [https://...]                 │
│ Social Media:                           │
│ • Facebook:  [link]                    │
│ • Instagram: [link]                    │
│ • LinkedIn:  [link]                    │
│ • YouTube:   [link]                    │
│                                         │
│ [Zapisz zmiany]                         │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Edycja nazwy firmy
- ✅ Upload logo
- ✅ Tagline (krótki opis)
- ✅ Website (link)
- ✅ Social media linki
- ✅ Powiązanie do Google Business Profile

### 📌 Zakładka 2: Powiadomienia

```
┌────────────────────────────────────────┐
│ Ustawienia Powiadomień                  │
│                                         │
│ Email Notifications:                    │
│ ☑ Nowa rezerwacja                      │
│ ☑ Zmiana statusu rezerwacji             │
│ ☑ Nowa wiadomość                       │
│ ☑ Opinia z rezerwacji                  │
│ ☑ Powiadomienie systemowe              │
│ ☐ Promocyjne oferty                    │
│                                         │
│ Frequency: [Natychmiast / Podsumowanie dzienne]
│                                         │
│ Push Notifications:                     │
│ ☑ Włączone dla wszystkich               │
│ [Zarządzaj] [Wyłącz wszystkie]          │
│                                         │
│ SMS Notifications:                      │
│ ☑ Włączone                              │
│ Numer: [+48...]                        │
│ [Zmień numer]                           │
│                                         │
│ [Zapisz zmiany]                         │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Email notifications (granularne)
- ✅ Push notifications (jeśli aplikacja mobilna)
- ✅ SMS notifications
- ✅ Częstotliwość (natychmiast vs podsumowanie)
- ✅ Tichych godziny (np. 22:00-08:00)

### 📌 Zakładka 3: Bezpieczeństwo

```
┌────────────────────────────────────────┐
│ Bezpieczeństwo Konta                    │
│                                         │
│ Zmiana Hasła:                           │
│ Ostatnia zmiana: 15 dni temu            │
│ [Zmień hasło]                           │
│                                         │
│ Logowanie Dwuskładnikowe:               │
│ Status: ❌ Wyłączone                    │
│ [Włącz 2FA] (Email / Authenticator)    │
│                                         │
│ Aktywne Sesje:                          │
│ • 192.168.1.1 - Chrome - Warszawa       │
│   Ostatnia: Dzisiaj 14:32 [Wyloguj]     │
│ • 172.16.0.1 - Safari - Piaseczno      │
│   Ostatnia: Wczoraj 10:15 [Wyloguj]     │
│                                         │
│ [Wyloguj ze wszystkich sesji]           │
│                                         │
│ Blokada Konta:                          │
│ [Tymczasowo zablokuj] [Usuń konto]      │
│                                         │
│ [Zapisz zmiany]                         │
└────────────────────────────────────────┘
```

**Opcje:**
- ✅ Zmiana hasła
- ✅ Dwuskładnikowa autentykacja (2FA)
- ✅ Przeglądanie aktywnych sesji
- ✅ Wylogowywanie sesji zdalnych
- ✅ Historia logowania
- ✅ Tymczasowa blokada konta
- ✅ Usunięcie konta (z potwierdzeniem)

---

## 📱 Menu Boczne (Sidebar)

```
┌─────────────────────────────┐
│ LocalServices               │
│ Witaj, Jan Nowak            │
│ 👤 jan@example.com          │
├─────────────────────────────┤
│                             │
│ 📊 Dashboard                │
│ 📅 Rezerwacje               │
│ 🗓️ Kalendarz                │
│ 💬 Wiadomości (3)           │
│ 🛠️ Usługi                    │
│ 👤 Profil                   │
│ 💳 Monetyzacja              │
│ ⚙️ Ustawienia               │
│                             │
├─────────────────────────────┤
│ Trust Score™: 85/100 ✅     │
│ Plan: Podstawowy (49 PLN/m) │
│ [Zmień plan]                │
│                             │
├─────────────────────────────┤
│ [Wyloguj]                   │
│ [Dokumentacja]              │
│ [Wsparcie]                  │
│                             │
└─────────────────────────────┘
```

---

## 🎨 Design System

**Kolorystyka:**
- **Primary:** Cyan (`#06b6d4`) - główne akcje
- **Accent:** Teal (`#14b8a6`) - wyróżnienia
- **Success:** Emerald (`#10b981`) - potwierdzenie
- **Warning:** Amber (`#f59e0b`) - uwagi
- **Error:** Red (`#ef4444`) - błędy

**Komponenty:**
- **Glass Cards** - transparentne karty z blur efektem
- **Gradients** - rozmycie kolorów w tle
- **Icons** - Lucide React icons
- **Shadows** - głębokie cienie dla warstw

---

## 📊 Statystyki Dostępne

Każda sekcja wyświetla statystyki:
- **Dashboard:** Trust Score, rezerwacje, wydajność
- **Rezerwacje:** Liczba rezerwacji, status, wartość
- **Kalendarz:** Wypełnienie, średnia rez./dzień
- **Wiadomości:** Liczba konwersacji, nieprzeczytane
- **Usługi:** Liczba usług, wyświetlenia, ulubione
- **Profil:** Ocena, liczba opinii, poziom weryfikacji
- **Monetyzacja:** Active boost, plan, limity, zużycie

---

## 🔐 Uprawnienia i Role

Provider ma dostęp do:
- ✅ Wszystkie sekcje (pełny dostęp)
- ✅ Edycja swoich danych
- ✅ CRUD usług
- ✅ Zarządzanie rezerwacjami
- ✅ Zarządzanie dostępnością
- ✅ Komunikacja z klientami
- ✅ Zarządzanie subskrypcją
- ✅ Dostęp do statystyk

Admin (jeśli dostęp do panelu):
- ✅ Przeglądanie wszystkich danych
- ✅ Zmiana statusu weryfikacji
- ✅ Blokowanie kont
- ✅ Zarządzanie subskrypcjami

---

## 📱 Responsywność

Cały panel jest w pełni responsywny:
- **Desktop:** Pełna szerokość, sidebar po lewej
- **Tablet:** Sidebar zwija się, hamburguer menu
- **Mobile:** Vertical layout, bottom navigation (opcjonalnie)

---

**Data dokumentacji:** 29 grudnia 2025  
**Ostatnia aktualizacja:** Phase 7 MVP  
**Status:** ✅ Complete & Production Ready
