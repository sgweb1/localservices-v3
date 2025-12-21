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
 * Hook do pobierania kalendarza
 */
export function useCalendar() {
  return useQuery<CalendarData>({
    queryKey: ['provider', 'calendar'],
    queryFn: async () => {
      const response = await apiClient.get('/provider/calendar');
      return response.data;
    },
    staleTime: 30000, // 30 sekund
    refetchInterval: 60000, // Odśwież co minutę
  });
}

/**
 * Hook do dodawania slotu
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
 * Hook do edycji slotu
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
 * Hook do usuwania slotu
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
