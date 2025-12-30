import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

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
  const response = await apiClient.get<{ data: any[] }>('/provider/services');
  const payload = response.data;
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
