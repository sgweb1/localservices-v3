import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface BookingListItem {
  id: number;
  customerName: string;
  customerId?: number;
  serviceName: string;
  bookingNumber?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM:SS
  endTime?: string; // HH:MM:SS
  durationMinutes?: number;
  serviceAddress?: {
    street?: string;
    postalCode?: string;
    city?: string;
  };
  customerNotes?: string;
  servicePrice?: number;
  totalPrice?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status: BookingStatus;
  hasConflict?: boolean;
  canAccess?: boolean; // czy user ma dostęp (subscription/trial)
}

export interface BookingListResponse {
  data: BookingListItem[];
  pagination?: { 
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  counts: { 
    total: number;
    pending: number; 
    confirmed: number; 
    completed: number;
    cancelled: number;
  };
  overdueConfirmedCount?: number; // przeterminowane potwierdzone
  canManage: boolean; // pełny dostęp do zarządzania
  showUpsell: boolean; // czy pokazać banner upsell
  hasBookings: boolean; // czy są jakiekolwiek rezerwacje
  showTrialInfo: boolean; // czy pokazać banner trial
  trialDays?: number; // ile dni trial
  maxBookingDate?: string; // max data dostępna w trial (YYYY-MM-DD)
}

async function fetchBookings(page: number = 1, perPage: number = 15): Promise<BookingListResponse> {
  try {
    console.log('[fetchBookings] Fetching page:', page, 'perPage:', perPage);
    const response = await apiClient.get('/provider/bookings', {
      params: { page, per_page: perPage }
    });
    console.log('[fetchBookings] Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[useBookings] API Error:', error.response?.status, error);
    throw error;
  }
}

export function useBookings(page: number = 1, perPage: number = 15) {
  console.log('[useBookings] Hook called with page:', page, 'perPage:', perPage);
  return useQuery({
    queryKey: ['provider','bookings', page, perPage],
    queryFn: () => fetchBookings(page, perPage),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
