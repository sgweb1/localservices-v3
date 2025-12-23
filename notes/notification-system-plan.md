# System Powiadomień LS2 - Plan Implementacji

## 🎯 Cel
Wdrożyć pełny system powiadomień z localservices:
- 4 kanały: Email, Push (VAPID), Toast (WebSocket), Historia (Database)
- Event catalog + templates z interpolacją zmiennych
- Generator testowych wydarzeń (DevTools)
- Per-user preferencje z możliwością wyłączania

## 📊 Analiza istniejącego stanu

### LS2 (obecny)
✅ Mamy:
- `notification_preferences` - boolean flags (email/app per event type)
- NotificationPreference model
- Frontend SettingsPage/NotificationsTab (3 tabs)

❌ Brakuje:
- Event catalog (booking.created, review.received, etc.)
- Templates system z interpolacją zmiennych
- NotificationDispatcher service
- ChannelDispatcher (Email, WebSocket Toast, Push VAPID)
- Generator testowy (DevTools)
- Toast kanał (WebSocket real-time)
- Historia kanał (Database notifications table)

### LocalServices (wzór)
Struktura:
```
notification_events (key, name, description, available_variables, is_active)
  └─ notification_templates (event_id, recipient_type, channels[], email_*, push_*, toast_*, database_*, is_active)
      └─ user_notification_preferences (user_id, template_id, is_disabled, channels_override)
```

Services:
- NotificationDispatcher (główna logika, rate limiting, interpolacja)
- ChannelDispatcher (delegowanie do kanałów)
- VariableInterpolator (zamiana {booking_number} → BK-12345)

Channels:
- Email (Mailgun/SMTP)
- Push (VAPID via web-push library)
- Toast (WebSocket via Laravel Reverb)
- Database (notifications table, historia w panelu)

## 📝 Plan migracji

### Faza 1: Przygotowanie bazy danych (2h)
**Cel:** Rozszerzyć obecny uproszczony model do pełnego systemu events+templates

**Kroki:**
1. ✅ Zachowaj `notification_preferences` dla kompatybilności
2. 🆕 **Dodaj nowe tabele:**
   ```sql
   notification_events (id, key, name, description, available_variables, is_active)
   notification_templates (id, event_id, recipient_type, channels[], 
                            email_*, push_*, toast_*, database_*, 
                            is_active, user_configurable)
   user_notification_preferences (id, user_id, template_id, is_disabled, channels_override)
   ```

3. 🆕 **Seeder:** Wypełnij domyślne eventy i templates
   ```php
   Events:
   - booking.created (Provider: nowa rezerwacja od klienta)
   - booking.accepted (Customer: provider zaakceptował)
   - booking.cancelled (Both: rezerwacja anulowana)
   - booking.completed (Both: usługa zakończona)
   - message.received (Both: nowa wiadomość w chacie)
   - review.received (Provider: nowa opinia)
   
   Templates per event + recipient_type (customer/provider):
   - Email: subject, body (markdown z {variables})
   - Push: title, body
   - Toast: type, title, message, duration
   - Database: title, body, action_url
   ```

**Deliverables:**
- Migracje: `create_notification_events_table`, `create_notification_templates_table`, `update_user_notification_preferences_table`
- Seeders: `NotificationEventsSeeder`, `NotificationTemplatesSeeder`
- Models: NotificationEvent, NotificationTemplate, zaktualizowany UserNotificationPreference

---

### Faza 2: Services layer (3h)
**Cel:** Zbudować NotificationDispatcher + ChannelDispatcher

**Kroki:**
1. **VariableInterpolator** (app/Services/Notifications/VariableInterpolator.php)
   - `interpolate(string $template, array $data): string`
   - Regex: `/\{([a-zA-Z0-9_]+)\}/` → zamień na `$data[$1]`
   - Obsługa zagnieżdżonych danych: `{user.name}` → `$data['user']['name']`

2. **ChannelDispatcher** (app/Services/Notifications/ChannelDispatcher.php)
   - `dispatchEmail(User $user, NotificationTemplate $template, array $data): bool`
   - `dispatchPush(User $user, NotificationTemplate $template, array $data): bool`
   - `dispatchToast(User $user, NotificationTemplate $template, array $data): bool`
   - `dispatchDatabase(User $user, NotificationTemplate $template, array $data): bool`

3. **NotificationDispatcher** (app/Services/Notifications/NotificationDispatcher.php)
   - `send(string $eventKey, User $recipient, string $recipientType, array $data): array`
   - Logika:
     1. Znajdź NotificationEvent po kluczu
     2. Znajdź NotificationTemplate dla recipient_type
     3. Sprawdź user_notification_preferences (czy disabled?)
     4. Rate limiting: Cache throttle 10/min per user+event
     5. Interpoluj zmienne w szablonach
     6. Deleguj do ChannelDispatcher per kanał
     7. Loguj wyniki (NotificationLog)

**Deliverables:**
- Services: VariableInterpolator, ChannelDispatcher, NotificationDispatcher
- Tests: VariableInterpolatorTest (zamiana {booking_number}), NotificationDispatcherTest (mockowanie kanałów)
- AppServiceProvider: bind NotificationDispatcher::class

---

### Faza 3: Email Channel (1h)
**Cel:** Wysyłka emaili z interpolacją zmiennych

**Kroki:**
1. **Mailable:** GenericNotificationMail (app/Mail/GenericNotificationMail.php)
   - Przyjmuje interpolowany subject i body (markdown)
   - Blade view: `resources/views/emails/notification.blade.php` (layout z logo, footer)

2. **ChannelDispatcher::dispatchEmail:**
   ```php
   Mail::to($user->email)->send(new GenericNotificationMail(
       subject: $interpolatedSubject,
       body: $interpolatedBody,
       actionUrl: $template->email_action_url,
   ));
   ```

3. **Config:** Użyj istniejącej konfiguracji MAIL_* w .env

**Deliverables:**
- Mailable: GenericNotificationMail
- Blade view: emails/notification.blade.php (responsywny HTML z Tailwind inline)
- Test: dispatchEmail wysyła maila z poprawnymi zmiennymi

---

### Faza 4: Toast Channel - WebSocket (2h)
**Cel:** Real-time powiadomienia w aplikacji (WebSocket via Laravel Reverb)

**Kroki:**
1. **Event:** NotificationToastEvent (app/Events/NotificationToastEvent.php)
   ```php
   class NotificationToastEvent implements ShouldBroadcast {
       use SerializesModels;
       
       public function __construct(
           public int $userId,
           public string $type, // success/warning/error/info
           public string $title,
           public string $message,
           public int $duration,
       ) {}
       
       public function broadcastOn(): Channel {
           return new PrivateChannel('user.' . $this->userId);
       }
       
       public function broadcastAs(): string {
           return 'toast.notification';
       }
   }
   ```

2. **ChannelDispatcher::dispatchToast:**
   ```php
   broadcast(new NotificationToastEvent(
       userId: $user->id,
       type: $template->toast_type,
       title: $interpolatedTitle,
       message: $interpolatedMessage,
       duration: $template->toast_duration ?? 5,
   ));
   ```

3. **Frontend:** Echo listener w React
   ```typescript
   // src/api/echo.ts
   window.Echo.private(`user.${userId}`)
       .listen('.toast.notification', (event) => {
           toast[event.type](event.title, {
               description: event.message,
               duration: event.duration * 1000,
           });
       });
   ```

4. **Routing:** routes/channels.php
   ```php
   Broadcast::channel('user.{userId}', function ($user, $userId) {
       return (int) $user->id === (int) $userId;
   });
   ```

**Deliverables:**
- Event: NotificationToastEvent
- ChannelDispatcher: dispatchToast implementation
- Frontend: Echo listener w useNotifications hook
- Test: broadcast jest wywołany z poprawnymi danymi

---

### Faza 5: Push Channel - VAPID (4h)
**Cel:** Web Push notifications (działa offline, z akcjami)

**Kroki:**
1. **Instalacja:** `composer require minishlink/web-push`

2. **Config:** config/webpush.php
   ```php
   return [
       'vapid' => [
           'subject' => env('VAPID_SUBJECT', 'mailto:support@ls2.test'),
           'public_key' => env('VAPID_PUBLIC_KEY'),
           'private_key' => env('VAPID_PRIVATE_KEY'),
       ],
   ];
   ```

3. **Generacja kluczy VAPID:**
   ```bash
   php artisan webpush:generate-keys
   ```

4. **Tabela subskrypcji:** push_subscriptions
   ```sql
   id, user_id, endpoint, p256dh_key, auth_key, is_active, last_sent_at, failed_at, created_at
   ```

5. **Model:** PushSubscription + relacja User hasMany

6. **API endpoint:** POST /api/v1/push/subscribe
   ```php
   {
       "endpoint": "https://fcm.googleapis.com/...",
       "keys": {
           "p256dh": "...",
           "auth": "..."
       }
   }
   ```

7. **ChannelDispatcher::dispatchPush:**
   ```php
   $subscriptions = $user->pushSubscriptions()->where('is_active', true)->get();
   
   foreach ($subscriptions as $subscription) {
       WebPush::sendNotification(
           $subscription->toArray(),
           json_encode([
               'title' => $interpolatedTitle,
               'body' => $interpolatedBody,
               'icon' => '/images/icon-192.png',
               'badge' => '/images/badge-72.png',
               'actions' => [
                   ['action' => 'view', 'title' => 'Zobacz'],
                   ['action' => 'dismiss', 'title' => 'Odrzuć'],
               ],
               'data' => [
                   'url' => $template->push_action_url,
               ],
           ]),
       );
   }
   
   // Cleanup: jeśli endpoint zwrócił 410 Gone → usuń subskrypcję
   ```

8. **Frontend Service Worker:** public/sw.js
   ```javascript
   self.addEventListener('push', (event) => {
       const data = event.data.json();
       self.registration.showNotification(data.title, {
           body: data.body,
           icon: data.icon,
           badge: data.badge,
           actions: data.actions,
           data: data.data,
           vibrate: [200, 100, 200],
       });
   });
   
   self.addEventListener('notificationclick', (event) => {
       event.notification.close();
       if (event.action === 'view' && event.notification.data.url) {
           clients.openWindow(event.notification.data.url);
       }
   });
   ```

9. **Frontend subskrypcja:** useWebPush hook
   ```typescript
   const subscribeToWebPush = async () => {
       const registration = await navigator.serviceWorker.ready;
       const subscription = await registration.pushManager.subscribe({
           userVisibleOnly: true,
           applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
       });
       
       await axios.post('/api/v1/push/subscribe', subscription.toJSON());
   };
   ```

**Deliverables:**
- Migration: create_push_subscriptions_table
- Model: PushSubscription
- API: PushSubscriptionController (subscribe, unsubscribe)
- ChannelDispatcher: dispatchPush implementation
- Frontend: Service Worker + useWebPush hook + UI toggle w NotificationsTab
- Command: webpush:cleanup-inactive (usuwa nieaktywne subskrypcje >30 dni)
- Tests: Push subscription flow, payload correct, cleanup inactive

---

### Faza 6: Database Channel - Historia (1h)
**Cel:** Zapis powiadomień w bazie (Laravel notifications table)

**Kroki:**
1. **Migracja Laravel:** `php artisan notifications:table`
   - Tworzy `notifications` table (id, type, notifiable_type, notifiable_id, data, read_at)

2. **ChannelDispatcher::dispatchDatabase:**
   ```php
   $user->notifications()->create([
       'type' => 'App\\Notifications\\GenericNotification',
       'data' => [
           'title' => $interpolatedTitle,
           'body' => $interpolatedBody,
           'action_url' => $template->database_action_url,
           'event_key' => $eventKey,
       ],
   ]);
   ```

3. **Frontend API:** GET /api/v1/notifications (paginacja, unread count)
   ```php
   return [
       'unread_count' => $user->unreadNotifications()->count(),
       'notifications' => $user->notifications()->paginate(20),
   ];
   ```

4. **Frontend UI:** NotificationsTab pokazuje historię z przyciskiem "Oznacz jako przeczytane"

**Deliverables:**
- ChannelDispatcher: dispatchDatabase implementation
- API: NotificationsController (index, markAsRead, markAllAsRead)
- Frontend: Historia w NotificationsTab z listą
- Test: notifications są zapisywane, unread count correct

---

### Faza 7: Generator testowych wydarzeń - DevTools (2h)
**Cel:** Panel developerski do generowania testowych bookingów/wiadomości/opinii

**Kroki:**
1. **Route:** POST /api/v1/dev/generate-test-event (tylko APP_ENV=local)
   ```php
   Route::post('/dev/generate-test-event', [DevToolsController::class, 'generateEvent'])
       ->middleware(['auth:sanctum', 'dev-only']);
   ```

2. **Controller:** DevToolsController
   ```php
   public function generateEvent(Request $request) {
       $request->validate([
           'type' => 'required|in:booking.created,message.received,review.received,booking.cancelled',
       ]);
       
       $user = $request->user();
       
       match($request->type) {
           'booking.created' => $this->createTestBooking($user),
           'message.received' => $this->createTestMessage($user),
           'review.received' => $this->createTestReview($user),
           'booking.cancelled' => $this->cancelTestBooking($user),
       };
       
       return response()->json(['success' => true]);
   }
   
   private function createTestBooking(User $user) {
       $booking = Booking::factory()->create([
           'provider_id' => $user->id,
           'status' => 'pending',
       ]);
       
       // Observer automatycznie wywoła NotificationDispatcher
       // event(new BookingCreated($booking));
   }
   ```

3. **Frontend UI:** DevTools panel w NotificationsTab (tylko development)
   ```tsx
   {import.meta.env.DEV && (
       <Card>
           <CardHeader>
               <CardTitle>🛠️ Generator wydarzeń testowych</CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-2 gap-4">
               <Button onClick={() => generateEvent('booking.created')}>
                   📅 Nowa rezerwacja
               </Button>
               <Button onClick={() => generateEvent('message.received')}>
                   💬 Nowa wiadomość
               </Button>
               <Button onClick={() => generateEvent('review.received')}>
                   ⭐ Nowa ocena
               </Button>
               <Button onClick={() => generateEvent('booking.cancelled')}>
                   ❌ Anulowana rezerwacja
               </Button>
           </CardContent>
       </Card>
   )}
   ```

4. **Middleware:** DevOnlyMiddleware (sprawdza APP_ENV=local)

**Deliverables:**
- Controller: DevToolsController z generateEvent
- Middleware: DevOnlyMiddleware
- Frontend: DevTools panel w NotificationsTab
- Test: Wywołanie endpoint tworzy booking i wysyła powiadomienia

---

### Faza 8: Integracja z Observers (1h)
**Cel:** Automatyczne wysyłanie powiadomień na eventy Eloquent

**Kroki:**
1. **BookingObserver::created:**
   ```php
   public function created(Booking $booking) {
       $dispatcher = app(NotificationDispatcher::class);
       
       // Powiadomienie dla providera
       $dispatcher->send(
           eventKey: 'booking.created',
           recipient: $booking->provider,
           recipientType: 'provider',
           data: [
               'booking_number' => $booking->booking_number,
               'customer_name' => $booking->customer->name,
               'service_name' => $booking->service->name,
               'scheduled_date' => $booking->scheduled_date->format('Y-m-d H:i'),
           ],
       );
   }
   ```

2. **BookingObserver::updated:** (jeśli status zmieniony → cancelled/completed)
   ```php
   if ($booking->wasChanged('status') && $booking->status === 'cancelled') {
       $dispatcher->send('booking.cancelled', $booking->customer, 'customer', [...]);
       $dispatcher->send('booking.cancelled', $booking->provider, 'provider', [...]);
   }
   ```

3. **ReviewObserver::created:**
   ```php
   $dispatcher->send('review.received', $review->provider, 'provider', [
       'customer_name' => $review->customer->name,
       'rating' => $review->rating,
       'service_name' => $review->booking->service->name,
   ]);
   ```

4. **MessageObserver::created:**
   ```php
   // Znajdź drugiego uczestnika rozmowy
   $recipient = $message->conversation->participants
       ->where('id', '!=', $message->sender_id)
       ->first();
   
   $dispatcher->send('message.received', $recipient, 'both', [
       'sender_name' => $message->sender->name,
       'message_preview' => Str::limit($message->content, 50),
   ]);
   ```

**Deliverables:**
- Zaktualizowane Observers: Booking, Review, Message (dodaj wywołania NotificationDispatcher)
- Tests: Po utworzeniu booking → powiadomienie wysłane

---

### Faza 9: Frontend - NotificationsTab update (2h)
**Cel:** UI do zarządzania preferencjami + Historia + DevTools

**Kroki:**
1. **API:** GET /api/v1/provider/settings/notification-preferences
   ```typescript
   type NotificationPreferences = {
       templates: Array<{
           id: number;
           event_key: string;
           event_name: string;
           channels: {
               email: { enabled: boolean; user_can_disable: boolean };
               push: { enabled: boolean; user_can_disable: boolean };
               toast: { enabled: boolean; user_can_disable: boolean };
               database: { enabled: boolean; user_can_disable: boolean };
           };
           user_preferences: {
               is_disabled: boolean;
               channels_override: string[] | null;
           };
       }>;
       push_subscription_status: 'active' | 'inactive' | 'not_supported';
       unread_count: number;
   };
   ```

2. **NotificationsTab layout:**
   ```tsx
   <Tabs defaultValue="preferences">
       <TabsList>
           <TabsTrigger value="preferences">Preferencje</TabsTrigger>
           <TabsTrigger value="history">Historia ({unreadCount})</TabsTrigger>
           {import.meta.env.DEV && <TabsTrigger value="devtools">DevTools</TabsTrigger>}
       </TabsList>
       
       <TabsContent value="preferences">
           <Card>
               <CardHeader>
                   <CardDescription>
                       Dostępne kanały:
                       ✓ Email • {pushStatus === 'active' ? '✓ Push' : '○ Push (wyłączone)'} • ✓ Toast • ✓ Historia
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   {templates.map(template => (
                       <NotificationRow
                           key={template.id}
                           template={template}
                           onToggle={handleToggle}
                       />
                   ))}
               </CardContent>
           </Card>
       </TabsContent>
       
       <TabsContent value="history">
           <NotificationHistoryList />
       </TabsContent>
       
       {import.meta.env.DEV && (
           <TabsContent value="devtools">
               <DevToolsPanel />
           </TabsContent>
       )}
   </Tabs>
   ```

3. **NotificationRow component:**
   ```tsx
   <div className="flex items-center justify-between py-4 border-b">
       <div>
           <h4 className="font-medium">{template.event_name}</h4>
           <p className="text-sm text-muted-foreground">
               Wysyłane gdy {getEventDescription(template.event_key)}
           </p>
       </div>
       <div className="flex gap-4">
           <Switch checked={!template.user_preferences.is_disabled} onCheckedChange={() => onToggle(template.id)} />
           
           <div className="flex gap-2">
               <Badge variant={template.channels.email.enabled ? 'default' : 'secondary'}>✉️ Email</Badge>
               <Badge variant={template.channels.push.enabled ? 'default' : 'secondary'}>🔔 Push</Badge>
               <Badge variant={template.channels.toast.enabled ? 'default' : 'secondary'}>💬 Toast</Badge>
               <Badge variant={template.channels.database.enabled ? 'default' : 'secondary'}>📚 Historia</Badge>
           </div>
       </div>
   </div>
   ```

4. **Web Push toggle:**
   ```tsx
   {pushStatus === 'inactive' && (
       <Alert>
           <AlertDescription>
               Push powiadomienia wymagają subskrypcji.
               <Button onClick={subscribeToWebPush}>Włącz Push</Button>
           </AlertDescription>
       </Alert>
   )}
   ```

**Deliverables:**
- API: NotificationPreferencesController (index, update)
- Components: NotificationRow, NotificationHistoryList, DevToolsPanel
- Hooks: useNotificationPreferences, useWebPush
- Tests: Cypress E2E - wyłączenie powiadomienia, włączenie Push

---

## 🕐 Szacowany czas: **18h**
- Faza 1: Baza danych (2h)
- Faza 2: Services (3h)
- Faza 3: Email (1h)
- Faza 4: Toast (2h)
- Faza 5: Push (4h)
- Faza 6: Historia (1h)
- Faza 7: DevTools (2h)
- Faza 8: Observers (1h)
- Faza 9: Frontend (2h)

## ✅ Deliverables finalne:
1. **Backend:**
   - 4 tabele (events, templates, user_prefs, push_subscriptions)
   - 3 services (NotificationDispatcher, ChannelDispatcher, VariableInterpolator)
   - 4 kanały (Email, Push, Toast, Database)
   - DevToolsController

2. **Frontend:**
   - NotificationsTab z 3 zakładkami (Preferencje, Historia, DevTools)
   - Web Push subskrypcja toggle
   - Service Worker
   - Echo listener dla Toast

3. **Tests:**
   - Unit: VariableInterpolator (interpolacja {zmiennych})
   - Feature: NotificationDispatcher (wysyłka per kanał)
   - Feature: Push subscription flow
   - Feature: DevTools generator
   - E2E Cypress: Wyłączenie powiadomienia, włączenie Push

4. **Dokumentacja:**
   - `docs/NOTIFICATIONS.md` - Architektura systemu
   - `README.md` - Sekcja o powiadomieniach

---

## 🚀 Rozpoczęcie: Faza 1 - Przygotowanie bazy danych
Czy zaczynam od migracji i seedów?

---

## 📐 Faza 10: Preferencje i priorytety (precedence)
**Cel:** Jasne reguły, które ustawienia decydują o wysyłce.

**Reguły:**
1. Domyślne ustawienia `NotificationTemplate.channels` → baza.
2. Per-user `user_notification_preferences.is_disabled` → hard stop (kanały off).
3. `channels_override` (jeśli lista niepusta) → użyj wyłącznie wskazanych kanałów.
4. Legacy `notification_preferences` (compat) → tylko jeśli brak nowego wpisu dla użytkownika.

**Warstwowanie decyzji:**
```
effectiveChannels = Template.channels
if (UserPref.is_disabled) effectiveChannels = []
else if (UserPref.channels_override) effectiveChannels = intersection(override, Template.channels)
else if (LegacyPref.exists) effectiveChannels = intersection(LegacyPref.allowed, Template.channels)
```

---

## 🛑 Faza 11: Rate limiting, deduplikacja, quiet hours
**Cel:** Ograniczyć spam i łączyć powiadomienia.

- Rate limit: cache key `notif:{userId}:{eventKey}` → 10/min.
- Deduplikacja: w oknie 60s scal powtarzające się zdarzenia (np. wiele wiadomości → 1 toast „Masz 5 nowych wiadomości”).
- Quiet hours: okno ciszy (np. 22:00–8:00) dla Email/Push; Toast/Historia zawsze dozwolone.
- Retry polityka: Email (Laravel queue retry 3x), Push (retry 2x, potem cleanup endpointu 410 Gone).

---

## 🌍 Faza 12: i18n + templating
**Cel:** Szablony wielojęzyczne z pluralizacją.

- `NotificationTemplate` przechowuje `locale` lub używamy translacji z plików `lang/`.
- Interpolator: wspiera `{user.name}`, `{count}`, `{date}` z formatowaniem per locale.
- Pluralizacja: klucze w `lang/pl/notifications.php` np. `"new_messages" => ":count nowa wiadomość|:count nowe wiadomości|:count nowych wiadomości"`.
- Fallback: jeśli brak szablonu dla języka użytkownika → użyj `en`.

---

## 🔭 Faza 13: Observability (logi, metryki, alerty)
**Cel:** Widoczność działania systemu.

- Metryki (Prometheus/StatsD):
    - `notifications_sent_total{channel,event}`
    - `notifications_failed_total{channel,event}`
    - `dispatch_duration_ms{channel}`
    - `push_subscriptions_active_total`
- Logi strukturalne: `NotificationLog` (user_id, event_key, channels[], success[], failure[], correlation_id).
- Alerty: próg błędów >5% w 5 min dla kanału → wysyłka alertu do Sentry/NewRelic.

---

## 🔒 Faza 14: Prywatność, zgodność i retencja
**Cel:** Minimalizacja danych, kontrola użytkownika.

- Minimalizuj payload (bez wrażliwych danych w push/emaile poza koniecznymi).
- Retencja: `notifications` (historia) przechowywać max 180 dni; crontab cleanup.
- Opt-out: globalny `user_opt_out_all` (np. marketing), per-template opt-out (operacyjne zostają).
- Audit trail: `notification_audits` (kto, kiedy zmienił preferencje).
- Zgodność: link „Zarządzaj powiadomieniami” w mailach, zgodność z CAN-SPAM/GDPR.

---

## 🔁 Migracja z `notification_preferences` (compat layer)
**Cel:** Bezpieczne przejście bez regresji.

**Kroki:**
1. Backfill: dla każdego użytkownika utwórz `user_notification_preferences` na podstawie obecnych flag.
2. Mapowanie eventów: istniejące typy → nowe `notification_events.key`.
3. Feature flag: `notifications.v2=true` (rollout per 5%, 25%, 100%).
4. Fallback: jeśli brak wpisu w `user_notification_preferences`, użyj legacy.
5. Telemetria: porównuj skuteczność kanałów przed/po migracji.

---

## 📡 API Contracts (example)

### GET /api/v1/notifications/preferences
Response:
```json
{
    "templates": [
        {
            "id": 12,
            "event_key": "booking.created",
            "event_name": "Nowa rezerwacja",
            "channels": {
                "email": { "enabled": true, "user_can_disable": true },
                "push": { "enabled": true, "user_can_disable": true },
                "toast": { "enabled": true, "user_can_disable": false },
                "database": { "enabled": true, "user_can_disable": false }
            },
            "user_preferences": {
                "is_disabled": false,
                "channels_override": null
            }
        }
    ],
    "push_subscription_status": "inactive",
    "unread_count": 3
}
```

### PUT /api/v1/notifications/preferences/{templateId}
Body:
```json
{ "is_disabled": false, "channels_override": ["email","push"] }
```
Response: `204 No Content`

### GET /api/v1/notifications
Query: `?page=1`
```json
{
    "unread_count": 2,
    "notifications": [
        {
            "id": "uuid-1",
            "title": "Rezerwacja BK-12345",
            "body": "Jan Nowak zamówił Express",
            "action_url": "/provider/bookings/BK-12345",
            "read_at": null,
            "created_at": "2025-12-23T10:15:00Z",
            "event_key": "booking.created"
        }
    ]
}
```

### POST /api/v1/push/subscribe
Body (W3C):
```json
{
    "endpoint": "https://fcm.googleapis.com/fcm/send/abc",
    "keys": { "p256dh": "...", "auth": "..." }
}
```
Response: `201 Created`

---

## 🚦 Rollout plan
- Etap 1: Deploy schematów + seeders (flaga `notifications.v2=false`).
- Etap 2: Deploy Services + ChannelDispatcher (dry-run → tylko Historia). 
- Etap 3: Włącz Toast, następnie Push, na końcu Email.
- Etap 4: 5% użytkowników → 25% → 100%; monitoruj błędy/metryki.
- Etap 5: Wyłącz legacy po 2 tygodniach bez regresji.

---

## ✅ Deployment checklist
- Migrations + seeders uruchomione.
- VAPID keys ustawione (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
- Service Worker zbudowany i serwowany.
- Private channels (`Broadcast::channel('user.{id}')`) działają.
- Queue workers uruchomione (`queue:work` dla mail/push).
- Feature flags skonfigurowane.
- Alerting i logging włączone.

---

## ▶️ Następny krok
Tak — zacznij od migracji i seedów dla tabel `notification_events`, `notification_templates`, `user_notification_preferences`, a następnie stwórz minimalny `NotificationDispatcher` z logiką tylko dla kanału „Historia”, żeby bezpiecznie zweryfikować przepływ end-to-end.
