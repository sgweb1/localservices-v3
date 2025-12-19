import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  MessageSquare,
  Calendar,
  Star,
  ChevronRight,
  Zap
} from 'lucide-react';

/**
 * Performance Dashboard Widget - interaktywny widget z metrykami
 * 
 * Cechy:
 * - Animated progress bars
 * - Sparkline graphs (mini wykresy)
 * - Comparison indicators
 * - Hover tooltips
 */
export const PerformanceDashboardWidget: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState({
    views: 0,
    inquiries: 0,
    bookings: 0,
    rating: 0,
  });

  const metrics = [
    {
      id: 'views',
      label: 'Wyświetlenia profilu',
      value: 2543,
      change: +12.5,
      icon: Eye,
      color: 'cyan',
      sparkline: [120, 150, 180, 160, 200, 190, 220],
    },
    {
      id: 'inquiries',
      label: 'Zapytania',
      value: 147,
      change: +8.3,
      icon: MessageSquare,
      color: 'teal',
      sparkline: [10, 12, 15, 13, 18, 16, 20],
    },
    {
      id: 'bookings',
      label: 'Rezerwacje',
      value: 89,
      change: -3.2,
      icon: Calendar,
      color: 'purple',
      sparkline: [8, 9, 7, 10, 8, 7, 9],
    },
    {
      id: 'rating',
      label: 'Średnia ocen',
      value: 4.8,
      change: +2.1,
      icon: Star,
      color: 'orange',
      sparkline: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8],
      isRating: true,
    },
  ];

  // Animated counters
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    metrics.forEach((metric) => {
      const interval = setInterval(() => {
        setAnimatedValues((prev) => {
          const current = prev[metric.id as keyof typeof prev];
          const target = metric.value;
          const step = metric.isRating ? 0.1 : Math.ceil(target / 50);
          
          if (current >= target) {
            clearInterval(interval);
            return { ...prev, [metric.id]: target };
          }
          
          return { 
            ...prev, 
            [metric.id]: Math.min(current + step, target) 
          };
        });
      }, 30);

      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; gradient: string }> = {
      cyan: { 
        bg: 'bg-cyan-100', 
        text: 'text-cyan-600', 
        gradient: 'from-cyan-500 to-teal-500' 
      },
      teal: { 
        bg: 'bg-teal-100', 
        text: 'text-teal-600', 
        gradient: 'from-teal-500 to-cyan-500' 
      },
      purple: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-600', 
        gradient: 'from-purple-500 to-pink-500' 
      },
      orange: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-600', 
        gradient: 'from-orange-500 to-yellow-500' 
      },
    };
    return colors[color] || colors.cyan;
  };

  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const colorClasses = getColorClasses(color);
    
    return (
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={colorClasses.text} stopOpacity="0.8" />
            <stop offset="100%" className={colorClasses.text} stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Twoja wydajność
          </h2>
          <p className="text-sm text-gray-600 mt-1">Ostatnie 7 dni</p>
        </div>
        <a 
          href="/provider/analytics"
          className="flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors group"
        >
          Pełna analityka
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const colorClasses = getColorClasses(metric.color);
          const isPositive = metric.change > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const animatedValue = animatedValues[metric.id as keyof typeof animatedValues];

          return (
            <div
              key={metric.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(metric.change)}%
                  </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <div className="text-3xl font-black text-gradient">
                    {metric.isRating 
                      ? animatedValue.toFixed(1)
                      : Math.round(animatedValue).toLocaleString('pl-PL')}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    {metric.label}
                  </div>
                </div>

                {/* Sparkline - shows on hover */}
                {renderSparkline(metric.sparkline, metric.color)}

                {/* Progress indicator */}
                <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${colorClasses.gradient} rounded-full transition-all duration-1000`}
                    style={{ 
                      width: `${metric.isRating ? (animatedValue / 5) * 100 : Math.min((animatedValue / metric.value) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Świetna forma! 🎉
              </p>
              <p className="text-xs text-gray-600">
                Twój profil rośnie o <span className="font-bold text-green-600">+27.5%</span> w tym tygodniu
              </p>
            </div>
          </div>
          <a 
            href="/provider/marketing"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow"
          >
            Zobacz porady
          </a>
        </div>
      </div>

      <style>{`
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-line {
          animation: draw-line 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
