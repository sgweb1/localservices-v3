// Mock data for provider subpages (dev only)
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const bookings = [
  { id: 1, customerName: 'Piotr Wiśniewski', serviceName: 'Hydraulik - naprawa przecieków', date: '2025-12-20 10:30', status: 'pending' as BookingStatus },
  { id: 2, customerName: 'Anna Kowalczyk', serviceName: 'Montaż gniazdka elektrycznego', date: '2025-12-20 14:00', status: 'confirmed' as BookingStatus },
  { id: 3, customerName: 'Marek Nowicki', serviceName: 'Sprzątanie mieszkania 50m²', date: '2025-12-18 09:00', status: 'completed' as BookingStatus },
  { id: 4, customerName: 'Katarzyna Zielińska', serviceName: 'Korepetycje z matematyki', date: '2025-12-22 17:00', status: 'pending' as BookingStatus },
  { id: 5, customerName: 'Tomasz Adamski', serviceName: 'Naprawa pralki', date: '2025-12-21 12:00', status: 'cancelled' as BookingStatus },
];

export const conversations = [
  { id: 1, customerName: 'Piotr Wiśniewski', lastMessage: 'Czy pasuje jutro po 10:00?', updatedAt: '2025-12-19 10:10', unreadCount: 2 },
  { id: 2, customerName: 'Anna Kowalczyk', lastMessage: 'Dziękuję za szybki termin!', updatedAt: '2025-12-19 08:45', unreadCount: 0 },
  { id: 3, customerName: 'Marek Nowicki', lastMessage: 'Czy to się da naprawić?', updatedAt: '2025-12-18 18:20', unreadCount: 1 },
];

export const services = [
  { id: 1, name: 'Hydraulik 24h', category: 'Hydraulika', city: 'Warszawa', views: 234, status: 'visible' },
  { id: 2, name: 'Elektryk - szybkie naprawy', category: 'Elektryka', city: 'Warszawa', views: 180, status: 'visible' },
  { id: 3, name: 'Sprzątanie mieszkań', category: 'Sprzątanie', city: 'Warszawa', views: 96, status: 'hidden' },
];

export const reviews = [
  { id: 1, author: 'Agnieszka P.', rating: 5, comment: 'Szybko i profesjonalnie. Polecam!', createdAt: '2025-12-15' },
  { id: 2, author: 'Robert S.', rating: 4, comment: 'Wszystko ok, drobne opóźnienie.', createdAt: '2025-12-12' },
];

export const notifications = [
  { id: 1, type: 'booking', title: 'Nowa prośba o rezerwację', body: 'Piotr Wiśniewski prosi o termin 20.12 10:30', read: false, createdAt: '2025-12-19 10:05' },
  { id: 2, type: 'review', title: 'Nowa opinia 5★', body: 'Agnieszka dodała opinię', read: true, createdAt: '2025-12-15 11:20' },
];

export const subscription = {
  planName: 'Pro',
  planSlug: 'pro',
  expiresAt: '2026-01-15',
  limits: {
    listings: { current: 8, max: 15 },
    categories: { current: 5, max: 8 },
  },
  addons: [
    { key: 'instant_booking', name: 'Instant Booking', active: true },
    { key: 'analytics_pro', name: 'Analityka PRO', active: false },
  ],
};
