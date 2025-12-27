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
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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
        const trendColor = metric.trend === 'positive' ? 'text-green-600' : 'text-red-600';

        return (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <Icon className="w-8 h-8 text-primary-600 opacity-50" />
              <TrendIcon className={`w-5 h-5 ${trendColor}`} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {metric.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Cel: {metric.target}
            </p>
          </div>
        );
      })}
    </div>
  );
};
