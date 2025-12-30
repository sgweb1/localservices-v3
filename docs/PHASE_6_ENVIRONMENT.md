# Environment Configuration dla Phase 6

Aby uruchomić Phase 6 Frontend Monetization, musisz skonfigurować zmienne środowiska.

## 1. Utwórz plik `.env.local` w root projektu

```bash
# Lokalnie (development)
cd /home/szymo/projects/ls2
cp .env.example .env.local
```

## 2. Skonfiguruj Stripe Keys

### Test Mode (Development)

1. Przejdź do https://dashboard.stripe.com
2. Zaloguj się na konto testowe
3. Skopiuj **Publishable Key** z sekcji "Keys"
4. Skopiuj **Secret Key** (dla backend)

### Wstaw do `.env.local`:

```bash
# Frontend (publiczny, bezpieczny do ujawnienia)
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Backend (w .env Laravel - TAJNY, nigdy nie wstawiaj do frontend)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## 3. Pełny `.env.local`

```bash
# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_51OXXXXXXXXXXXXXXXXXXXXXXXXX

# API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Environment
VITE_ENV=development
VITE_DEBUG=true
```

## 4. Weryfikacja

Sprawdź czy zmienne są wczytane:

```bash
# W konsoli DevTools (F12)
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
```

Powinien wyświetlić: `pk_test_...` (bez sekretu)

## 5. Backend Configuration

W `.env` Laravel (serwer):

```bash
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_URL=http://localhost:8000/webhooks/stripe
```

## 6. Webhook Setup (Stripe Dashboard)

1. https://dashboard.stripe.com/webhooks
2. Kliknij "+ Add Endpoint"
3. Endpoint URL: `http://localhost:8000/webhooks/stripe`
4. Eventos:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Skopiuj "Signing secret" do `STRIPE_WEBHOOK_SECRET`

## 7. Testowe Karty Kredytowe

Stripe zapewnia testowe karty do developmentu:

```
Karta:           4242 4242 4242 4242
Miesiąc/Rok:     Dowolny przyszły (np. 12/25)
CVC:             Dowolny 3-cyfrowy (np. 123)
Imię:            Dowolne
```

**Wyniki testów:**
- ✅ Sukces: 4242 4242 4242 4242
- ❌ Błąd karty: 4000 0000 0000 0002
- ⚠️ 3D Secure: 4000 0000 0000 3220

## 8. Uruchomienie

```bash
# Terminal 1: Laravel (backend)
cd /home/szymo/projects/ls2
php artisan serve

# Terminal 2: React (frontend)
npm run dev

# Terminal 3: Stripe CLI (webhooks locally)
stripe listen --forward-to http://localhost:8000/webhooks/stripe
```

## 9. Troubleshooting

### "VITE_STRIPE_PUBLIC_KEY is undefined"
- Czy `.env.local` został stworzony?
- Czy zawiera `VITE_STRIPE_PUBLIC_KEY=pk_test_...`?
- Zrestartuj dev server: `npm run dev`

### "Stripe is not defined"
- Zainstaluj: `npm install @stripe/stripe-js @stripe/react-stripe-js`
- Sprawdź czy `VITE_STRIPE_PUBLIC_KEY` jest ustawiony

### "Webhook signature verification failed"
- Czy `STRIPE_WEBHOOK_SECRET` jest prawidłowy w `.env` (backend)?
- Czy webhook URL jest poprawny?
- Używaj `stripe listen` do local testowania

### Payment nie potwierdza się
- Sprawdź backend logs: `php artisan logs:tail`
- Czy API endpoint `/api/v1/boosts/purchase` istnieje?
- Czy webhook handler waliduje sygnatury?

## 10. Production (Future)

Gdy będziesz gotowy do produkcji:

```bash
# Zmień klucze na LIVE mode
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY

# Backend .env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# API URL
VITE_API_BASE_URL=https://api.localservices.pl
```

⚠️ **NIGDY nie commituj `.env.local` do gita!** Dodaj do `.gitignore`:

```bash
.env.local
.env*.local
```

## Dokumentacja

- Stripe Keys: https://dashboard.stripe.com/apikeys
- Stripe JS Library: https://stripe.com/docs/stripe-js
- Webhook Testing: https://stripe.com/docs/webhooks/testing
- React Integration: https://stripe.com/docs/stripe-js/react

---

**Status:** Instrukcje do Phase 6 Environment Setup ✅  
**Autor:** GitHub Copilot  
**Data:** 29 grudnia 2025
