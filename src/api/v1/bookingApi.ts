import { apiClient } from '../client';

/**
 * API dla rezerwacji (bookings)
 * Endpoint: /api/v1/bookings
 */

export interface CreateBookingRequest {
  provider_id: number;
  service_id: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time?: string;
  duration_minutes?: number;
  service_address: string;
  latitude?: number;
  longitude?: number;
  customer_notes?: string;
  special_requirements?: string;
}

export interface Booking {
  id: number;
  uuid: string;
  booking_number: string;
  customer_id: number;
  provider_id: number;
  service_id: number;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  service_address: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  service_price: number;
  travel_fee: number;
  platform_fee: number;
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method: 'cash' | 'card' | 'transfer' | 'online' | null;
  paid_at: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'disputed';
  cancelled_by: number | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  customer_notes: string | null;
  provider_notes: string | null;
  admin_notes: string | null;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  customer_reviewed: boolean;
  provider_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export interface BookingsListResponse {
  success: boolean;
  data: Booking[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Tworzy nową rezerwację (Instant Booking)
 */
export async function createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
  const response = await apiClient.post<BookingResponse>('/bookings', data);
  return response.data;
}

/**
 * Pobiera listę rezerwacji
 * @param filters - Filtry: customer_id, provider_id, status, etc.
 */
export async function getBookings(filters?: {
  customer_id?: number;
  provider_id?: number;
  status?: string;
  page?: number;
}): Promise<BookingsListResponse> {
  const response = await apiClient.get<BookingsListResponse>('/bookings', {
    params: filters,
  });
  return response.data;
}

/**
 * Pobiera szczegóły pojedynczej rezerwacji
 */
export async function getBooking(id: number): Promise<BookingResponse> {
  const response = await apiClient.get<BookingResponse>(`/bookings/${id}`);
  return response.data;
}

/**
 * Anuluje rezerwację
 */
export async function cancelBooking(
  id: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/bookings/${id}/cancel`, { reason });
  return response.data;
}
