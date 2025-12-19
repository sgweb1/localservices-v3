import { apiClient } from '../client';
import type { Location } from '../../types/location';

/**
 * API Client dla lokalizacji
 */
export const LocationClient = {
  /**
   * Pobiera wszystkie lokalizacje
   */
  async list(): Promise<Location[]> {
    const response = await apiClient.get<{ data: Location[] }>('/locations');
    return response.data.data;
  },

  /**
   * Pobiera główne miasta
   */
  async majorCities(): Promise<Location[]> {
    const response = await apiClient.get<{ data: Location[] }>('/locations/major-cities');
    return response.data.data;
  },

  /**
   * Pobiera lokalizację po ID
   */
  async getById(id: number): Promise<Location> {
    const response = await apiClient.get<{ data: Location }>(`/locations/${id}`);
    return response.data.data;
  },

  /**
   * Pobiera lokalizację po slug
   */
  async getBySlug(slug: string): Promise<Location> {
    const response = await apiClient.get<{ data: Location }>(`/locations/by-slug/${slug}`);
    return response.data.data;
  },
};
