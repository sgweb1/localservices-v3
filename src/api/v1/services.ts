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
    if (filters.city) params.append('city', filters.city);
    if (filters.search) params.append('search', filters.search);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());

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
   * Wyszukaj usługi w mieście
   */
  async searchByCity(city: string, filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    return this.list({ ...filters, city });
  },
};
