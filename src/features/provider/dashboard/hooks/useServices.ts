import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

export interface Service {
  id: number;
  name: string;
  category: string;
  price: string;
  status: 'active' | 'inactive';
}

export interface ServicesResponse {
  data: Service[];
  counts: {
    active: number;
    inactive: number;
  };
}

const fetchServices = async (): Promise<ServicesResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/services`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status >= 500)) {
      return MOCK_SUBPAGES.services;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

export const useServices = () => {
  return useQuery<ServicesResponse, Error>({
    queryKey: ['provider', 'services'],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return MOCK_SUBPAGES.services;
      }
      return fetchServices();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
