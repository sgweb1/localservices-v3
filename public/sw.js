self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const data = event.data ? event.data.json() : {};
  console.log('[Service Worker] Push data:', data);

  const title = data.title || 'Powiadomienie';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  console.log('[Service Worker] Showing notification:', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url;

  if (event.action === 'dismiss') {
    return;
  }

  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
