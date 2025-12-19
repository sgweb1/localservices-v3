import { apiClient } from '../client';
import type { ServiceCategory } from '../../types/service';

/**
 * API Client dla kategorii usług
 */
export const CategoryClient = {
  /**
   * Pobiera listę głównych kategorii
   */
  async list(search?: string): Promise<ServiceCategory[]> {
    const response = await apiClient.get<{ data: ServiceCategory[] }>('/categories', {
      params: search ? { search } : undefined,
    });
    return response.data.data;
  },

  /**
   * Pobiera kategorię po slug
   */
  async getBySlug(slug: string): Promise<ServiceCategory> {
    const response = await apiClient.get<{ data: ServiceCategory }>(`/categories/${slug}`);
    return response.data.data;
  },
};
