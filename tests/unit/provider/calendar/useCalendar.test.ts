/**
 * Testy dla useCalendar hook
 * 
 * Testuje:
 * - Pobieranie slotów kalendarza
 * - Tworzenie nowych slotów (single + recurring)
 * - Aktualizację slotów (włączanie/wyłączanie)
 * - Usuwanie slotów
 * - Obliczanie statystyk
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCalendar, useCreateSlot, useUpdateSlot, useDeleteSlot, useGlobalCalendarStats } from '@/features/provider/calendar/hooks/useCalendar';
import { apiClient } from '@/api/client';

// Mock API client
vi.mock('@/api/client');

describe('useCalendar', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
    vi.clearAllMocks();
  });

  describe('useCalendar - pobieranie danych', () => {
    it('pobiera sloty i rezerwacje dla podanego zakresu dat', async () => {
      const mockData = {
        slots: [
          {
            id: 1,
            day_of_week: 1,
            day_name: 'Poniedziałek',
            start_time: '09:00',
            end_time: '17:00',
            max_bookings: 10,
            current_bookings: 3,
            is_available: true,
          },
        ],
        bookings: [
          {
            id: 1,
            booking_date: '2025-01-06',
            day_of_week: 1,
            start_time: '09:00',
            end_time: '10:00',
            customer_name: 'Jan Kowalski',
            service_name: 'Hydraulik',
            status: 'confirmed' as const,
            duration_minutes: 60,
          },
        ],
        date_range: {
          start: '2025-01-06',
          end: '2025-01-12',
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCalendar('2025-01-06', '2025-01-12'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/provider/calendar?start_date=2025-01-06&end_date=2025-01-12');
      expect(result.current.data).toEqual(mockData);
      expect(result.current.data?.slots).toHaveLength(1);
      expect(result.current.data?.bookings).toHaveLength(1);
    });

    it('zwraca error gdy API zwróci błąd', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useCalendar('2025-01-06', '2025-01-12'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCreateSlot - tworzenie slotów', () => {
    it('tworzy pojedynczy slot', async () => {
      const newSlot = {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        max_bookings: 10,
      };

      const createdSlot = { id: 1, ...newSlot, day_name: 'Poniedziałek', current_bookings: 0, is_available: true };
      vi.mocked(apiClient.post).mockResolvedValue({ data: createdSlot });

      const { result } = renderHook(() => useCreateSlot(), { wrapper });

      await result.current.mutateAsync(newSlot);

      expect(apiClient.post).toHaveBeenCalledWith('/provider/calendar/slots', newSlot);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('invaliduje cache po utworzeniu slotu', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const newSlot = {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        max_bookings: 10,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1, ...newSlot } });

      const { result } = renderHook(() => useCreateSlot(), { wrapper });
      await result.current.mutateAsync(newSlot);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['provider', 'calendar'] });
      });
    });
  });

  describe('useUpdateSlot - aktualizacja slotów', () => {
    it('aktualizuje dostępność slotu', async () => {
      const updatedSlot = {
        id: 1,
        day_of_week: 1,
        day_name: 'Poniedziałek',
        start_time: '09:00',
        end_time: '17:00',
        max_bookings: 10,
        current_bookings: 0,
        is_available: false, // Wyłączony
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedSlot });

      const { result } = renderHook(() => useUpdateSlot(), { wrapper });

      await result.current.mutateAsync({
        id: 1,
        data: { is_available: false },
      });

      expect(apiClient.put).toHaveBeenCalledWith('/provider/calendar/slots/1', {
        is_available: false,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useDeleteSlot - usuwanie slotów', () => {
    it('usuwa slot', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const { result } = renderHook(() => useDeleteSlot(), { wrapper });

      await result.current.mutateAsync(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/provider/calendar/slots/1');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('invaliduje cache po usunięciu', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const { result } = renderHook(() => useDeleteSlot(), { wrapper });
      await result.current.mutateAsync(1);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['provider', 'calendar'] });
      });
    });
  });

  describe('useGlobalCalendarStats - globalne statystyki', () => {
    it('pobiera globalne statystyki wszystkich slotów', async () => {
      const mockGlobalData = {
        slots: [
          { id: 1, day_of_week: 1, start_time: '09:00', end_time: '17:00', max_bookings: 10, current_bookings: 3, is_available: true, day_name: 'Pon' },
          { id: 2, day_of_week: 2, start_time: '09:00', end_time: '17:00', max_bookings: 10, current_bookings: 5, is_available: true, day_name: 'Wt' },
        ],
        bookings: [
          { id: 1, booking_date: '2025-01-06', day_of_week: 1, start_time: '09:00', end_time: '10:00', customer_name: 'Jan', service_name: 'Hydraulik', status: 'confirmed' as const, duration_minutes: 60 },
          { id: 2, booking_date: '2025-01-07', day_of_week: 2, start_time: '09:00', end_time: '10:00', customer_name: 'Anna', service_name: 'Hydraulik', status: 'pending' as const, duration_minutes: 60 },
        ],
        date_range: {
          start: '2025-01-01',
          end: '2025-12-31',
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockGlobalData });

      const { result } = renderHook(() => useGlobalCalendarStats(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/provider/calendar');
      expect(result.current.data?.slots).toHaveLength(2);
      expect(result.current.data?.bookings).toHaveLength(2);
    });
  });
});
