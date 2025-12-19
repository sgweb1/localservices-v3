/**
 * Typ: Lokalizacja (miasto)
 */
export interface Location {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  region?: string;
  population?: number;
  is_major_city: boolean;
}
