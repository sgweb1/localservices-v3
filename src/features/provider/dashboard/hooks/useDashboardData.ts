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
  return useQuery({
    queryKey: ['dashboard', 'bookings', limit],
    queryFn: async () => {
      const response = await apiGet(`/bookings?limit=${limit}&sort=-created_at`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook do pobierania ostatnich wiadomości
 */
export const useRecentMessages = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'messages', limit],
    queryFn: async () => {
      const response = await apiGet(`/conversations?limit=${limit}&sort=-updated_at`);
      return response.json();
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook do pobierania wydajności providera (analytics)
 */
export const useProviderPerformance = () => {
  return useQuery({
    queryKey: ['dashboard', 'performance'],
    queryFn: async () => {
      const response = await apiGet('/provider/performance');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook do pobierania recenzji
 */
export const useRecentReviews = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'reviews', limit],
    queryFn: async () => {
      const response = await apiGet(`/reviews?limit=${limit}&sort=-created_at`);
      return response.json();
    },
    staleTime: 15 * 60 * 1000,
  });
};
