import { useState } from 'react';
import { Service } from '../../../types/service';
import { ServiceClient } from '../../../api/v1/services';

/**
 * useServices - Hook do pobierania usług
 */
export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1,
  });

  const fetchServices = async (
    page: number = 1,
    filters: Record<string, any> = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ServiceClient.list({
        page,
        per_page: 12,
        ...filters,
      });

      setServices(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Błąd przy pobieraniu usług'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    pagination,
    fetchServices,
  };
};
