import React from 'react';
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import { Layers, Photo, Users, Star } from 'lucide-react';

interface LimitCardProps {
  title: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
}

const LimitCard: React.FC<LimitCardProps> = ({ title, current, limit, icon }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{current} / {limit}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-teal-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      
      {isNearLimit && (
        <p className="text-xs text-amber-600 mt-2 font-medium">Zbliżasz się do limitu!</p>
      )}
    </div>
  );
};

/**
 * Subscription Limits Section - zgodna z localservices
 * 
 * 4 widgety limitów planu subskrypcji:
 * - max_listings (Ogłoszenia)
 * - max_gallery_images (Zdjęcia w galerii)
 * - max_team_members (Członkowie zespołu)
 * - featured_listings (Wyróżnione ogłoszenia)
 */
export const SubscriptionLimitsSection: React.FC = () => {
  const { data, isLoading } = useDashboardWidgets();

  const limits = data?.planUsage ?? {
    max_listings: { current: 0, limit: 0 },
    max_gallery_images: { current: 0, limit: 0 },
    max_team_members: { current: 0, limit: 0 },
    featured_listings: { current: 0, limit: 0 },
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 px-1">Twój Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LimitCard
          title="Ogłoszenia"
          current={limits.max_listings?.current ?? 0}
          limit={limits.max_listings?.limit ?? 10}
          icon={<Layers className="w-5 h-5" />}
        />
        <LimitCard
          title="Zdjęcia w galerii"
          current={limits.max_gallery_images?.current ?? 0}
          limit={limits.max_gallery_images?.limit ?? 50}
          icon={<Photo className="w-5 h-5" />}
        />
        <LimitCard
          title="Członkowie zespołu"
          current={limits.max_team_members?.current ?? 0}
          limit={limits.max_team_members?.limit ?? 5}
          icon={<Users className="w-5 h-5" />}
        />
        <LimitCard
          title="Wyróżnione ogłoszenia"
          current={limits.featured_listings?.current ?? 0}
          limit={limits.featured_listings?.limit ?? 3}
          icon={<Star className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};
