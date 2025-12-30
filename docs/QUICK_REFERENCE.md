# 📖 Documentation Quick Reference

**Zgubiłeś się? Szybka mapa do każdego dokumentu.**

---

## 🎯 Mam Problem - Gdzie Szukać?

| Problem | Dokument | Sekcja |
|---------|----------|--------|
| Serwer nie startuje | [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md) | Troubleshooting |
| Stripe webhook nie działa | [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md) | Webhook Setup |
| Komponenty nie renderują | [PHASE_6_README.md](PHASE_6_README.md) | Components |
| Testy mi padają | [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md) | Testing Section |
| Nie rozumiem API | [ARCHITECTURE.md](ARCHITECTURE.md) | API Design |
| 401 Unauthorized na API | [QUICK_REFERENCE.md](#-auth-headers-in-fetch-calls) | Auth Headers |
| Nie wiem jak zacząć | [INDEX.md](INDEX.md) | Navigation |

---

## 🚀 I'm a... (Moja Rola)

### 👨‍💼 Project Manager
```
1. Przeczytaj: IMPLEMENTATION_ROADMAP.md
2. Sprawdź: PHASE_1_SUMMARY.md (status)
3. Review: SYSTEM_DESCRIPTION.md (features)
```

### 👨‍💻 Backend Developer
```
1. START: ARCHITECTURE.md
2. Koduj: app/Services/ (BEST_PRACTICES.md)
3. Test: tests/Feature/
4. Reference: SYSTEM_DESCRIPTION.md
```

### 🎨 Frontend Developer
```
1. START: PHASE_6_README.md
2. Szczegóły: PHASE_6_IMPLEMENTATION.md
3. Setup: PHASE_6_ENVIRONMENT.md
4. Standards: FRONTEND_STANDARDS.md
5. Kod: src/features/provider/monetization/
```

### 🔧 DevOps / System Admin
```
1. Setup: PHASE_6_ENVIRONMENT.md
2. Reference: ARCHITECTURE.md (deployment section)
3. Config: config/ (Laravel files)
4. Stripe: PHASE_6_ENVIRONMENT.md (Webhook Setup)
```

### 🧪 QA / Tester
```
1. Test cases: BEST_PRACTICES.md (Testing)
2. E2E scenarios: tests/e2e/monetization.spec.ts
3. Checklist: PHASE_6_IMPLEMENTATION.md (Test Coverage)
```

---

## 📚 Documents by Purpose

### Understanding (Learning)
- [SYSTEM_DESCRIPTION.md](SYSTEM_DESCRIPTION.md) - Co system robi
- [ARCHITECTURE.md](ARCHITECTURE.md) - Jak system działa
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) - Timeline faz

### Development (Coding)
- [BEST_PRACTICES.md](BEST_PRACTICES.md) - PHP standards
- [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md) - React standards
- [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md) - Component details

### Setup (Configuration)
- [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md) - Dev environment
- [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md) - Stripe setup
- `.env.example` - Environment template

### Reference (Cheat Sheets)
- [INDEX.md](INDEX.md) - Document navigation
- **QUICK_REFERENCE.md** ← Ty tutaj jesteś!
- [PHASE_6_README.md](PHASE_6_README.md) - Component index

---

## 🔗 Key Links

### Code Repositories
```
Backend:     app/Services/
Frontend:    src/features/provider/monetization/
Tests:       tests/ (Feature + E2E)
Config:      config/
Database:    database/migrations/
```

### External Resources
```
Laravel Docs:  https://laravel.com/docs
React Docs:    https://react.dev
Stripe:        https://stripe.com/docs
Tailwind:      https://tailwindcss.com
```

---

## ⚡ Common Commands

```bash
# Start development
npm run dev              # Frontend
php artisan serve       # Backend

# Testing
npm run test            # Unit tests
npm run test:e2e        # E2E tests
php artisan test        # Laravel tests

# Setup
npm install
composer install
php artisan migrate

# Check status
git status
php artisan route:list
npm list
```

---

## 📋 Document Summary Table

| # | Dokument | Typ | Dla Kogo | LOC |
|---|----------|-----|----------|-----|
| 0 | **INDEX.md** | Navigation | Wszyscy | 400 |
| 1 | **ARCHITECTURE.md** | Technical | Developers | 1,172 |
| 2 | **SYSTEM_DESCRIPTION.md** | Business | All | 700 |
| 3 | **BEST_PRACTICES.md** | Standards | Dev | 959 |
| 4 | **FRONTEND_STANDARDS.md** | Standards | Frontend | 300 |
| 5 | **PHASE_1_SUMMARY.md** | Reference | PM/Dev | 500 |
| 6 | **PHASE_2_PLANNING.md** | Planning | Dev | 600 |
| 7 | **PHASE_6_README.md** | Overview | Frontend | 400 |
| 8 | **PHASE_6_IMPLEMENTATION.md** | Detail | Frontend | 1,200 |
| 9 | **PHASE_6_ENVIRONMENT.md** | Setup | DevOps | 350 |
| 10 | **IMPLEMENTATION_ROADMAP.md** | Timeline | PM | 600 |
| 11 | **BOOST_SYSTEM_SUPPORT_GUIDE.md** | FAQ | Support | 400 |
| 12 | **PROFILE_VIEW_TRACKING.md** | Feature | Dev | 300 |

---

## ✅ What's Implemented?

### ✅ Phase 1-5 (Backend)
- Database schema ✅
- API endpoints ✅
- Admin resources (Filament) ✅
- Stripe integration ✅
- 135+ tests ✅

### ✅ Phase 6 (Frontend)
- React components (6) ✅
- Custom hooks (3) ✅
- TypeScript types ✅
- Unit tests (24) ✅
- E2E tests (24 scenarios) ✅
- Routing ✅
- Environment setup ✅

### ⏳ Future (Phase 7+)
- Analytics
- Refunds
- Dark mode
- Notifications
- Multi-language

---

## 🎯 Next Steps

1. **Setup environment:** [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md)
2. **Install dependencies:** `npm install && composer install`
3. **Run dev server:** `npm run dev` + `php artisan serve`
4. **Test payment flow:** Use test card 4242 4242 4242 4242
5. **Deploy:** Follow PHASE_6_ENVIRONMENT.md Production section

---

## 🔐 Auth Headers in Fetch Calls

### Problem
`401 Unauthorized` errors gdy API oczekuje Bearer token.

### Rozwiązanie

**1. Utwórz helper function:**
```typescript
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('dev_mock_token') || localStorage.getItem('sanctum_token');
  const headers: Record<string, string> = {
    'X-XSRF-TOKEN': getCsrfToken(),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
```

**2. Użyj w fetch callach:**
```typescript
const res = await fetch(`${API_BASE_URL}/api/v1/some-endpoint`, {
  method: 'GET',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    ...getAuthHeaders(),  // ← ZAWSZE DODAJ TO!
  },
});
```

**3. Dla POST/PUT requestów:**
```typescript
const res = await fetch(`${API_BASE_URL}/api/v1/some-endpoint`, {
  method: 'PUT',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...getAuthHeaders(),  // ← Dodaj headers
  },
  body: JSON.stringify(data),
});
```

### Checklist
- ✅ Dodaj `...getAuthHeaders()` do WSZYSTKICH fetch calls
- ✅ `credentials: 'include'` dla cookies
- ✅ `Accept: 'application/json'` zawsze
- ✅ `'Content-Type': 'application/json'` dla POST/PUT
- ✅ Sprawdź localStorage keys (`sanctum_token` / `dev_mock_token`)

### Real Example (z NotificationsTab.tsx)
```typescript
const fetchPreferences = async (): Promise<EventPreference[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notification-preferences`, {
    credentials: 'include',
    headers: { 
      Accept: 'application/json',
      ...getAuthHeaders(),  // Includes Bearer token + XSRF-TOKEN
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.data;
};
```

---

## ❓ FAQ

**Q: Gdzie są API endpoints?**  
A: [ARCHITECTURE.md](ARCHITECTURE.md) - API Design section

**Q: Jak testuję komponenty?**  
A: `npm run test` - patrz [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md)

**Q: Jak dodaję nowy boost?**  
A: Patrz [SYSTEM_DESCRIPTION.md](SYSTEM_DESCRIPTION.md) - Boost Flow

**Q: Gdzie szukam kodu?**  
A: `src/features/provider/monetization/` lub [INDEX.md](INDEX.md)

**Q: Jak się zalogować?**  
A: `/dev/login` z demo credentials

**Q: Czy to jest ready do production?**  
A: ✅ Phase 6 jest production-ready (patrz [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md))

---

## 📞 Need Help?

1. **Check:** [INDEX.md](INDEX.md) - Navigation
2. **Search:** Cmd+F w dokumentach
3. **Code:** Check `src/` folder z examples
4. **Tests:** Patrz `tests/` dla edge cases
5. **Ask:** GitHub Copilot (ja! 🤖)

---

**Ostatnia aktualizacja:** 29 grudnia 2025  
**Autor:** GitHub Copilot  
**Status:** ✅ Up to date
