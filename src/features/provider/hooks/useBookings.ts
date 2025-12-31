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
  meta?: { 
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  pagination?: { 
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  counts?: { 
    total: number;
    pending: number; 
    confirmed: number; 
    completed: number;
    cancelled: number;
  };
  overdueConfirmedCount?: number; // przeterminowane potwierdzone
  canManage?: boolean; // pełny dostęp do zarządzania
  showUpsell?: boolean; // czy pokazać banner upsell
  hasBookings?: boolean; // czy są jakiekolwiek rezerwacje
  showTrialInfo?: boolean; // czy pokazać banner trial
  trialDays?: number; // ile dni trial
  maxBookingDate?: string; // max data dostępna w trial (YYYY-MM-DD)
}

/**
 * Fetch provider bookings from API
 * 
 * GET /provider/bookings?page={page}&per_page={perPage}&hidden={hidden}
 * 
 * @param page - Numer strony (domyślnie 1)
 * @param perPage - Rezerwacje na stronę (domyślnie 15)
 * @param hidden - Filtr ukrytych rezerwacji: 'visible' | 'hidden' | 'all' (domyślnie 'visible')
 * @returns Promise z listą rezerwacji i metadanymi
 */
async function fetchBookings(
  page: number = 1, 
  perPage: number = 15,
  hidden: 'visible' | 'hidden' | 'all' = 'visible'
): Promise<BookingListResponse> {
  try {
    console.log('[fetchBookings] Fetching page:', page, 'perPage:', perPage, 'hidden:', hidden);
    const response = await apiClient.get('/provider/bookings', {
      params: { page, per_page: perPage, hidden }
    });
    console.log('[fetchBookings] Response:', response.data);
    
    // Normalize API response to BookingListResponse format
    const apiData = response.data;
    const meta = apiData.meta || apiData.pagination;
    
    // Transform data items to expected format
    const transformedData: BookingListItem[] = (apiData.data || []).map((item: any) => ({
      id: item.id,
      customerName: item.customer_name || item.customerName || item.customer?.name || 'Klient',
      customerId: item.customer_id || item.customerId,
      serviceName: item.service_name || item.serviceName || item.service?.title || 'Usługa',
      bookingNumber: item.booking_number || item.bookingNumber,
      bookingDate: item.booking_date || item.bookingDate,
      startTime: item.start_time || item.startTime,
      endTime: item.end_time || item.endTime,
      durationMinutes: item.duration_minutes || item.durationMinutes,
      serviceAddress: item.service_address || item.serviceAddress,
      customerNotes: item.customer_notes || item.customerNotes,
      servicePrice: item.service_price || item.servicePrice,
      totalPrice: item.total_price || item.totalPrice,
      paymentStatus: item.payment_status || item.paymentStatus,
      status: item.status,
      hasConflict: item.hasConflict || false,
      canAccess: item.canAccess !== false,
      isHidden: item.isHidden || false,
    } as BookingListItem));

    // Calculate counts from data
    const counts = apiData.counts || {
      total: meta?.total || transformedData.length,
      pending: transformedData.filter((b: any) => b.status === 'pending').length,
      confirmed: transformedData.filter((b: any) => b.status === 'confirmed').length,
      completed: transformedData.filter((b: any) => b.status === 'completed').length,
      cancelled: transformedData.filter((b: any) => b.status === 'cancelled').length,
    };

    return {
      data: transformedData,
      meta: meta ? {
        current_page: meta.current_page,
        last_page: meta.last_page,
        per_page: meta.per_page,
        total: meta.total,
        from: meta.from,
        to: meta.to,
      } : undefined,
      pagination: meta ? {
        current_page: meta.current_page,
        last_page: meta.last_page,
        per_page: meta.per_page,
        total: meta.total,
        from: meta.from,
        to: meta.to,
      } : undefined,
      counts,
      overdueConfirmedCount: apiData.overdueConfirmedCount || 0,
      canManage: apiData.canManage !== false ? true : false,
      showUpsell: apiData.showUpsell || false,
      hasBookings: (meta?.total || 0) > 0,
      showTrialInfo: apiData.showTrialInfo || false,
      trialDays: apiData.trialDays,
      maxBookingDate: apiData.maxBookingDate,
    };
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
 * @param hidden - Filtr ukrytych rezerwacji: 'visible' | 'hidden' | 'all'
 * @returns Object z danymi, loading, error
 * 
 * @example
 * const { data, isLoading, error } = useBookings(1, 15, 'visible');
 * const items = data?.data ?? [];
 */
export function useBookings(
  page: number = 1, 
  perPage: number = 15,
  hidden: 'visible' | 'hidden' | 'all' = 'visible'
) {
  console.log('[useBookings] Hook called with page:', page, 'perPage:', perPage, 'hidden:', hidden);
  return useQuery({
    queryKey: ['provider','bookings', page, perPage, hidden],
    queryFn: () => fetchBookings(page, perPage, hidden),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
