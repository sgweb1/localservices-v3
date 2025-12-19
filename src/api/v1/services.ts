/**
 * ServiceClient - Klient API dla usług
 * Endpoint: /api/v1/services
 */
import { ServiceFilters, ServiceListResponse, ServiceDetailResponse } from '../../types/service';
import { apiClient } from '../client';

export const ServiceClient = {
  /**
   * Pobierz listę usług z paginacją i filtrami
   * GET /api/v1/services?page=1&per_page=12&category=plumbing&city=Wrocław
   */
  async list(filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.location_id) params.append('location_id', filters.location_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.rating_min !== undefined) params.append('rating_min', filters.rating_min.toString());
    if (filters.trust_min !== undefined) params.append('trust_min', filters.trust_min.toString());
    if (filters.instant_only !== undefined) params.append('instant_only', String(filters.instant_only ? 1 : 0));
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.get(
      `/services${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Pobierz szczegóły jednej usługi
   * GET /api/v1/services/{id}
   */
  async getById(id: number): Promise<ServiceDetailResponse> {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Pobierz usługi dla konkretnego providera
   * GET /api/v1/providers/{providerId}/services
   */
  async getByProvider(providerId: number, filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const response = await apiClient.get(
      `/providers/${providerId}/services${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Wyszukaj usługi po kategorii
   */
  async searchByCategory(category: string, filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    return this.list({ ...filters, category });
  },

  /**
   * Wyszukaj usługi w mieście (nie używane - używaj location_id w filters)
   */
  async searchByCity(city: string, filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    return this.list(filters);
  },
};
