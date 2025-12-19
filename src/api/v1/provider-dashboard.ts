/**
 * API Client dla Provider Dashboard
 * 
 * Endpoint: GET /api/v1/provider/dashboard/widgets
 */

import { DashboardWidgetsResponse } from '@/features/provider/dashboard/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Pobiera wszystkie widgety dashboardu providera
 * 
 * Wymaga: auth:sanctum (cookies)
 * Cache: 60s (zarządzane przez React Query w hooku)
 */
export async function fetchDashboardWidgets(): Promise<DashboardWidgetsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provider/dashboard/widgets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // ważne dla Sanctum cookies
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Tylko providery mają dostęp do dashboardu');
    }
    if (response.status === 401) {
      throw new Error('Musisz być zalogowany');
    }
    throw new Error(`Błąd API: ${response.status}`);
  }

  return response.json();
}

/**
 * Provider Dashboard Client
 * 
 * Eksportowany obiekt z metodami API dla dashboardu
 */
export const ProviderDashboardClient = {
  /**
   * Pobiera wszystkie widgety dashboardu
   */
  getWidgets: fetchDashboardWidgets,
} as const;
