import React from 'react';
import { Service } from '../../../types/service';
import { Star, MapPin, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../components/ui/tooltip';

interface ServiceCardProps {
  service: Service;
  onClick?: (service: Service) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (serviceId: number) => void;
}

/**
 * ServiceCard - Komponent karty usługi
 * Wyświetla: nazwa, opis, cena, lokalizacja, provider, rating
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <div
      onClick={() => onClick?.(service)}
      className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 overflow-hidden shadow-md hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-300 group cursor-pointer"
      data-testid="service-card"
    >
      {/* Zdjęcie główne */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(service.id);
            }}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors z-10"
            data-testid="favorite-toggle"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
          </button>
        )}
        {/* Placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Badges overlay */}
        <div className="absolute top-3 right-3">
          <div className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30 text-xs font-bold text-primary-700 dark:text-primary-300 shadow-sm backdrop-blur-sm">
            {service.category?.name ?? 'Kategoria'}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Tytuł */}
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {service.name ?? 'Usługa bez nazwy'}
        </h3>
        
        {/* Opis */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {service.description ?? 'Brak opisu'}
        </p>
        
        {/* Provider mini */}
        {service.provider && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <img
              src={service.provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name)}`}
              alt={service.provider.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {service.provider.name}
              </p>
              {typeof service.provider.rating === 'number' && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span>{service.provider.rating.toFixed(1)} ({service.provider.reviews_count})</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Lokalizacja */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{service.city ?? 'Cała Polska'}</span>
        </div>
        
        {/* Cena */}
        <div className="flex items-center justify-between gap-2 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {service.base_price.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} zł
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">za godzinę</p>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={(e) => { e.stopPropagation(); onClick?.(service); }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 gap-1.5 whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">Sprawdź</span>
                  <span className="sm:hidden">Szczegóły</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">
                <p>Sprawdź szczegóły usługi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
