import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

export interface ServiceDetail {
  id: number;
  title: string;
  description: string;
  category_id?: number;
  base_price?: number;
  pricing_type?: 'hourly' | 'fixed' | 'quote';
  price_range_low?: number | null;
  price_range_high?: number | null;
  pricing_unit?: string | null;
  instant_booking?: boolean;
  accepts_quote_requests?: boolean;
  min_notice_hours?: number | null;
  max_advance_days?: number | null;
  duration_minutes?: number | null;
  location_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  max_distance_km?: number | null;
  willing_to_travel?: boolean;
  travel_fee_per_km?: number | null;
  what_included?: string | null;
  requirements?: string[] | null;
  tools_provided?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  status: string;
  provider_id?: number;
  photos?: Array<{
    id: number;
    uuid?: string;
    url: string;
    alt_text?: string | null;
    is_primary: boolean;
    position: number;
  }>;
}

const fetchService = async (id: number): Promise<ServiceDetail> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/services/${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return {
        id,
        title: 'Mock usługi',
        description: 'Opis mock',
        status: 'active',
      };
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const payload = await res.json();
  const s = payload.data ?? payload;
  return {
    id: s.id,
    title: s.title ?? 'Usługa',
    description: s.description ?? '',
    category_id: s.category_id,
    base_price: s.base_price ? Number(s.base_price) : undefined,
    pricing_type: s.pricing_type,
    price_range_low: s.price_range_low ?? null,
    price_range_high: s.price_range_high ?? null,
    pricing_unit: s.pricing_unit ?? null,
    instant_booking: Boolean(s.instant_booking),
    accepts_quote_requests: Boolean(s.accepts_quote_requests ?? true),
    min_notice_hours: s.min_notice_hours ?? null,
    max_advance_days: s.max_advance_days ?? null,
    duration_minutes: s.duration_minutes ?? null,
    location_id: s.location_id ?? null,
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    max_distance_km: s.max_distance_km ?? null,
    willing_to_travel: Boolean(s.willing_to_travel),
    travel_fee_per_km: s.travel_fee_per_km ?? null,
    what_included: s.what_included ?? null,
    requirements: Array.isArray(s.requirements) ? s.requirements : null,
    tools_provided: Array.isArray(s.tools_provided) ? s.tools_provided : null,
    meta_title: s.meta_title ?? null,
    meta_description: s.meta_description ?? null,
    status: s.status,
    provider_id: s.provider?.id ?? s.provider_id,
    photos: Array.isArray(s.photos)
      ? s.photos.map((p: any) => ({
          id: p.id,
          uuid: p.uuid,
          url: p.url,
          alt_text: p.alt_text,
          is_primary: Boolean(p.is_primary),
          position: Number(p.position ?? 0),
        }))
      : undefined,
  };
};

export const useService = (id: number) => {
  return useQuery<ServiceDetail, Error>({
    queryKey: ['provider', 'service', id],
    queryFn: async () => {
      if (isMockMode()) {
        const mock = MOCK_SUBPAGES.services.data[0];
        return {
          id,
          title: mock?.name ?? 'Mock',
          description: 'Opis mock',
          status: 'active',
        };
      }
      return fetchService(id);
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });
};
