import { useState } from 'react';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = (): Promise<GeolocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokalizacja nie jest wspierana przez twoją przeglądarkę'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setLoading(false);
          let errorMessage = 'Nie udało się pobrać lokalizacji';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Brak zgody na dostęp do lokalizacji';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Lokalizacja niedostępna';
              break;
            case err.TIMEOUT:
              errorMessage = 'Przekroczono czas oczekiwania';
              break;
          }
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return { getCurrentPosition, loading, error };
};
