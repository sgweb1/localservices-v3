/**
 * Typy dla rezerwacji (Bookings)
 * 
 * ZMIANA (2025-12-31): Dodano pole isHidden, hiddenByProvider dla funkcjonalności ukrywania rezerwacji
 */

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

export interface ServiceAddress {
  street: string | null;
  postalCode: string | null;
  city: string | null;
}

export interface Customer {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar_url: string | null;
  rating_average: number;
  rating_count: number;
  is_online: boolean;
  last_seen_at: string | null;
}

export interface Provider {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar_url: string | null;
  rating_average: number;
  rating_count: number;
  is_online: boolean;
  last_seen_at: string | null;
}

export interface Service {
  id: number;
  uuid: string;
  title: string;
  description: string;
  base_price: number;
  category_id: number;
  location_id: number;
  instant_booking: boolean;
  status: string;
  primary_photo_url: string | null;
  provider: {
    id: number;
    uuid: string;
    name: string;
    avatar: string | null;
    rating_average: number;
    rating_count: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Główny typ rezerwacji zwracany z API
 */
export interface Booking {
  id: number;
  uuid: string;
  booking_number: string;
  bookingNumber: string;
  status: BookingStatus;
  booking_date: string;
  bookingDate: string;
  start_time: string;
  startTime: string;
  end_time: string;
  endTime: string;
  duration_minutes: number;
  durationMinutes: number;
  service_address: ServiceAddress;
  serviceAddress: ServiceAddress;
  location: ServiceAddress;
  distance_km: number;
  service_price: number;
  servicePrice: number;
  total_price: number;
  totalPrice: number;
  currency: string;
  payment_status: PaymentStatus;
  paymentStatus: PaymentStatus;
  customer_notes: string | null;
  customerNotes: string | null;
  provider_notes: string | null;
  providerNotes: string | null;
  
  // Hidden flags - dodane 2025-12-31
  hidden_by_provider: boolean;
  hiddenByProvider: boolean;
  isHidden: boolean; // Alias dla frontend (provider view)
  
  // Relations
  customer_id: number;
  customerId: number;
  customer_name: string;
  customerName: string;
  service_name: string;
  serviceName: string;
  service?: Service;
  customer?: Customer;
  provider?: Provider;
}

/**
 * Response z endpointu GET /api/v1/provider/bookings
 */
export interface BookingsResponse {
  data: Booking[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Response z endpointu ProviderBookingController (dashboard bookings)
 * Ten endpoint zwraca dodatkowe pola: counts, pagination, overdueConfirmedCount
 */
export interface ProviderBookingsResponse {
  data: Booking[];
  counts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    rejected?: number;
  };
  overdueConfirmedCount: number;
  canManage: boolean;
  showUpsell: boolean;
  hasBookings: boolean;
  showTrialInfo: boolean;
  trialDays?: number;
  maxBookingDate?: string;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}
