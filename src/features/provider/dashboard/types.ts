/**
 * TypeScript types dla Provider Dashboard
 * 
 * Kontrakt danych między API a React komponentami
 * Zgodne z ProviderDashboardApiService (backend)
 */

// ==================== PLAN CARD ====================

export interface PlanLimitItem {
  key: string;              // "max_listings", "max_service_categories"
  title: string;            // "Ogłoszenia"
  description: string;      // "Widoczne w katalogu"
  icon: string;             // "heroicon-o-rectangle-stack"
  current: number;          // 5
  limit: number;            // 10
  percentage: number;       // 50
  is_unlimited: boolean;    // false
  is_exceeded: boolean;     // false
}

export interface PlanCard {
  plan_name: string;        // "FREE", "BASIC", "PRO", "PREMIUM"
  plan_slug: string;        // "free", "basic", "pro", "premium"
  expires_at: string | null; // "31.12.2025" lub null
  items: PlanLimitItem[];
}

// ==================== ADDONS CAROUSEL ====================

export interface AddonCard {
  key: string;              // "instant-booking", "analytics"
  title: string;            // "Instant Booking"
  description: string;      // "Pozwalaj klientom rezerwować..."
  feature: string;          // "instant_booking"
  required_plan: string;    // "PRO"
  icon: string;             // "heroicon-o-bolt"
  available: boolean;       // true
  cta_url: string;          // "/provider/analytics" lub "/provider/subscription/plans"
  badge: string;            // "Aktywne" lub "Od PRO"
}

// ==================== PIPELINE BOARD ====================

export interface PipelineRequests {
  incoming: number;         // 12
  quoted: number;           // 8
  converted: number;        // 5
  conversion_rate: number;  // 20.0 (%)
}

export interface PipelineBookings {
  pending: number;          // 3
  confirmed: number;        // 7
  completed: number;        // 15
}

export interface PipelineBoard {
  period: string;           // "Ostatnie 30 dni"
  can_view_details: boolean; // true jeśli hasFeature('instant_booking' + 'messaging')
  requests: PipelineRequests;
  bookings: PipelineBookings;
}

// ==================== INSIGHTS CARD ====================

export interface TrafficSource {
  label: string;            // "Katalog LocalServices"
  value: number;            // 45
}

export interface InsightsCard {
  trust_score: number;      // 85
  trust_delta: number;      // +15 (względem progu 70)
  click_rate: number | null; // 5.2 (%) lub null
  completed: number;        // 12 (w tym miesiącu)
  traffic_sources: TrafficSource[];
  period_label: string;     // "Ostatnie 30 dni"
}

// ==================== TASKS CARD ====================

export interface TaskItem {
  id: string;               // "portfolio", "instant-booking-optin"
  title: string;            // "Dodaj zdjęcia realizacji"
  description: string;      // "Minimum 3 zdjęcia..."
  completed: boolean;       // false
  route: string;            // "/provider/profile/edit"
  reward: string | null;    // "+5 Trust Score™"
}

export interface TasksCard {
  progress: number;         // 60 (%)
  items: TaskItem[];
}

// ==================== PERFORMANCE SNAPSHOT ====================

export interface PerformanceSnapshot {
  views: number;               // 256
  favorited: number;           // 18
  avg_response_time: string;   // "45 min"
  rating: number | null;       // 4.5 lub null
  period_label: string;        // "Ostatnie 30 dni"
}

// ==================== CALENDAR GLANCE ====================

export interface CalendarSlot {
  period: string;           // "morning", "afternoon"
  time_range: string;       // "09:00 - 12:00"
  available: boolean;       // true
}

export interface CalendarDay {
  date: string;             // "2025-12-20"
  date_formatted: string;   // "Sobota, 20 grudnia"
  slots: CalendarSlot[];
}

export interface CalendarGlance {
  days: CalendarDay[];
  is_blurred: boolean;      // true jeśli brak uprawnień do instant_booking
  calendar_url: string;     // "/provider/calendar"
}

// ==================== MESSAGE CENTER ====================

export interface MessageRequest {
  id: number;               // 123
  customer: string;         // "Jan Kowalski"
  status: string;           // "pending", "quoted", "accepted"
  created_at: string;       // "2 godziny temu"
  quote_due: string | null; // "31.12" (data ważności oferty)
}

export interface MessageCenter {
  items: MessageRequest[];  // max 4
  unread_count: number;     // 3
  messages_url: string;     // "/provider/messages"
}

// ==================== NOTIFICATIONS CARD ====================

export interface NotificationItem {
  id: string;               // "uuid"
  type: string;             // "App\Notifications\BookingCreated"
  title: string;            // "Nowa rezerwacja"
  message: string;          // "Jan Kowalski zarezerwował usługę"
  action_url: string | null; // "/provider/bookings/123"
  read_at: string | null;   // "2 godziny temu" lub null
  created_at: string;       // "2 godziny temu"
}

export interface NotificationsCard {
  items: NotificationItem[]; // max 5
  unread_count: number;     // 0
}

// ==================== SERVICES CARD ====================

export interface ServiceItem {
  id: number;               // 123
  title: string;            // "Naprawa instalacji wodnych"
  status: string;           // "active", "draft", "paused"
  views_count: number;      // 145
  category: string;         // "Hydraulika"
}

export interface ServicesCard {
  services: ServiceItem[];  // top 6 by views_count
}

// ==================== DASHBOARD WIDGETS (ALL) ====================

export interface DashboardWidgets {
  plan_card: PlanCard;
  addons_carousel: AddonCard[];
  pipeline_board: PipelineBoard;
  insights_card: InsightsCard;
  tasks_card: TasksCard;
  performance_snapshot: PerformanceSnapshot;
  calendar_glance: CalendarGlance;
  message_center: MessageCenter;
  notifications_card: NotificationsCard;
  services_card: ServicesCard;
}

// ==================== API RESPONSE ====================

export interface DashboardWidgetsResponse {
  data: DashboardWidgets;
}
