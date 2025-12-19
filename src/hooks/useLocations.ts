import { useState, useEffect } from 'react';
import { LocationClient } from '../api/v1/locations';
import type { Location } from '../types/location';

/**
 * Hook do pobierania lokalizacji z API
 */
export const useLocations = (majorCitiesOnly = false) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = majorCitiesOnly 
          ? await LocationClient.majorCities()
          : await LocationClient.list();
        setLocations(data);
        setError(null);
      } catch (err) {
        console.error('Błąd pobierania lokalizacji:', err);
        setError('Nie udało się pobrać listy miast');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [majorCitiesOnly]);

  return { locations, loading, error };
};
