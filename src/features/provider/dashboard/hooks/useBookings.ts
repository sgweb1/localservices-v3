import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

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
  meta?: { 
    page?: number; 
    total?: number; 
    per_page?: number;
    last_page?: number;
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchBookings(): Promise<BookingListResponse> {
  if (isMockMode()) {
    return MOCK_SUBPAGES.bookings;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/provider/bookings`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return MOCK_SUBPAGES.bookings;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export function useBookings() {
  return useQuery({
    queryKey: ['provider','bookings'],
    queryFn: fetchBookings,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
