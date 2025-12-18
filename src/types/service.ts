/**
 * Service - Klasa reprezentująca usługę z API
 * GET /api/v1/services
 */
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
}

export interface ServiceProvider {
  id: number;
  name: string;
  avatar?: string | null;
  rating: number;
  reviews_count: number;
}

export interface Service {
  id: number;
  uuid: string;
  name: string | null;
  description: string | null;
  base_price: number;
  category?: ServiceCategory | null;
  city?: string | null;
  provider?: ServiceProvider;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFilters {
  category?: string;
  city?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
}

export interface ServiceListResponse {
  data: Service[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ServiceDetailResponse {
  data: Service;
}
