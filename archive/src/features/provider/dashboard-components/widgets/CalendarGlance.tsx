import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CalendarGlance as CalendarGlanceType } from '../../types';
import { Sun, Moon, ChevronRight } from 'lucide-react';

interface CalendarGlanceProps {
  data: CalendarGlanceType;
}

/**
 * Widget: Calendar Glance
 * 
 * 3 dni (data), każdy dzień z 2 slotami (rano/popołudnie).
 * Gating gdy brak instant_booking feature (is_blurred).
 */
export const CalendarGlance: React.FC<CalendarGlanceProps> = ({ data }) => {
  const getSlotIcon = (period: string) => {
    return period === 'morning' ? Sun : Moon;
  };

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Kalendarz (3 dni)</h3>
          <a 
            href="/provider/calendar"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            Zobacz pełny →
          </a>
        </div>

        <div className="space-y-4 relative">
          {data.is_blurred && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center rounded-xl z-10">
              <div className="glass-card p-4 text-center max-w-xs">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Aktywuj Instant Booking
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Aby zarządzać kalendarzem, włącz funkcję automatycznych rezerwacji
                </p>
                <a 
                  href="/provider/addons"
                  className="btn-gradient inline-flex items-center gap-2 text-xs"
                >
                  Aktywuj teraz
                </a>
              </div>
            </div>
          )}

          {data.days.map((day) => (
            <div key={day.date} className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">{day.date_formatted}</p>
              
              <div className="grid grid-cols-2 gap-3">
                {day.slots.map((slot) => {
                  const SlotIcon = getSlotIcon(slot.period);
                  return (
                  <div
                    key={slot.period}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      slot.available
                        ? 'border-success bg-success/5 hover:bg-success/10'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <SlotIcon className={`w-4 h-4 ${
                        slot.available ? 'text-success' : 'text-gray-400'
                      }`} />
                      <p className="text-xs font-semibold text-gray-900">
                        {slot.period === 'morning' ? 'Rano' : 'Popołudnie'}
                      </p>
                    </div>
                    
                    <p className="text-xs text-gray-500">{slot.time_range}</p>
                    
                    {slot.available ? (
                      <p className="text-xs text-success font-semibold mt-1">Dostępny</p>
                    ) : (
                      <p className="text-xs text-error font-semibold mt-1">Zajęty</p>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <a
          href="/provider/calendar"
          className="block text-center px-4 py-2 rounded-xl border-2 border-primary-200 text-primary-600 hover:border-primary-400 hover:bg-primary-50 font-semibold text-sm transition-all"
        >
          Zarządzaj kalendarzem
        </a>
      </div>
    </GlassCard>
  );
};
