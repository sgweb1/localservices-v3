# 🧪 Test Plan - Dev Simulator

**Data:** 2025-12-31  
**Tester:** _________________  
**Cel:** Przetestowanie wszystkich funkcji Dev Simulator

---

## 📋 Przygotowanie

- [ ] Uruchom backend: `php artisan serve`
- [ ] Uruchom frontend: `npm run dev`
- [ ] Zaloguj się jako provider
- [ ] Przejdź do `/provider/dev-simulator`
- [ ] Otwórz Developer Console (F12)
- [ ] Sprawdź czy widać zakładkę "Dev Simulator" w sidebar (pomarańczowy badge DEV)

---

## 1️⃣ Zakładka: REZERWACJE (Bookings)

### Test 1.1: Generowanie rezerwacji
- [ ] Kliknij zakładkę "Rezerwacje"
- [ ] Ustaw ilość: `5`
- [ ] Kliknij "🎲 Generuj rezerwacje"

**Oczekiwany rezultat:**
- [ ] W logach pojawia się: `✅ Wygenerowano 5 rezerwacji`
- [ ] Dla każdej rezerwacji: `📅 Rezerwacja #BK-XXXXXX na YYYY-MM-DD`
- [ ] Brak błędów w console
- [ ] Przejdź do `/provider/bookings` - widać nowe rezerwacje

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 1.2: Zmiana statusu rezerwacji - Accept
- [ ] Skopiuj ID rezerwacji z `/provider/bookings` (np. `123`)
- [ ] Wróć do Dev Simulator
- [ ] Wklej ID do pola "ID Rezerwacji"
- [ ] Wybierz status: "Potwierdzona"
- [ ] Kliknij "💾 Zmień status"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Rezerwacja #123 zaakceptowana`
- [ ] Przejdź do `/provider/bookings` - status zmieniony na "Potwierdzona"
- [ ] Brak błędów

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 1.3: Zmiana statusu - Start
- [ ] Użyj tej samej rezerwacji (status musi być "confirmed")
- [ ] Wybierz status: "W trakcie"
- [ ] Kliknij "💾 Zmień status"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Rezerwacja #123 rozpoczęta`
- [ ] Status w `/provider/bookings`: "W trakcie"

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 1.4: Zmiana statusu - Complete
- [ ] Użyj tej samej rezerwacji (status musi być "in_progress")
- [ ] Wybierz status: "Zakończona"
- [ ] Kliknij "💾 Zmień status"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Rezerwacja #123 zakończona`
- [ ] Status w `/provider/bookings`: "Zakończona"

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 2️⃣ Zakładka: WIADOMOŚCI (Messages)

### Test 2.1: Wysłanie wiadomości
- [ ] Kliknij zakładkę "Wiadomości"
- [ ] Wpisz ID odbiorcy: `2` (customer z seedera)
- [ ] Wpisz treść: `Test wiadomości z Dev Simulator`
- [ ] Kliknij "📨 Wyślij wiadomość"

**Oczekiwany rezultat:**
- [ ] Log: `📨 Wysłano wiadomość do użytkownika #2`
- [ ] Log: `Treść: "Test wiadomości z Dev Simulator"`
- [ ] Przejdź do `/provider/messages` - widać nową konwersację

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 2.2: Symulacja otrzymania wiadomości
- [ ] Kliknij "📥 Symuluj otrzymanie wiadomości"

**Oczekiwany rezultat:**
- [ ] Log: `📥 Otrzymano wiadomość od użytkownika #XXX` (losowy ID 101-105)
- [ ] Log pokazuje treść wiadomości
- [ ] Odśwież `/provider/messages` - powinna być nowa konwersacja (jeśli backend działa)

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 2.3: Generowanie konwersacji
- [ ] Kliknij "🎲 Generuj 5 konwersacji"

**Oczekiwany rezultat:**
- [ ] Log: `Wygenerowano 5 przykładowych wiadomości`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 3️⃣ Zakładka: OPINIE (Reviews)

### Test 3.1: Dodanie opinii
- [ ] Kliknij zakładkę "Opinie"
- [ ] Ustaw ocenę: `5`
- [ ] Wpisz komentarz: `Świetna usługa, profesjonalne podejście!`
- [ ] Kliknij "⭐ Dodaj opinię"

**Oczekiwany rezultat:**
- [ ] Log: `Dodano opinię: 5/5 - "Świetna usługa, profesjonalne podejście!"`
- [ ] Pole komentarza wyczyściło się
- [ ] Brak błędów

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 3.2: Generowanie 5 opinii
- [ ] Kliknij "🎲 Generuj 5 opinii"

**Oczekiwany rezultat:**
- [ ] Log: `Wygenerowano 5 losowych opinii`
- [ ] Sprawdź `/provider/reviews` - powinno być więcej opinii

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 3.3: Odpowiedź na opinię
- [ ] Upewnij się że masz przynajmniej jedną opinię (użyj Test 3.2)
- [ ] Kliknij "💬 Odpowiedz na ostatnią opinię"

**Oczekiwany rezultat:**
- [ ] Log: `💬 Pobieranie ostatniej opinii...`
- [ ] Log: `💬 Odpowiedziano na opinię #XXX`
- [ ] Log: `Odpowiedź: "Dziękuję za opinię!..."`
- [ ] W `/provider/reviews` - opinia ma odpowiedź providera

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 4️⃣ Zakładka: USŁUGI (Services)

### Test 4.1: Dodanie nowej usługi
- [ ] Kliknij zakładkę "Usługi"
- [ ] Kliknij "➕ Dodaj nową usługę"

**Oczekiwany rezultat:**
- [ ] Log: `➕ Tworzenie nowej usługi...`
- [ ] Log: `✅ Utworzono usługę: Testowa usługa XXXXXXXXXX`
- [ ] Log: `ID: XXX, Cena: XXX PLN` (losowa cena 100-600)
- [ ] Sprawdź `/provider/services` - nowa usługa widoczna

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 4.2: Zmiana widoczności usługi
- [ ] Sprawdź status ostatniej usługi w `/provider/services` (Aktywna/Nieaktywna)
- [ ] Kliknij "👁️ Zmień widoczność"

**Oczekiwany rezultat:**
- [ ] Log: `👁️ Pobieranie ostatniej usługi...`
- [ ] Log: `✅ Zmieniono widoczność usługi "..."`
- [ ] Log: `Nowy stan: Widoczna` lub `Ukryta`
- [ ] Sprawdź `/provider/services` - status się zmienił

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 4.3: Aktywacja boost
- [ ] Kliknij "🚀 Aktywuj boost"

**Oczekiwany rezultat:**
- [ ] Log: `🚀 Boost aktywowany dla "..." na 7 dni`
- [ ] Log: `💡 Funkcja w development - endpoint do boost w przygotowaniu`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 5️⃣ Zakładka: NOTYFIKACJE (Notifications)

### Test 5.1: Wysyłanie notyfikacji - Nowa rezerwacja
- [ ] Kliknij zakładkę "Notyfikacje"
- [ ] Kliknij "🔔 Nowa rezerwacja"

**Oczekiwany rezultat:**
- [ ] Log: `🔔 Wysyłanie notyfikacji: new_booking...`
- [ ] Log: `✅ Wysłano: Masz nową rezerwację na jutro o 14:00`
- [ ] Sprawdź ikonę dzwonka w topbar - licznik notyfikacji zwiększył się

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 5.2: Notyfikacja - Zaakceptowano
- [ ] Kliknij "✅ Zaakceptowano"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Wysłano: Twoja rezerwacja została zaakceptowana`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 5.3: Notyfikacja - Nowa wiadomość
- [ ] Kliknij "💬 Nowa wiadomość"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Wysłano: Jan Kowalski wysłał Ci wiadomość`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 5.4: Notyfikacja - Nowa opinia
- [ ] Kliknij "⭐ Nowa opinia"

**Oczekiwany rezultat:**
- [ ] Log: `✅ Wysłano: Otrzymałeś nową opinię 5/5 ⭐`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 5.5: Test push notification
- [ ] Kliknij "📱 Testuj push"

**Oczekiwany rezultat:**
- [ ] Log: `📱 Testowanie push notification...`
- [ ] Log: `✅ Push notification wysłany` lub błąd jeśli nie skonfigurowane
- [ ] Jeśli push włączony - powinieneś otrzymać notification w systemie

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 5.6: Wyczyść wszystkie notyfikacje
- [ ] Upewnij się że masz nieprzeczytane notyfikacje
- [ ] Kliknij "🔕 Wyczyść wszystkie"

**Oczekiwany rezultat:**
- [ ] Log: `🔕 Czyszczenie wszystkich notyfikacji...`
- [ ] Log: `✅ Wszystkie notyfikacje oznaczone jako przeczytane`
- [ ] Licznik notyfikacji w topbar = 0

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 6️⃣ Zakładka: PŁATNOŚCI (Payments)

### Test 6.1: Zakup planu Basic
- [ ] Kliknij zakładkę "Płatności"
- [ ] Kliknij "💳 Kup plan Basic"

**Oczekiwany rezultat:**
- [ ] Log: `💳 Symulacja zakupu planu BASIC...`
- [ ] Log: `Przekierowanie do płatności: 99 PLN/miesiąc`
- [ ] Log: `✅ Plan Basic - 30 dni`
- [ ] Log: `💡 W produkcji: redirect do Stripe/PayU`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 6.2: Zakup planu Premium
- [ ] Kliknij "💎 Kup plan Premium"

**Oczekiwany rezultat:**
- [ ] Log: `💳 Symulacja zakupu planu PREMIUM...`
- [ ] Log: `Przekierowanie do płatności: 199 PLN/miesiąc`
- [ ] Log: `✅ Plan Premium - 30 dni`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 6.3: Odnowienie subskrypcji
- [ ] Sprawdź czy masz aktywną subskrypcję w `/provider/monetization/subscription`
- [ ] Kliknij "🔄 Odnów subskrypcję"

**Oczekiwany rezultat:**
- [ ] Log: `🔄 Odnawianie subskrypcji...`
- [ ] Log: `✅ Odnowiono plan: XXX`
- [ ] Log: `Nowa data wygaśnięcia: +30 dni`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 6.4: Opłacenie rezerwacji
- [ ] Upewnij się że masz rezerwację ze statusem `payment_status: pending`
- [ ] Kliknij "💰 Opłać rezerwację"

**Oczekiwany rezultat:**
- [ ] Log: `💰 Symulacja płatności za rezerwację...`
- [ ] Log: `✅ Opłacono rezerwację #BK-XXXXXX`
- [ ] Log: `Kwota: XXX PLN`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 7️⃣ Zakładka: KALENDARZ (Calendar)

### Test 7.1: Generowanie slotów na tydzień
- [ ] Kliknij zakładkę "Kalendarz"
- [ ] Kliknij "🎲 Generuj sloty (tydzień)"

**Oczekiwany rezultat:**
- [ ] Log: `🎲 Generowanie slotów na tydzień...`
- [ ] Log: `✅ Wygenerowano sloty na cały tydzień`
- [ ] Sprawdź `/provider/calendar` - widać nowe sloty

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 7.2: Generowanie rezerwacji
- [ ] Kliknij "📅 Generuj rezerwacje"

**Oczekiwany rezultat:**
- [ ] Log: `📅 Generowanie rezerwacji w kalendarzu...`
- [ ] Log: `✅ Wygenerowano rezerwacje w kalendarzu`
- [ ] Sprawdź `/provider/calendar` - widać nowe rezerwacje

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 7.3: Czyszczenie testowych danych
- [ ] Kliknij "🗑️ Wyczyść testowe dane"

**Oczekiwany rezultat:**
- [ ] Log: `🗑️ Czyszczenie testowych danych...`
- [ ] Log: `✅ Wyczyszczono testowe dane z kalendarza`
- [ ] Kalendarz powinien być czysty

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 8️⃣ Testy funkcji globalnych

### Test 8.1: Odświeżanie cache
- [ ] Wygeneruj kilka rezerwacji/opinii
- [ ] Kliknij "🔄 Odśwież cache" (prawy górny róg)

**Oczekiwany rezultat:**
- [ ] Log: `Cache odświeżony - wszystkie dane zostaną ponownie pobrane`
- [ ] Sprawdź Network tab - widać requesty do API

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 8.2: Czyszczenie logów
- [ ] Wykonaj kilka akcji (wygeneruj rezerwacje, wyślij wiadomość)
- [ ] Sprawdź że w konsoli jest 5+ wpisów
- [ ] Kliknij "🗑️ Wyczyść logi"

**Oczekiwany rezultat:**
- [ ] Konsola logów jest pusta
- [ ] Licznik pokazuje: `0 wpisów`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 9️⃣ Testy integracyjne

### Test 9.1: Workflow pełnej rezerwacji
- [ ] Wygeneruj 3 rezerwacje
- [ ] Zmień status pierwszej na "Potwierdzona"
- [ ] Zmień status na "W trakcie"
- [ ] Zmień status na "Zakończona"
- [ ] Dodaj opinię dla tej rezerwacji
- [ ] Odpowiedz na opinię

**Oczekiwany rezultat:**
- [ ] Wszystkie kroki wykonały się bez błędów
- [ ] Dane widoczne we wszystkich miejscach (Dashboard, Bookings, Reviews)
- [ ] Cache odświeżył się automatycznie

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 9.2: Workflow komunikacji
- [ ] Wyślij wiadomość do użytkownika #2
- [ ] Symuluj otrzymanie wiadomości
- [ ] Wyślij notyfikację "Nowa wiadomość"
- [ ] Sprawdź czy wszystko widać w `/provider/messages`

**Oczekiwany rezultat:**
- [ ] Konwersacje utworzone
- [ ] Notyfikacje wysłane
- [ ] Liczniki się zgadzają

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 🔍 Testy negatywne

### Test 10.1: Zmiana statusu bez ID
- [ ] Przejdź do zakładki "Rezerwacje"
- [ ] NIE wpisuj ID rezerwacji
- [ ] Kliknij "💾 Zmień status"

**Oczekiwany rezultat:**
- [ ] Log: `❌ Podaj ID rezerwacji`
- [ ] Brak requesta do API

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 10.2: Wysłanie wiadomości bez treści
- [ ] Przejdź do zakładki "Wiadomości"
- [ ] Wpisz ID: `2`
- [ ] NIE wpisuj treści
- [ ] Kliknij "📨 Wyślij wiadomość"

**Oczekiwany rezultat:**
- [ ] Log: `❌ Wypełnij wszystkie pola`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 10.3: Dodanie opinii bez komentarza
- [ ] Przejdź do zakładki "Opinie"
- [ ] NIE wpisuj komentarza
- [ ] Kliknij "⭐ Dodaj opinię"

**Oczekiwany rezultat:**
- [ ] Log: `❌ Podaj treść opinii`

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

### Test 10.4: Nieistniejąca rezerwacja
- [ ] Przejdź do zakładki "Rezerwacje"
- [ ] Wpisz ID: `999999`
- [ ] Kliknij "💾 Zmień status"

**Oczekiwany rezultat:**
- [ ] Log: `❌ Błąd: ...` (np. "Booking not found")
- [ ] Console error z logiem

**Wynik:** ✅ PASS / ❌ FAIL  
**Uwagi:** _________________________________

---

## 📊 Podsumowanie testów

**Data zakończenia:** _________________  
**Czas trwania testów:** _________________

### Statystyki:
- **Całkowita liczba testów:** 40
- **Testy zaliczone (PASS):** ______
- **Testy niezaliczone (FAIL):** ______
- **Procent sukcesu:** ______%

### Krytyczne błędy znalezione:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Błędy mniejszej wagi:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Uwagi ogólne:
___________________________________________
___________________________________________
___________________________________________

### Rekomendacje:
- [ ] Gotowe do produkcji
- [ ] Wymaga poprawek krytycznych
- [ ] Wymaga poprawek mniejszych
- [ ] Wymaga dalszych testów

**Podpis testera:** _________________
