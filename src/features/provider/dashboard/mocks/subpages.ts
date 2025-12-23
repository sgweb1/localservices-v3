// Mock data for provider subpages (dev only)
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export const bookings = [
  { 
    id: 1, 
    customerName: 'Piotr Wiśniewski', 
    customerId: 101,
    serviceName: 'Hydraulik - naprawa przecieków', 
    bookingNumber: 'BK-2025-001',
    bookingDate: '2025-12-20',
    startTime: '10:30:00',
    endTime: '12:00:00',
    durationMinutes: 90,
    serviceAddress: { street: 'ul. Marszałkowska 15/3', postalCode: '00-001', city: 'Warszawa' },
    customerNotes: 'Cieknie pod zlewem w kuchni',
    servicePrice: 200,
    totalPrice: 200,
    paymentStatus: 'pending' as const,
    status: 'pending' as BookingStatus,
    canAccess: true,
  },
  { 
    id: 2, 
    customerName: 'Anna Kowalczyk', 
    customerId: 102,
    serviceName: 'Montaż gniazdka elektrycznego', 
    bookingNumber: 'BK-2025-002',
    bookingDate: '2025-12-20',
    startTime: '14:00:00',
    endTime: '15:00:00',
    durationMinutes: 60,
    serviceAddress: { street: 'ul. Krakowska 8', postalCode: '02-001', city: 'Warszawa' },
    servicePrice: 150,
    totalPrice: 150,
    paymentStatus: 'paid' as const,
    status: 'confirmed' as BookingStatus,
    canAccess: true,
  },
  { 
    id: 3, 
    customerName: 'Marek Nowicki', 
    customerId: 103,
    serviceName: 'Sprzątanie mieszkania 50m²', 
    bookingNumber: 'BK-2025-003',
    bookingDate: '2025-12-18',
    startTime: '09:00:00',
    endTime: '12:00:00',
    durationMinutes: 180,
    serviceAddress: { street: 'al. Jerozolimskie 123', postalCode: '02-017', city: 'Warszawa' },
    customerNotes: 'Proszę o dokładne umycie okien',
    servicePrice: 250,
    totalPrice: 250,
    paymentStatus: 'paid' as const,
    status: 'confirmed' as BookingStatus, // Przeterminowana!
    canAccess: true,
  },
  { 
    id: 4, 
    customerName: 'Katarzyna Zielińska', 
    customerId: 104,
    serviceName: 'Korepetycje z matematyki', 
    bookingNumber: 'BK-2025-004',
    bookingDate: '2025-12-22',
    startTime: '17:00:00',
    endTime: '18:30:00',
    durationMinutes: 90,
    serviceAddress: { street: 'ul. Nowy Świat 45', postalCode: '00-042', city: 'Warszawa' },
    servicePrice: 100,
    totalPrice: 100,
    paymentStatus: 'pending' as const,
    status: 'pending' as BookingStatus,
    canAccess: true,
  },
  { 
    id: 5, 
    customerName: 'Tomasz Adamski', 
    customerId: 105,
    serviceName: 'Naprawa pralki', 
    bookingNumber: 'BK-2025-005',
    bookingDate: '2025-12-21',
    startTime: '12:00:00',
    endTime: '13:00:00',
    durationMinutes: 60,
    serviceAddress: { street: 'ul. Grochowska 256', postalCode: '04-507', city: 'Warszawa' },
    servicePrice: 180,
    totalPrice: 180,
    status: 'cancelled' as BookingStatus,
    canAccess: true,
  },
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

// Unified mock object for hooks
export const MOCK_SUBPAGES = {
  bookings: {
    data: bookings,
    counts: {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    },
    overdueConfirmedCount: 1, // booking id=3 jest przeterminowany
    canManage: true, // dla dev: pełny dostęp
    showUpsell: false, // nie pokazuj upsell (mamy dostęp)
    hasBookings: true,
    showTrialInfo: false, // nie pokazuj trial info (pełny dostęp)
    trialDays: 0,
    maxBookingDate: undefined,
  },
  conversations: {
    data: conversations.map(c => ({
      id: c.id,
      participantName: c.customerName,
      lastMessage: c.lastMessage,
      lastMessageAt: c.updatedAt,
      unreadCount: c.unreadCount,
    })),
    counts: {
      unread: conversations.filter(c => c.unreadCount > 0).length,
    },
  },
  services: {
    data: services.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      price: '150-300 zł',
      status: s.status === 'visible' ? 'active' : 'inactive',
    })),
    counts: {
      active: services.filter(s => s.status === 'visible').length,
      inactive: services.filter(s => s.status === 'hidden').length,
    },
  },
  reviews: {
    data: reviews.map(r => ({
      id: r.id,
      customerName: r.author,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,
    })),
    averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
    totalReviews: reviews.length,
    distribution: reviews.reduce<Record<string, number>>((acc, r) => {
      acc[String(r.rating)] = (acc[String(r.rating)] || 0) + 1;
      return acc;
    }, {}),
  },
  notifications: {
    data: notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.body,
      createdAt: n.createdAt,
      isRead: n.read,
    })),
    counts: {
      unread: notifications.filter(n => !n.read).length,
    },
  },
  subscription: {
    data: {
      plan: subscription.planSlug,
      expiresAt: subscription.expiresAt,
      features: [
        'Nieograniczone usługi',
        'Priorytet w wynikach',
        'Analityka zaawansowana',
        'Wsparcie 24/7',
      ],
      limits: {
        maxServices: subscription.limits.listings.max,
        maxPhotos: 100,
        prioritySupport: true,
        analytics: true,
      },
    },
  },
};
