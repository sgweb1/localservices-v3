/**
 * React Query hook dla Provider Dashboard widgets
 * 
 * Obsługuje:
 * - Fetch danych z API
 * - Cache 60s (identyczne z LocalServices)
 * - Auto refetch przy focus
 * - Loading/error states
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { DashboardWidgets } from '../types';

/**
 * Hook do pobierania widgetów dashboardu providera
 * 
 * Optymalizacja: pobiera tylko widgety potrzebne dla dashboard page
 * (pipeline, performance, insights, messages) aby zmniejszyć load time
 * 
 * Cache: 60s (staleTime), zgodnie z LocalServices
 * Refetch: przy focus window, co 5 minut w tle
 */
export function useDashboardWidgets(): UseQueryResult<DashboardWidgets, Error> {
  return useQuery({
    queryKey: ['provider', 'dashboard', 'widgets'],
    queryFn: async () => {
      // Optymalizacja: pobiera tylko widgety używane na stronie głównej dashboardu
      // Pominięte: plan, addons, tasks, calendar, notifications, services, live_activity
      // Efekt: zmniejsza load time poprzez pominięcie N+1 queries dla nieużywanych widgetów
      const response = await apiClient.get<DashboardWidgets>('/provider/dashboard/widgets', {
        params: {
          fields: ['pipeline', 'performance', 'insights', 'messages', 'stats'].join(',')
        }
      });
      return response.data;
    },
    // Cache 60s jak w LocalServices
    staleTime: 60 * 1000, // 60 sekund
    // Refetch co 5 minut w tle (jeśli ktoś ma dashboard otwarty)
    refetchInterval: 5 * 60 * 1000, // 5 minut
    // Nie refetch przy powrocie do okna (unikamy duplicate requestów)
    refetchOnWindowFocus: false,
    // Nie refetch przy mount (używamy cache)
    refetchOnMount: false,
    // Retry 2x przy błędzie
    retry: 2,
  });
}

/**
 * Hook do wymuszenia refresh widgetów (manual invalidate)
 * 
 * Użycie: np. po zmianie subskrypcji, dodaniu usługi, etc.
 */
export function useDashboardRefresh() {
  const { refetch } = useDashboardWidgets();
  
  return {
    refresh: () => refetch(),
  };
}
