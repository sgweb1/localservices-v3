import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { IconGradient } from '@/components/ui/IconGradient';
import { PlanCard as PlanCardType } from '../../types';
import { RectangleStackIcon, AlertTriangle, ChevronRight } from 'lucide-react';

interface PlanCardProps {
  data: PlanCardType;
}

/**
 * Widget: Plan Card
 * 
 * Wyświetla aktywny plan, datę wygaśnięcia, limity (ogłoszenia, kategorie)
 * z paskami progresu i ostrzeżeniami o przekroczeniu.
 */
export const PlanCard: React.FC<PlanCardProps> = ({ data }) => {
  const getPlanBadgeColor = (slug: string) => {
    switch (slug) {
      case 'premium': return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case 'pro': return 'bg-gradient-to-r from-primary-600 to-accent-600';
      case 'basic': return 'bg-gradient-to-r from-accent-500 to-primary-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{data.plan_name}</h3>
            {data.expires_at && (
              <p className="text-xs text-gray-500 mt-1">Wygasa: {data.expires_at}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPlanBadgeColor(data.plan_slug)}`}>
            {data.plan_name}
          </span>
        </div>

        {/* Limits */}
        {data.items.map((item) => (
          <div key={item.key} className="space-y-2">
            <div className="flex items-center gap-3">
              <IconGradient variant={1}>
                <RectangleStackIcon className="w-5 h-5 text-white" />
              </IconGradient>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            
            <ProgressBar
              current={item.current}
              limit={item.limit}
              isUnlimited={item.is_unlimited}
              isExceeded={item.is_exceeded}
            />

            {item.is_exceeded && (
              <div className="text-xs text-error bg-error/10 p-2 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Przekroczono limit - usuń {item.current - item.limit} pozycji</span>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <a 
            href="/provider/subscription/plans"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
          >
            Zarządzaj subskrypcją
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </GlassCard>
  );
};
