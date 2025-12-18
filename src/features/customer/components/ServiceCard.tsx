import React from 'react';
import { Service } from '../../../types/service';
import { Star, MapPin, Zap } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick?: (service: Service) => void;
}

/**
 * ServiceCard - Komponent karty usługi
 * Wyświetla: nazwa, opis, cena, lokalizacja, provider, rating
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(service)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-200"
    >
      {/* Header - Kategoria */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <span className="text-xs font-semibold text-cyan-700 bg-cyan-100 px-2 py-1 rounded">
          {service.category?.name ?? 'Kategoria'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Nazwa usługi */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {service.name ?? 'Usługa bez nazwy'}
        </h3>

        {/* Opis */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {service.description ?? 'Brak opisu'}
        </p>

        {/* Lokalizacja */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          <span>{service.city ?? '—'}</span>
        </div>

        {/* Provider info */}
        {service.provider && (
          <div className="flex items-center justify-between mb-3 pb-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {service.provider.avatar && (
                <img
                  src={service.provider.avatar}
                  alt={service.provider.name}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
              )}
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {service.provider.name}
                </p>
                {typeof service.provider.rating === 'number' && (
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {service.provider.rating.toFixed(1)} ({service.provider.reviews_count})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer - Cena */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-cyan-600">
            {service.base_price.toFixed(2)} PLN
          </div>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
            <Zap size={16} />
            Rezerwuj
          </button>
        </div>
      </div>
    </div>
  );
};
