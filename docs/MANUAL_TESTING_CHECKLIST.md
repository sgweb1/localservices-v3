# Manual Testing Checklist - LocalServices MVP

## 📋 Pre-Launch Testing Session

**Tester:** ___________________  
**Date:** ___________________  
**Environment:** □ Local  □ Staging  □ Production  
**URL:** ___________________  

---

## ✅ Authentication & User Management

### Registration (Provider)
- [ ] Formularz rejestracji wyświetla się poprawnie
- [ ] Walidacja działa (email format, password strength)
- [ ] Po submit: success message + redirect to dashboard
- [ ] Email weryfikacyjny wysłany (sprawdź inbox/spam)
- [ ] Kliknięcie linku w email → konto aktywowane
- [ ] Nie można zarejestrować tego samego email dwa razy

### Login
- [ ] Formularz logowania wyświetla się
- [ ] Poprawne credentials → redirect do dashboard
- [ ] Błędne credentials → error message "Invalid credentials"
- [ ] "Remember me" checkbox działa
- [ ] Session persists po refresh strony

### Password Reset
- [ ] "Forgot password" link działa
- [ ] Email z reset link wysłany
- [ ] Reset link działa (ważny 60 minut)
- [ ] Nowe hasło można ustawić
- [ ] Login z nowym hasłem działa
- [ ] Stary link nie działa po zmianie hasła

### Logout
- [ ] Logout button widoczny w nav/menu
- [ ] Po logout → redirect do homepage/login
- [ ] Session cleared (nie można wrócić do protected page bez login)

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🏠 Provider Dashboard

### Initial Load
- [ ] Dashboard ładuje się < 3 sekundy
- [ ] Welcome message z imieniem usera
- [ ] Brak console errors w DevTools
- [ ] Loading states pokazują się podczas fetch

### Widgets Display
- [ ] **Pipeline Widget** (bookings count: pending, confirmed, etc.)
- [ ] **Recent Bookings** (last 5)
- [ ] **Recent Messages** (last 5, unread count)
- [ ] **Recent Reviews** (last 4)
- [ ] **Performance Metrics** (views, response time, rating)
- [ ] **Trust Score** (jeśli obliczany)

### Interactive Elements
- [ ] "Zobacz wszystkie rezerwacje" button → BookingsPage
- [ ] "Zobacz wiadomości" button → MessagesPage
- [ ] Booking card click → Booking detail
- [ ] Message card click → Conversation

### Empty States
- [ ] Brak rezerwacji → "No bookings yet" message
- [ ] Brak wiadomości → "No messages" message
- [ ] Brak reviews → "No reviews yet" message

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 📅 Bookings Management

### List View
- [ ] Wszystkie bookings się wyświetlają
- [ ] Filtry działają:
  - [ ] Status (pending, confirmed, completed)
  - [ ] Date range picker
  - [ ] Search by customer name
- [ ] Sortowanie działa (date, status)
- [ ] Paginacja działa (jeśli > 20 items)
- [ ] Empty state gdy brak bookings

### Single Booking Detail
- [ ] Customer info wyświetla się (name, email, phone)
- [ ] Service details poprawne
- [ ] Date & time poprawne
- [ ] Location/address widoczna
- [ ] Mapa pokazuje location (Google Maps)
- [ ] Status badge poprawny kolor

### Booking Actions
- [ ] **Accept booking** (status: pending → confirmed)
  - Confirmation dialog
  - Success toast message
  - Status update w UI
- [ ] **Reject booking** (status: pending → rejected)
  - Confirmation dialog z reason textarea
  - Success toast
- [ ] **Send Quote** (dla quote_requested)
  - Modal z price input
  - Validation (price > 0)
  - Customer gets email notification
- [ ] **Start Service** (status: confirmed → in_progress)
  - Date must be today or past
  - Confirmation dialog
- [ ] **Complete Service** (status: in_progress → completed)
  - Mark as done
  - Customer can now review

### Edge Cases
- [ ] Nie można accept już accepted booking
- [ ] Nie można complete booking przed start date
- [ ] Deleted customer → shows "Deleted User" gracefully

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 💬 Messages/Chat

### Conversations List
- [ ] Wszystkie conversations wyświetlają się
- [ ] Unread count badge (czerwony)
- [ ] Last message preview
- [ ] Timestamp (np. "2 hours ago")
- [ ] Search box działa (filter by customer name)
- [ ] Scroll w długiej liście

### Single Conversation
- [ ] Message history loads
- [ ] Messages sorted chronologically (oldest first)
- [ ] Own messages aligned right (different style)
- [ ] Customer messages aligned left
- [ ] Timestamps dla każdej message

### Send Message
- [ ] Textarea dla nowej wiadomości
- [ ] "Send" button
- [ ] Enter key sends message
- [ ] Shift+Enter → new line (nie send)
- [ ] Message appears instantly po send
- [ ] Empty message → validation error

### Tabs (Active/Hidden)
- [ ] "Aktywne" tab shows active conversations
- [ ] "Ukryte" tab shows hidden conversations
- [ ] Can hide/archive conversation
- [ ] Can unhide conversation

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 📆 Calendar & Availability

### Calendar View
- [ ] Calendar wyświetla się (current month)
- [ ] Navigation arrows (prev/next month)
- [ ] Today highlighted
- [ ] Available slots pokazują się (zielony)
- [ ] Booked slots pokazują się (czerwony/szary)

### Set Availability
- [ ] Click na dzień → modal/form
- [ ] Select time slots (start/end time)
- [ ] "Add slot" button
- [ ] Slot pojawia się w UI
- [ ] Save changes → API call success

### Remove Availability
- [ ] Click na slot → delete button
- [ ] Confirmation dialog
- [ ] Slot removed z UI

### Exceptions (Holidays/Days Off)
- [ ] Can mark day as unavailable
- [ ] Exception shows w calendar (np. "Closed")
- [ ] Cannot book na exception day

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## ⚙️ Settings

### Profile Tab
- [ ] Current profile data loads (name, email, phone)
- [ ] Update name → success
- [ ] Update email → validation (format)
- [ ] Update phone → validation (format)
- [ ] Avatar upload:
  - [ ] File picker opens
  - [ ] Image preview
  - [ ] Upload success
  - [ ] Avatar displays everywhere
  - [ ] File size limit enforced (5MB)
  - [ ] File type validation (jpg, png only)
- [ ] Save button → success toast

### Services Tab
- [ ] Existing services listed
- [ ] "Add Service" button
- [ ] Service form:
  - [ ] Name input
  - [ ] Description textarea
  - [ ] Category dropdown
  - [ ] Price input
  - [ ] Multiple images upload
  - [ ] Image preview before upload
  - [ ] Can delete uploaded image
- [ ] Edit existing service
- [ ] Toggle service active/inactive
- [ ] Delete service (confirmation dialog)

### Notifications Tab
- [ ] Email notifications toggle
- [ ] Specific notification preferences:
  - [ ] New booking
  - [ ] New message
  - [ ] Review received
  - [ ] Booking reminder
- [ ] Save preferences → success

### Account Tab
- [ ] Change password form
- [ ] Current password required
- [ ] New password validation (8+ chars)
- [ ] Confirm password match validation
- [ ] Success → re-login required (optional)

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🎨 UI/UX General

### Navigation
- [ ] Top nav/sidebar visible na all pages
- [ ] Active route highlighted
- [ ] Logo klikalne → homepage
- [ ] User menu (avatar dropdown) działa
- [ ] Mobile menu toggle (hamburger) działa

### Responsive Design (Mobile)
- [ ] Test na iOS Safari (iPhone)
- [ ] Test na Android Chrome
- [ ] Menu collapse na mobile
- [ ] Forms usable (inputs nie za małe)
- [ ] Buttons touchable (min 44px)
- [ ] Scroll works smoothly

### Loading States
- [ ] Spinners podczas API calls
- [ ] Skeleton loaders dla content
- [ ] "Loading..." text widoczny
- [ ] Disable buttons during submit (prevent double-click)

### Error States
- [ ] 404 page istnieje (gdy route nie istnieje)
- [ ] 500 error page istnieje
- [ ] Network error handling (gdy API down)
- [ ] Form validation errors (field-level + summary)
- [ ] Toast notifications dla errors (czerwony)

### Success States
- [ ] Success toast messages (zielony)
- [ ] Redirect po successful actions
- [ ] Optimistic UI updates (np. like button instant feedback)

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🚀 Performance

### Load Times (Chrome DevTools)
- [ ] Homepage: _____ seconds (target: < 2s)
- [ ] Dashboard: _____ seconds (target: < 3s)
- [ ] Bookings page: _____ seconds (target: < 2s)
- [ ] Messages page: _____ seconds (target: < 2s)

### API Response Times
- [ ] GET /api/v1/provider/dashboard: _____ ms (target: < 500ms)
- [ ] GET /api/v1/provider/bookings: _____ ms (target: < 300ms)
- [ ] POST booking action: _____ ms (target: < 200ms)

### Bundle Size
- [ ] Initial JS bundle: _____ KB (target: < 300KB gzipped)
- [ ] Total page weight: _____ MB (target: < 1MB)

### Lighthouse Score (Chrome DevTools → Lighthouse)
- [ ] Performance: _____ (target: > 90)
- [ ] Accessibility: _____ (target: > 90)
- [ ] Best Practices: _____ (target: > 90)
- [ ] SEO: _____ (target: > 90)

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🔒 Security

### HTTPS (Production only)
- [ ] HTTP redirects to HTTPS (301)
- [ ] SSL certificate valid (green padlock)
- [ ] No mixed content warnings

### Authentication
- [ ] Cannot access dashboard bez login (redirect)
- [ ] Token expires after logout
- [ ] Session timeout after inactivity (optional)

### Authorization
- [ ] Provider nie widzi innych providers' data
- [ ] API returns 403 dla unauthorized actions

### Input Validation
- [ ] XSS test: Try `<script>alert(1)</script>` w textarea
  - [ ] Should be escaped (not executed)
- [ ] SQL injection prevented (Laravel ORM auto-handles)
- [ ] File upload validation (type, size)

### Security Headers (curl -I url)
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 📧 Email Delivery

### Registration Email
- [ ] Email received w inbox (not spam)
- [ ] From address correct
- [ ] Subject line clear
- [ ] Verification link works
- [ ] Email HTML formatting OK

### Password Reset Email
- [ ] Email received
- [ ] Reset link works
- [ ] Link expires after use

### Booking Notification Emails
- [ ] New booking → provider email sent
- [ ] Booking confirmed → customer email sent
- [ ] Email content clear i professional

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🌐 Cross-Browser Testing

### Desktop
- [ ] Chrome (latest): _____ (pass/fail)
- [ ] Firefox (latest): _____ (pass/fail)
- [ ] Safari (latest): _____ (pass/fail)
- [ ] Edge (latest): _____ (pass/fail)

### Mobile
- [ ] iOS Safari: _____ (pass/fail)
- [ ] Android Chrome: _____ (pass/fail)

**Issues found:**
```
Browser: _____________
Issue: _____________________________________________
_____________________________________________
```

---

## 🐛 Bugs Found

### Critical (App broken)
```
1. _______________________________________________
   Steps to reproduce: _______________________________________________
   Expected: _______________________________________________
   Actual: _______________________________________________

2. _______________________________________________
```

### Major (Feature not working)
```
1. _______________________________________________
2. _______________________________________________
```

### Minor (UI glitch, typo)
```
1. _______________________________________________
2. _______________________________________________
```

---

## ✅ Final Sign-Off

**Testing completed:** □ Yes  □ No (blocked by: _____________)

**Critical bugs:** _____ (must be 0 to launch)  
**Major bugs:** _____ (should be 0 to launch)  
**Minor bugs:** _____ (can launch with < 5)  

**Recommendation:**
- [ ] ✅ **APPROVED FOR LAUNCH** - All tests passed
- [ ] ⚠️ **CONDITIONAL APPROVAL** - Launch with minor issues noted
- [ ] ❌ **NOT APPROVED** - Critical issues must be fixed

**Tester signature:** ___________________  
**Date:** ___________________  

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```
