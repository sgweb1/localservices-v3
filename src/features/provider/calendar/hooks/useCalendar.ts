import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

/**
 * useCalendar - Hook do zarządzania kalendarzem providera
 * 
 * Endpoints:
 * - GET /provider/calendar - pobiera sloty i rezerwacje
 * - POST /provider/calendar/slots - dodaje slot
 * - PUT /provider/calendar/slots/{id} - edytuje slot
 * - DELETE /provider/calendar/slots/{id} - usuwa slot
 */

export interface TimeSlot {
  id: number;
  day_of_week: number; // 1-7 (1=poniedziałek)
  day_name: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_time_start?: string;
  break_time_end?: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
}

export interface CalendarBooking {
  id: number;
  booking_date: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  customer_name: string;
  service_name: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  duration_minutes: number;
}

export interface CalendarData {
  slots: TimeSlot[];
  bookings: CalendarBooking[];
  date_range: {
    start: string;
    end: string;
  };
}

export interface CreateSlotData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_bookings?: number;
  break_time_start?: string;
  break_time_end?: string;
}

export interface UpdateSlotData {
  start_time?: string;
  end_time?: string;
  max_bookings?: number;
  is_available?: boolean;
  break_time_start?: string;
  break_time_end?: string;
}

/**
 * Hook do pobierania kalendarza providera dla zadanego zakresu dat
 * 
 * **Zwraca:**
 * - slots: TimeSlot[] - lista slotów dostępności
 * - bookings: CalendarBooking[] - lista rezerwacji
 * - date_range: { start, end } - zakres dat
 * 
 * **Przykład:**
 * ```typescript
 * // Pobierz dane dla tygodnia 6-12 stycznia
 * const { data, isLoading } = useCalendar('2025-01-06', '2025-01-12');
 * 
 * if (isLoading) return <Skeleton />;
 * 
 * // Wyświetl sloty i rezerwacje
 * data.slots.map(slot => <SlotCard slot={slot} />)
 * ```
 * 
 * @param startDate - Data początkowa w formacie YYYY-MM-DD (opcjonalne)
 * @param endDate - Data końcowa w formacie YYYY-MM-DD (opcjonalne)
 * @returns UseQueryResult<CalendarData> - React Query result object
 */
export function useCalendar(startDate?: string, endDate?: string) {
  return useQuery<CalendarData>({
    queryKey: ['provider', 'calendar', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await apiClient.get(`/provider/calendar?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 sekund
    refetchInterval: 60000, // Odśwież co minutę
  });
}

/**
 * Hook do pobierania globalnych statystyk kalendarza
 * 
 * **Różnica vs useCalendar:**
 * - useCalendar: pobiera dane dla konkretnego zakresu dat (tydzień)
 * - useGlobalCalendarStats: pobiera WSZYSTKIE sloty i rezerwacje providera
 * 
 * **Zastosowanie:**
 * - Wyświetlanie ogólnych statystyk (ile łącznie slotów, rezerwacji)
 * - Obliczanie średniego zapełnienia
 * - Porównanie z statystykami tygodnia
 * 
 * **Cache Strategy:**
 * - staleTime: 60s (dane ważne minutę)
 * - refetchInterval: 120s (auto-refetch co 2 minuty)
 * 
 * **Przykład:**
 * ```typescript
 * const { data: globalData } = useGlobalCalendarStats();
 * 
 * const totalSlots = globalData.slots.length;
 * const totalBookings = globalData.bookings.length;
 * const fillRate = (totalBookings / totalSlots) * 100;
 * ```
 * 
 * @returns UseQueryResult<CalendarData> - Wszystkie sloty i rezerwacje
 */
export function useGlobalCalendarStats() {
  return useQuery<CalendarData>({
    queryKey: ['provider', 'calendar', 'global-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/provider/calendar');
      return response.data;
    },
    staleTime: 60000, // 1 minuta
    refetchInterval: 120000, // Odśwież co 2 minuty
  });
}

/**
 * Hook do dodawania nowego slotu dostępności
 * 
 * **Mutacja:** POST /provider/calendar/slots
 * 
 * **Automatyczne akcje po sukcesie:**
 * - Invaliduje cache kalendarza (wymusza refetch)
 * - Aktualizuje wszystkie komponenty używające useCalendar()
 * 
 * **Przykład - dodanie pojedynczego slotu:**
 * ```typescript
 * const createSlot = useCreateSlot();
 * 
 * await createSlot.mutateAsync({
 *   day_of_week: 1, // Poniedziałek
 *   start_time: '09:00',
 *   end_time: '17:00',
 *   max_bookings: 10,
 * });
 * ```
 * 
 * **Przykład - dodanie recurring slotów (każdy dzień tygodnia):**
 * ```typescript
 * const days = [1, 2, 3, 4, 5]; // Pon-Pt
 * for (const day of days) {
 *   await createSlot.mutateAsync({
 *     day_of_week: day,
 *     start_time: '09:00',
 *     end_time: '17:00',
 *     max_bookings: 10,
 *   });
 * }
 * ```
 * 
 * @returns UseMutationResult - React Query mutation object
 */
export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSlotData) => {
      const response = await apiClient.post('/provider/calendar/slots', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'calendar'] });
    },
  });
}

/**
 * Hook do aktualizacji istniejącego slotu
 * 
 * **Mutacja:** PUT /provider/calendar/slots/{id}
 * 
 * **Typowe przypadki użycia:**
 * - Włączanie/wyłączanie slotu (is_available)
 * - Zmiana godzin (start_time, end_time)
 * - Zmiana limitu rezerwacji (max_bookings)
 * - Dodanie/usunięcie przerwy (break_time_start, break_time_end)
 * 
 * **Przykład - wyłączenie slotu:**
 * ```typescript
 * const updateSlot = useUpdateSlot();
 * 
 * await updateSlot.mutateAsync({
 *   id: 123,
 *   data: { is_available: false },
 * });
 * ```
 * 
 * **Przykład - zmiana godzin:**
 * ```typescript
 * await updateSlot.mutateAsync({
 *   id: 123,
 *   data: {
 *     start_time: '10:00',
 *     end_time: '18:00',
 *   },
 * });
 * ```
 * 
 * @returns UseMutationResult - React Query mutation object
 */
export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSlotData }) => {
      const response = await apiClient.put(`/provider/calendar/slots/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'calendar'] });
    },
  });
}

/**
 * Hook do usuwania slotu dostępności
 * 
 * **Mutacja:** DELETE /provider/calendar/slots/{id}
 * 
 * **Ważne ograniczenia:**
 * - Nie można usunąć slotu z aktywnymi rezerwacjami (status: confirmed/pending)
 * - Backend zwróci błąd 400 jeśli slot ma rezerwacje
 * - Należy najpierw odwołać wszystkie rezerwacje
 * 
 * **Error Handling:**
 * - 400: "Cannot delete slot with active bookings"
 * - 404: "Slot not found"
 * - 403: "Unauthorized" (nie twój slot)
 * 
 * **Przykład z potwierdzeniem:**
 * ```typescript
 * const deleteSlot = useDeleteSlot();
 * const { confirm } = useConfirm();
 * 
 * const handleDelete = async (slotId: number) => {
 *   const ok = await confirm({
 *     title: 'Usuń slot',
 *     message: 'Czy na pewno chcesz usunąć ten slot?',
 *     variant: 'danger',
 *   });
 *   
 *   if (ok) {
 *     try {
 *       await deleteSlot.mutateAsync(slotId);
 *       toast.success('Slot usunięty');
 *     } catch (error) {
 *       toast.error('Nie można usunąć slotu z aktywnymi rezerwacjami');
 *     }
 *   }
 * };
 * ```
 * 
 * @returns UseMutationResult - React Query mutation object
 */
export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/provider/calendar/slots/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'calendar'] });
    },
  });
}
