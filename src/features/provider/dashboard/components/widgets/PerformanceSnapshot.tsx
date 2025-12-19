import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { PerformanceSnapshot as PerformanceSnapshotType } from '../../types';
import { Eye, Heart, Clock, Star } from 'lucide-react';

interface PerformanceSnapshotProps {
  data: PerformanceSnapshotType;
}

/**
 * Widget: Performance Snapshot
 * 
 * 4 metryki w gridzie 2x2: views, favorited, avg_response_time, rating.
 * Każda metryka z ikoną, wartością i labelką.
 */
export const PerformanceSnapshot: React.FC<PerformanceSnapshotProps> = ({ data }) => {
  const metrics = [
    {
      label: 'Wyświetlenia',
      value: data.views,
      icon: Eye,
    },
    {
      label: 'Polubionych',
      value: data.favorited,
      icon: Heart,
    },
    {
      label: 'Czas odpowiedzi',
      value: data.avg_response_time,
      icon: Clock,
    },
    {
      label: 'Ocena średnia',
      value: data.rating !== null ? `${data.rating}/5` : 'Brak ocen',
      icon: Star,
    },
  ];

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Performance</h3>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {data.period_label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
            <div key={metric.label} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <TextGradient className="text-2xl font-bold block truncate">
                    {metric.value}
                  </TextGradient>
                </div>
              </div>
              <p className="text-xs text-gray-600">{metric.label}</p>
            </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
