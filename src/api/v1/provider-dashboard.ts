/**
 * API Client dla Provider Dashboard
 * 
 * Endpoint: GET /api/v1/provider/dashboard/widgets
 */

import { DashboardWidgetsResponse } from '@/features/provider/dashboard/types';
import { getAuthToken } from '@/utils/apiHelpers';

const API_BASE_URL = import.meta.env.DEV
  ? '' // DEV: same-origin via Vite proxy
  : (import.meta.env.VITE_API_BASE_URL || '');

/**
 * Pobiera wszystkie widgety dashboardu providera
 * 
 * Wymaga: auth:sanctum (cookies)
 * Cache: 60s (zarządzane przez React Query w hooku)
 */
export async function fetchDashboardWidgets(): Promise<DashboardWidgetsResponse> {
  const authToken = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  // DEV: wspieraj MockAuthMiddleware przez Bearer dev_mock_* token
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/provider/dashboard/widgets`, {
    method: 'GET',
    headers,
    credentials: 'include', // Sanctum session cookies
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
