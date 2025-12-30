import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/utils/apiHelpers';

/**
 * Hook do pobierania metryk dashboardu
 */
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await apiGet('/provider/dashboard/metrics');
      return response.json();
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
      const response = await apiGet(`/provider/dashboard/bookings?limit=${limit}&sort=-created_at`);
      const data = await response.json();
      return { data: data?.data || [] };
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
      const response = await apiGet(`/provider/dashboard/conversations?limit=${limit}&sort=-updated_at`);
      const data = await response.json();
      return { data: data?.data || [] };
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
      const response = await apiGet(`/provider/dashboard/reviews?limit=${limit}&sort=-created_at`);
      const data = await response.json();
      return { data: data?.data || [] };
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
      const response = await apiGet(`/provider/dashboard/performance`);
      const data = await response.json();
      return data;
    },
  });
};
