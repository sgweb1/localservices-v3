import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

/**
 * Hook do pobierania metryk dashboardu
 */
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/provider/dashboard/metrics');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minut
  });
};

/**
 * Hook do pobierania ostatnich rezerwacji
 */
export const useRecentBookings = (limit = 5) => {
  return useQuery<{ data: any[] }>({
    queryKey: ['dashboard', 'bookings', limit],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/provider/dashboard/bookings?limit=${limit}&sort=-created_at`);
      return { data: response.data?.data || [] };
    },
    // Używaj global defaults (60s staleTime, no refetchOnWindowFocus, refetchOnMount: false)
    // aby deduplikować requesty z innymi komponentami
  });
};

/**
 * Hook do pobierania ostatnich wiadomości
 */
export const useRecentMessages = (limit = 5) => {
  return useQuery<{ data: any[] }>({
    queryKey: ['dashboard', 'messages', limit],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/provider/dashboard/conversations?limit=${limit}&sort=-updated_at`);
      return { data: response.data?.data || [] };
    },
    // Używaj global defaults
  });
};

/**
 * Hook do pobierania recenzji
 */
export const useRecentReviews = (limit = 5) => {
  return useQuery<{ data: any[] }>({
    queryKey: ['dashboard', 'reviews', limit],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/provider/dashboard/reviews?limit=${limit}&sort=-created_at`);
      return { data: response.data?.data || [] };
    },
    // Używaj global defaults
  });
};

/**
 * Hook do pobierania performance provider'a
 */
export const useProviderPerformance = () => {
  return useQuery<any>({
    queryKey: ['dashboard', 'performance'],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/provider/dashboard/performance`);
      return response.data;
    },
  });
};
