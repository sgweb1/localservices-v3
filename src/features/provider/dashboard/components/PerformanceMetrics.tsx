import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProviderPerformance } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

/**
 * Sekcja Performance Metrics - Wydajność providera
 */
export const PerformanceMetrics: React.FC = () => {
  const { data, isLoading, isError } = useProviderPerformance();

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/80 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const metrics = data?.data || {
    response_time: 8.5,
    completion_rate: 94,
    cancellation_rate: 2.1,
    customer_satisfaction: 4.7,
    repeat_customer_rate: 67,
  };

  const metricsList = [
    {
      label: 'Czas odpowiedzi',
      value: `${metrics.response_time} min`,
      icon: Clock,
      trend: 'positive',
      target: '< 30 min',
    },
    {
      label: 'Wskaźnik ukończenia',
      value: `${metrics.completion_rate}%`,
      icon: CheckCircle2,
      trend: 'positive',
      target: '> 90%',
    },
    {
      label: 'Wskaźnik anulowań',
      value: `${metrics.cancellation_rate}%`,
      icon: AlertCircle,
      trend: 'negative',
      target: '< 5%',
    },
    {
      label: 'Zadowolenie klienta',
      value: `${metrics.customer_satisfaction}/5`,
      icon: TrendingUp,
      trend: 'positive',
      target: '> 4.5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsList.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'positive' ? TrendingUp : TrendingDown;
        const trendColor = metric.trend === 'positive' ? 'text-emerald-600' : 'text-red-600';
        const iconBg = metric.trend === 'positive' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-orange-500';

        return (
          <div
            key={metric.label}
            className="glass-card rounded-2xl p-5 border border-slate-200/70 bg-white/80 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${iconBg} text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            </div>
            <p className="text-slate-600 text-sm font-semibold mb-1">
              {metric.label}
            </p>
            <p className="text-3xl font-black text-gradient mb-2">
              {metric.value}
            </p>
            <p className="text-xs text-slate-500">
              Cel: {metric.target}
            </p>
          </div>
        );
      })}
    </div>
  );
};
