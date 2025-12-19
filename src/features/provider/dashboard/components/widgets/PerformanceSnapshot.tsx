import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { PerformanceSnapshot as PerformanceSnapshotType } from '../../types';
import { Eye, Heart, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';

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
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Mock data dla mini wykresów (w produkcji to byłyby dane z API)
  const trendData: Record<string, number[]> = {
    'Wyświetlenia': [120, 150, 180, 160, 200, 190, 220],
    'Polubionych': [10, 12, 15, 13, 18, 16, 20],
    'Czas odpowiedzi': [45, 40, 38, 42, 35, 33, 30],
    'Ocena średnia': [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8],
  };

  const renderSparkline = (data: number[], label: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const trend = data[data.length - 1] > data[0];
    
    return (
      <div className="mt-2 h-8 relative">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={trend ? 'text-green-500' : 'text-red-500'}
          />
        </svg>
        <div className={`absolute top-0 right-0 flex items-center gap-0.5 text-[10px] font-bold ${trend ? 'text-green-600' : 'text-red-600'}`}>
          {trend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(0)}%
        </div>
      </div>
    );
  };
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
            const isHovered = hoveredMetric === metric.label;
            return (
            <div 
              key={metric.label} 
              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onMouseEnter={() => setHoveredMetric(metric.label)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 transition-transform ${isHovered ? 'scale-110' : ''}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <TextGradient className="text-2xl font-bold block truncate">
                    {metric.value}
                  </TextGradient>
                </div>
              </div>
              <p className="text-xs text-gray-600">{metric.label}</p>
              {isHovered && renderSparkline(trendData[metric.label], metric.label)}
            </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
