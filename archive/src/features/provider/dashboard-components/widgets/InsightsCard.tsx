import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { InsightsCard as InsightsCardType } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface InsightsCardProps {
  data: InsightsCardType;
}

/**
 * Widget: Insights Card
 * 
 * Trust Score™, CTR, liczba zakończonych zleceń (bieżący miesiąc),
 * źródła ruchu (split katalog/polecenia/bezpośrednie).
 */
export const InsightsCard: React.FC<InsightsCardProps> = ({ data }) => {
  const totalTraffic = data.traffic_sources.reduce((sum, source) => sum + source.value, 0);

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Insights</h3>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {data.period_label}
          </span>
        </div>

        {/* Trust Score */}
        <div className="text-center py-4">
          <TextGradient strong className="text-5xl font-bold block">
            {data.trust_score}
          </TextGradient>
          <p className="text-xs text-gray-500 mt-2">Trust Score™</p>
          <div className={`flex items-center justify-center gap-1 mt-2 ${
            data.trust_delta >= 0 ? 'text-success' : 'text-error'
          }`}>
            {data.trust_delta >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <p className="text-sm font-semibold">
              {data.trust_delta >= 0 ? '+' : ''}{data.trust_delta} od progu (70)
            </p>
          </div>
        </div>

        {/* CTR */}
        {data.click_rate !== null && (
          <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{data.click_rate}%</p>
            <p className="text-xs text-gray-600 mt-1">Wskaźnik klikalności</p>
          </div>
        )}

        {/* Completed */}
        <div className="p-4 bg-success/5 rounded-xl">
          <p className="text-2xl font-bold text-gray-900">{data.completed}</p>
          <p className="text-xs text-gray-600 mt-1">Zakończonych zleceń (ten miesiąc)</p>
        </div>

        {/* Traffic Sources */}
        {data.traffic_sources.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Źródła ruchu</p>
            <div className="space-y-3">
              {data.traffic_sources.map((source) => (
                <div key={source.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{source.label}</span>
                    <span className="font-semibold text-gray-900">{source.value}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{ 
                        width: `${totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
