import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { IconGradient } from '@/components/ui/IconGradient';
import { AddonCard as AddonCardType } from '../../types';
import { Zap, BarChart3 } from 'lucide-react';

interface AddonsCarouselProps {
  data: AddonCardType[];
}

/**
 * Widget: Addons Carousel
 * 
 * Karuzela z dodatkami PRO (Instant Booking, Analityka PRO).
 * Każdy addon ma badge status i CTA.
 */
export const AddonsCarousel: React.FC<AddonsCarouselProps> = ({ data }) => {
  const getIconComponent = (iconName: string) => {
    if (iconName.includes('bolt')) return Zap;
    if (iconName.includes('chart')) return BarChart3;
    return Zap;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((addon, index) => {
        const IconComponent = getIconComponent(addon.icon);
        return (
        <GlassCard key={addon.key} hover className="rounded-2xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <IconGradient variant={index === 0 ? 2 : 3}>
                <IconComponent className="w-6 h-6 text-white" />
              </IconGradient>
              
              {addon.available ? (
                <BadgeGradient>Aktywne</BadgeGradient>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                  Od {addon.required_plan}
                </span>
              )}
            </div>

            {/* Body */}
            <div>
              <h4 className="font-bold text-lg text-gray-900">{addon.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
            </div>

            {/* Footer */}
            <a
              href={addon.cta_url}
              className={`block text-center px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                addon.available
                  ? 'btn-gradient'
                  : 'border-2 border-primary-200 text-primary-600 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              {addon.available ? 'Zobacz więcej' : 'Aktywuj'}
            </a>
          </div>
        </GlassCard>
        );
      })}
    </div>
  );
};
