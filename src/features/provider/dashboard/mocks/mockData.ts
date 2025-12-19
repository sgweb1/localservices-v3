import { DashboardWidgets } from '../types';

/**
 * Mock Data dla Provider Dashboard
 * 
 * Używane do testowania widgetów bez potrzeby backendu.
 */
export const mockDashboardData: DashboardWidgets = {
  plan_card: {
    plan_name: 'Pro Plan',
    plan_slug: 'pro',
    expires_at: '2026-01-15',
    items: [
      {
        key: 'service_listings',
        title: 'Ogłoszenia',
        description: 'Aktywne ogłoszenia usług',
        icon: 'heroicon-o-rectangle-stack',
        current: 8,
        limit: 15,
        percentage: 53,
        is_unlimited: false,
        is_exceeded: false,
      },
      {
        key: 'categories',
        title: 'Kategorie',
        description: 'Dostępne kategorie usług',
        icon: 'heroicon-o-tag',
        current: 5,
        limit: 8,
        percentage: 63,
        is_unlimited: false,
        is_exceeded: false,
      },
    ],
  },

  addons_carousel: [
    {
      key: 'instant_booking',
      title: 'Instant Booking',
      description: 'Automatyczne rezerwacje 24/7 bez potwierdzania',
      icon: 'heroicon-o-bolt',
      available: true,
      required_plan: 'Pro',
      cta_url: '/provider/addons/instant-booking',
    },
    {
      key: 'analytics_pro',
      title: 'Analityka PRO',
      description: 'Zaawansowane raporty i analiza konwersji',
      icon: 'heroicon-o-chart-bar',
      available: false,
      required_plan: 'Premium',
      cta_url: '/provider/subscription/plans',
    },
  ],

  pipeline_board: {
    requests: {
      incoming: 12,
      quoted: 8,
      converted: 5,
      conversion_rate: 42,
    },
    bookings: {
      pending: 3,
      confirmed: 7,
      completed: 15,
    },
    can_view_details: true,
    period: 'Ostatnie 30 dni',
  },

  insights_card: {
    trust_score: 78,
    trust_delta: 8,
    click_rate: 3.2,
    completed: 24,
    traffic_sources: [
      { label: 'Katalog', value: 145 },
      { label: 'Polecenia', value: 89 },
      { label: 'Bezpośrednie', value: 34 },
    ],
    period_label: 'Ten miesiąc',
  },

  tasks_card: {
    items: [
      {
        id: 1,
        title: 'Dodaj zdjęcia portfolio',
        description: 'Minimum 3 zdjęcia',
        completed: false,
        route: '/provider/profile/portfolio',
        reward: '+5 Trust Score',
      },
      {
        id: 2,
        title: 'Uzupełnij opis profilu',
        description: 'Minimum 150 znaków',
        completed: true,
        route: '/provider/profile/edit',
        reward: null,
      },
      {
        id: 3,
        title: 'Dodaj godziny dostępności',
        description: 'Kalendarz na 7 dni',
        completed: false,
        route: '/provider/calendar',
        reward: '+10 Trust Score',
      },
      {
        id: 4,
        title: 'Odpowiedz na pierwsze zapytanie',
        description: 'W ciągu 24h',
        completed: true,
        route: '/provider/requests',
        reward: null,
      },
      {
        id: 5,
        title: 'Włącz Instant Booking',
        description: 'Zwiększ konwersję o 40%',
        completed: false,
        route: '/provider/addons',
        reward: 'PRO Feature',
      },
    ],
    progress: 40,
  },

  performance_snapshot: {
    views: 234,
    favorited: 18,
    avg_response_time: '2.5h',
    rating: 4.7,
    period_label: 'Ostatnie 7 dni',
  },

  calendar_glance: {
    days: [
      {
        date: '2025-12-20',
        date_formatted: 'Piątek, 20 gru',
        slots: [
          { period: 'morning', time_range: '8:00-12:00', available: true },
          { period: 'afternoon', time_range: '13:00-17:00', available: false },
        ],
      },
      {
        date: '2025-12-21',
        date_formatted: 'Sobota, 21 gru',
        slots: [
          { period: 'morning', time_range: '8:00-12:00', available: true },
          { period: 'afternoon', time_range: '13:00-17:00', available: true },
        ],
      },
      {
        date: '2025-12-22',
        date_formatted: 'Niedziela, 22 gru',
        slots: [
          { period: 'morning', time_range: '8:00-12:00', available: false },
          { period: 'afternoon', time_range: '13:00-17:00', available: false },
        ],
      },
    ],
    is_blurred: false,
  },

  message_center: {
    items: [
      {
        id: 1,
        customer_name: 'Anna Nowak',
        service_name: 'Remont łazienki',
        message_preview: 'Witam, potrzebuję wyceny na kompleksowy remont łazienki 8m². Czy jest Pan dostępny w przyszłym tygodniu?',
        created_at: '2 godz. temu',
        quote_due: '22 godz.',
      },
      {
        id: 2,
        customer_name: 'Piotr Wiśniewski',
        service_name: 'Naprawa instalacji',
        message_preview: 'Pilne! Przeciek w kuchni. Czy możliwy jest przyjazd jeszcze dzisiaj?',
        created_at: '5 godz. temu',
        quote_due: '3 godz.',
      },
      {
        id: 3,
        customer_name: 'Maria Kowalska',
        service_name: 'Malowanie pokoju',
        message_preview: 'Dzień dobry, chciałabym poznać cenę za malowanie pokoju 15m².',
        created_at: '1 dzień temu',
        quote_due: null,
      },
    ],
    unread_count: 2,
  },

  notifications_card: {
    items: [
      {
        id: 1,
        type: 'booking_created',
        title: 'Nowa rezerwacja',
        message: 'Jan Kowalski zarezerwował usługę "Remont kuchni" na 25.12.2025',
        created_at: '10 min temu',
        read_at: null,
        action_url: '/provider/bookings/123',
        data: { booking_id: 123 },
      },
      {
        id: 2,
        type: 'new_review',
        title: 'Nowa opinia',
        message: 'Otrzymałeś opinię 5★ od Anny Nowak za usługę "Malowanie"',
        created_at: '2 godz. temu',
        read_at: null,
        action_url: '/provider/reviews',
        data: { review_id: 45 },
      },
      {
        id: 3,
        type: 'verification_reminder',
        title: 'Przypomnienie o weryfikacji',
        message: 'Uzupełnij dokumenty weryfikacyjne, aby zwiększyć Trust Score',
        created_at: '1 dzień temu',
        read_at: '2025-12-18T10:00:00Z',
        action_url: '/provider/verification',
        data: null,
      },
    ],
    unread_count: 2,
  },

  services_card: {
    items: [
      {
        id: 1,
        title: 'Remont łazienki',
        category_name: 'Remonty i wykończenia',
        views_count: 145,
        is_active: true,
        image_url: null,
      },
      {
        id: 2,
        title: 'Instalacja hydrauliczna',
        category_name: 'Hydraulika',
        views_count: 98,
        is_active: true,
        image_url: null,
      },
      {
        id: 3,
        title: 'Naprawa awaryjna',
        category_name: 'Hydraulika',
        views_count: 76,
        is_active: true,
        image_url: null,
      },
      {
        id: 4,
        title: 'Malowanie ścian',
        category_name: 'Malarstwo',
        views_count: 54,
        is_active: true,
        image_url: null,
      },
      {
        id: 5,
        title: 'Układanie płytek',
        category_name: 'Remonty i wykończenia',
        views_count: 43,
        is_active: false,
        image_url: null,
      },
      {
        id: 6,
        title: 'Wymiana baterii',
        category_name: 'Hydraulika',
        views_count: 32,
        is_active: true,
        image_url: null,
      },
    ],
  },
};
