import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { PipelineBoard as PipelineBoardType } from '../../types';
import { TrendingUp } from 'lucide-react';

interface PipelineBoardProps {
  data: PipelineBoardType;
}

/**
 * Widget: Pipeline Board
 * 
 * Tablica z zapytaniami ofertowymi (pending/quoted/converted) + konwersja
 * oraz rezerwacjami (pending/confirmed/completed).
 * Gating szczegółów gdy brak instant_booking + messaging.
 */
export const PipelineBoard: React.FC<PipelineBoardProps> = ({ data }) => {
  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Pipeline</h3>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {data.period}
          </span>
        </div>

        {/* Zapytania ofertowe */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">Zapytania ofertowe</p>
          
          <div className="grid grid-cols-3 gap-4 relative">
            {!data.can_view_details && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center rounded-xl z-10">
                <div className="glass-card p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 mb-2">Aktywuj plan PRO</p>
                  <a 
                    href="/provider/subscription/plans"
                    className="btn-gradient inline-flex items-center gap-2 text-xs"
                  >
                    Zobacz plany
                  </a>
                </div>
              </div>
            )}

            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.requests.incoming}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Przychodzące</p>
            </div>

            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.requests.quoted}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Wycenione</p>
            </div>

            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.requests.converted}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Przekonwertowane</p>
            </div>
          </div>

          {/* Conversion rate */}
          <div className="text-center pt-2">
            <TextGradient strong className="text-2xl font-bold block">
              {data.requests.conversion_rate}%
            </TextGradient>
            <p className="text-xs text-gray-500 mt-1">Konwersja leadów</p>
          </div>
        </div>

        {/* Rezerwacje */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Rezerwacje</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.bookings.pending}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Oczekujące</p>
            </div>

            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.bookings.confirmed}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Potwierdzone</p>
            </div>

            <div className="text-center">
              <TextGradient className="text-3xl font-bold block">
                {data.bookings.completed}
              </TextGradient>
              <p className="text-xs text-gray-600 mt-1">Zakończone</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
