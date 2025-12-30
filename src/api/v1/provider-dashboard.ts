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
 * Pobiera widgety dashboardu providera
 * 
 * Opcjonalne parametry optymalizacyjne:
 * - fields: array konkretnych widgetów do pobrania ('pipeline', 'performance', 'insights', 'messages')
 * 
 * Wymaga: auth:sanctum (cookies)
 * Cache: 60s (zarządzane przez React Query w hooku)
 * 
 * Optymalizacja: jeśli podasz fields, server zwróci tylko żądane widgety
 * (pomija N+1 queries dla nieużywanych widgetów)
 */
export async function fetchDashboardWidgets(options?: {
  fields?: string[];
}): Promise<DashboardWidgetsResponse> {
  const authToken = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  // DEV: wspieraj MockAuthMiddleware przez Bearer dev_mock_* token
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Buduj URL z optional fields parameter
  const url = new URL(`${API_BASE_URL}/api/v1/provider/dashboard/widgets`, window.location.origin);
  if (options?.fields && options.fields.length > 0) {
    url.searchParams.set('fields', options.fields.join(','));
  }

  const response = await fetch(url.toString(), {
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
