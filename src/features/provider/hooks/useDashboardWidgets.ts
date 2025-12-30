/**
 * React Query hook dla Provider Dashboard widgets
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { DashboardWidgets } from '../dashboard/types';

export function useDashboardWidgets(): UseQueryResult<DashboardWidgets, Error> {
  return useQuery({
    queryKey: ['provider', 'dashboard', 'widgets'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardWidgets>('/api/v1/provider/dashboard/widgets', {
        params: {
          fields: ['pipeline', 'performance', 'insights', 'messages'].join(',')
        }
      });
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

export function useDashboardRefresh() {
  const { refetch } = useDashboardWidgets();
  return {
    refresh: () => refetch(),
  };
}
