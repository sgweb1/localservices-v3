import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

/**
 * Możliwe statusy rezerwacji w systemie
 * 
 * - pending: Nowa rezerwacja, czekająca na akceptację
 * - confirmed: Zaakceptowana, przydzielona do providera
 * - completed: Ukończona
 * - cancelled: Anulowana
 * - rejected: Odrzucona przez providera
 */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

/**
 * Pojedyncza rezerwacja na liście
 * 
 * Zawiera informacje podstawowe o rezerwacji,
 * adres usługi, ceny i status
 */
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
  isHidden?: boolean; // czy rezerwacja jest ukryta dla providera
}

/**
 * Odpowiedź z API dla listy rezerwacji providera
 * 
 * Zawiera listę rezerwacji, paginację, statystyki i informacje o dostępie
 */
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

/**
 * Fetch provider bookings from API
 * 
 * GET /provider/bookings?page={page}&per_page={perPage}
 * 
 * @param page - Numer strony (domyślnie 1)
 * @param perPage - Rezerwacje na stronę (domyślnie 15)
 * @returns Promise z listą rezerwacji i metadanymi
 */
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

/**
 * React Query hook do pobierania rezerwacji providera
 * 
 * Automatycznie cachuje dane, refetch przy focus na oknie,
 * refetch co 60 sekund
 * 
 * @param page - Numer strony rezerwacji
 * @param perPage - Liczba rezerwacji na stronę
 * @returns Object z danymi, loading, error
 * 
 * @example
 * const { data, isLoading, error } = useBookings(1, 15);
 * const items = data?.data ?? [];
 */
export function useBookings(page: number = 1, perPage: number = 15) {
  console.log('[useBookings] Hook called with page:', page, 'perPage:', perPage);
  return useQuery({
    queryKey: ['provider','bookings', page, perPage],
    queryFn: () => fetchBookings(page, perPage),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
