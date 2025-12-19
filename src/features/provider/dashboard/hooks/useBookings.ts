import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { bookings as mockBookings } from '../mocks/subpages';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingListItem {
  id: number;
  customerName: string;
  serviceName: string;
  date: string; // ISO or human
  status: BookingStatus;
}

export interface BookingListResponse {
  data: BookingListItem[];
  meta?: { page?: number; total?: number; per_page?: number };
  counts?: { pending: number; confirmed: number; completed: number };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchBookings(): Promise<BookingListResponse> {
  if (isMockMode()) {
    return { data: mockBookings };
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/provider/bookings`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // Fallback do mock w DEV przy błędzie
    if (import.meta.env.DEV) return { data: mockBookings };
    throw new Error(`Bookings API error: ${res.status}`);
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
