import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin, Star, Phone } from 'lucide-react';
import { Service } from '../../types/service';
import 'leaflet/dist/leaflet.css';

// Fix dla domyślnych ikon Leaflet w Webpack/Vite
// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ServiceMapProps {
  services: Service[];
  center?: LatLngExpression;
  zoom?: number;
  onServiceClick?: (service: Service) => void;
}

/**
 * RecenterMap - komponent pomocniczy do przelotu do nowego centrum
 */
const RecenterMap: React.FC<{ center: number[]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center as [number, number], zoom);
  }, [center, zoom, map]);
  return null;
};

/**
 * ServiceMap - mapa z markerami usług (Leaflet + OpenStreetMap)
 */
export const ServiceMap: React.FC<ServiceMapProps> = React.memo(({
  services,
  center = [52.2297, 21.0122], // Warszawa domyślnie
  zoom = 12,
  onServiceClick,
}) => {
  // Przypisz współrzędne: użyj prawdziwych z API lub mock dla demo
  const servicesWithLocation = useMemo(() => {
    if (!services || !Array.isArray(services)) {
      return [];
    }
    return services
      .map((service, index) => {
        // Jeśli backend zwraca latitude/longitude, użyj ich
        if (service.latitude !== null && service.latitude !== undefined &&
            service.longitude !== null && service.longitude !== undefined) {
          return {
            ...service,
            lat: service.latitude,
            lng: service.longitude,
          };
        }
        // Fallback: mock coordinates dla demo (deterministyczny seed z ID)
        const seed = service.id * 1000;
        return {
          ...service,
          lat: 52.2297 + (Math.sin(seed) * 0.05),
          lng: 21.0122 + (Math.cos(seed) * 0.05),
        };
      })
      .filter((s) => s.lat !== null && s.lng !== null); // Pomiń usługi bez współrzędnych
  }, [services]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '400px' }}
        data-testid="service-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center as [number, number]} zoom={zoom} />

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={60}
        >
          {servicesWithLocation.map((service) => (
            <Marker key={service.id} position={[service.lat, service.lng]}>
              <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {service.name || 'Bez nazwy'}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {service.description || 'Brak opisu'}
                    </p>
                  </div>
                </div>

                {service.provider && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {service.provider.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-800">
                        {service.provider.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">
                          {service.provider.rating.toFixed(1)}
                        </span>
                        <span>({service.provider.reviews_count})</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-primary-600">
                    {service.base_price} zł
                  </div>
                  <button
                    onClick={() => onServiceClick?.(service)}
                    className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Szczegóły
                  </button>
                </div>

                {service.city && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {service.city}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700 z-[1000]">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {servicesWithLocation.length} {servicesWithLocation.length === 1 ? 'usługa' : 'usług'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span>Lokalizacja usługi</span>
        </div>
      </div>
    </div>
  );
});
