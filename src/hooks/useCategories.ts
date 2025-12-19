import { useEffect, useState } from 'react';
import { CategoryClient } from '../api/v1/categories';
import type { ServiceCategory } from '../types/service';

/**
 * Hook do pobierania kategorii usług z API
 */
export const useCategories = (search?: string) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoryClient.list(search);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Błąd pobierania kategorii:', err);
        setError('Nie udało się pobrać kategorii');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [search]);

  return { categories, loading, error };
};
