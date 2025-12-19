import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { ServicesCard as ServicesCardType } from '../../types';
import { Briefcase, Eye, ChevronRight } from 'lucide-react';

interface ServicesCardProps {
  data: ServicesCardType;
}

/**
 * Widget: Services Card
 * 
 * Top 6 usług wg views w ostatnim miesiącu. Każda usługa z obrazem,
 * tytułem, kategorią, liczbą wyświetleń i statusem active.
 */
export const ServicesCard: React.FC<ServicesCardProps> = ({ data }) => {
  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Twoje usługi</h3>
          <a 
            href="/provider/services"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            Zarządzaj →
          </a>
        </div>

        {data.items.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">Nie masz jeszcze żadnych usług</p>
            <a href="/provider/services/create" className="btn-gradient inline-block">
              Dodaj pierwszą usługę
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.items.map((service) => (
                <a
                  key={service.id}
                  href={`/provider/services/${service.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
                        <Briefcase className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {service.title}
                      </p>
                      {service.is_active ? (
                        <BadgeGradient className="flex-shrink-0">Aktywna</BadgeGradient>
                      ) : (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                          Nieaktywna
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">{service.category_name}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <TextGradient className="text-sm font-bold">
                          {service.views_count}
                        </TextGradient>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-primary-600 transition-colors" />
                </a>
              ))}
            </div>

            <a
              href="/provider/services/create"
              className="block text-center px-4 py-2 rounded-xl border-2 border-primary-200 text-primary-600 hover:border-primary-400 hover:bg-primary-50 font-semibold text-sm transition-all"
            >
              Dodaj nową usługę
            </a>
          </>
        )}
      </div>
    </GlassCard>
  );
};
