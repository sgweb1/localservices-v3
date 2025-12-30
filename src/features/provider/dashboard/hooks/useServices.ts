import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/utils/apiHelpers';

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
  const authToken = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/provider/services`, {
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return MOCK_SUBPAGES.services;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const payload = await res.json();
  // Backend zwraca kolekcję (data + meta). Mapujemy do frontowego kształtu.
  const services = Array.isArray(payload.data) ? payload.data : [];
  const mapped: Service[] = services.map((s: any) => ({
    id: s.id,
    name: s.title ?? s.name ?? 'Usługa',
    category: s.category?.name ?? s.category_id ?? 'kategoria',
    price: s.base_price ? `${s.base_price} zł` : '—',
    status: s.status === 'active' ? 'active' : 'inactive',
  }));

  const counts = mapped.reduce(
    (acc, s) => {
      if (s.status === 'active') acc.active += 1;
      else acc.inactive += 1;
      return acc;
    },
    { active: 0, inactive: 0 }
  );

  return { data: mapped, counts };
};

export const useServices = () => {
  return useQuery<ServicesResponse, Error>({
    queryKey: ['provider', 'services'],
    queryFn: fetchServices,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
