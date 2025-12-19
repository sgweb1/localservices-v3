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
  icon?: string | null;
  order?: number | null;
  is_featured?: boolean;
  listings_count?: number | null;
  providers_count?: number | null;
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
  latitude?: number | null;
  longitude?: number | null;
  provider?: ServiceProvider;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFilters {
  category?: string;
  location_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  rating_min?: number;
  trust_min?: number;
  instant_only?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
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
