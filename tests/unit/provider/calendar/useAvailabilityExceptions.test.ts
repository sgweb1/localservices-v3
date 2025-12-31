/**
 * Testy dla useAvailabilityExceptions hook
 * 
 * Testuje:
 * - Pobieranie wyjątków (urlopy, blokady dat)
 * - Tworzenie nowych wyjątków
 * - Aktualizację wyjątków
 * - Usuwanie wyjątków
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAvailabilityExceptions,
  useCreateException,
  useUpdateException,
  useDeleteException,
} from '@/features/provider/calendar/hooks/useAvailabilityExceptions';
import { apiClient } from '@/api/client';

vi.mock('@/api/client');

describe('useAvailabilityExceptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useAvailabilityExceptions - pobieranie wyjątków', () => {
    it('pobiera listę wyjątków (urlopy, blokady)', async () => {
      const mockExceptions = [
        {
          id: 1,
          type: 'vacation',
          start_date: '2025-02-01',
          end_date: '2025-02-07',
          reason: 'Urlop zimowy',
        },
        {
          id: 2,
          type: 'block',
          start_date: '2025-03-15',
          end_date: '2025-03-15',
          reason: 'Konserwacja sprzętu',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockExceptions });

      const { result } = renderHook(() => useAvailabilityExceptions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/provider/calendar/exceptions');
      expect(result.current.data).toEqual(mockExceptions);
      expect(result.current.data).toHaveLength(2);
    });

    it('zwraca pustą tablicę gdy brak wyjątków', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useAvailabilityExceptions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCreateException - tworzenie wyjątków', () => {
    it('tworzy nowy urlop (vacation)', async () => {
      const newException = {
        type: 'vacation' as const,
        start_date: '2025-06-01',
        end_date: '2025-06-14',
        reason: 'Urlop letni',
      };

      const createdException = { id: 1, ...newException };
      vi.mocked(apiClient.post).mockResolvedValue({ data: createdException });

      const { result } = renderHook(() => useCreateException(), { wrapper });

      await result.current.mutateAsync(newException);

      expect(apiClient.post).toHaveBeenCalledWith('/provider/calendar/exceptions', newException);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('tworzy blokadę pojedynczej daty', async () => {
      const newException = {
        type: 'block' as const,
        start_date: '2025-05-01',
        end_date: '2025-05-01',
        reason: 'Święto państwowe',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 2, ...newException } });

      const { result } = renderHook(() => useCreateException(), { wrapper });

      await result.current.mutateAsync(newException);

      expect(apiClient.post).toHaveBeenCalledWith('/provider/calendar/exceptions', newException);
    });

    it('invaliduje cache po utworzeniu wyjątku', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const newException = {
        type: 'vacation' as const,
        start_date: '2025-08-01',
        end_date: '2025-08-07',
        reason: 'Urlop',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1, ...newException } });

      const { result } = renderHook(() => useCreateException(), { wrapper });
      await result.current.mutateAsync(newException);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['availability-exceptions'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['calendar'] });
      });
    });
  });

  describe('useUpdateException - aktualizacja wyjątków', () => {
    it('aktualizuje istniejący wyjątek', async () => {
      const updatedData = {
        start_date: '2025-06-05',
        end_date: '2025-06-15',
        reason: 'Urlop letni (zmieniony)',
      };

      const updatedException = { id: 1, type: 'vacation' as const, ...updatedData };
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedException });

      const { result } = renderHook(() => useUpdateException(), { wrapper });

      await result.current.mutateAsync({ id: 1, data: updatedData });

      expect(apiClient.put).toHaveBeenCalledWith('/provider/calendar/exceptions/1', updatedData);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useDeleteException - usuwanie wyjątków', () => {
    it('usuwa wyjątek', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const { result } = renderHook(() => useDeleteException(), { wrapper });

      await result.current.mutateAsync(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/provider/calendar/exceptions/1');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('invaliduje cache po usunięciu', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const { result } = renderHook(() => useDeleteException(), { wrapper });
      await result.current.mutateAsync(1);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['availability-exceptions'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['calendar'] });
      });
    });
  });
});
