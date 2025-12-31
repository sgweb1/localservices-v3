import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text, StatValue } from '@/components/ui/typography';
import { Eye, Heart, Clock, Star } from 'lucide-react';
import { PerformanceSnapshot } from '../types';
import { useProviderPerformance } from '../../hooks/useDashboardData';

interface PerformanceMetricsProps {
  data?: PerformanceSnapshot;
  isLoading?: boolean;
}

/**
 * Sekcja Performance Metrics - Wydajność providera
 * Wyświetla: wyświetlenia, ulubione, czas odpowiedzi, ocenę
 */
export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border border-slate-200/70 bg-white/80 shadow-sm animate-pulse">
            <div className="h-10 bg-slate-200 rounded mb-3" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  // Fallback do mock data jeśli brak
  const metrics = data || {
    views: 234,
    favorited: 18,
    avg_response_time: '2.5h',
    rating: 4.7,
    period_label: 'Ostatnie 7 dni',
  };

  // Formatery wartości z fallback'ami dla null/undefined
  const formatValue = (value: any, defaultValue: string = '-', suffix: string = '') => {
    if (value === null || value === undefined || value === '') return defaultValue;
    return `${String(value)}${suffix}`;
  };

  const metricsList = [
    {
      label: 'Wyświetlenia',
      value: formatValue(metrics.views, '0'),
      icon: Eye,
      color: 'from-blue-400 to-cyan-500',
      description: 'W ostatnim okresie',
    },
    {
      label: 'Ulubione',
      value: formatValue(metrics.favorited, '0'),
      icon: Heart,
      color: 'from-rose-400 to-pink-500',
      description: 'Dodania do ulubionych',
    },
    {
      label: 'Czas odpowiedzi',
      value: formatValue(metrics.avg_response_time, '-'),
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      description: 'Średnia',
    },
    {
      label: 'Ocena',
      value: formatValue(metrics.rating, '-'),
      icon: Star,
      color: 'from-emerald-400 to-teal-500',
      description: 'Na podstawie recenzji',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsList.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="glass-card rounded-2xl p-5 border border-slate-200/70 bg-white/80 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-semibold mb-1">
              {metric.label}
            </p>
            <p className="text-3xl font-black text-gradient mb-2">
              {metric.value}
            </p>
            <p className="text-xs text-slate-500">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
