/**
 * CalendarStats - Komponent wyświetlający statystyki kalendarza
 * 
 * Pokazuje:
 * - Ilość aktywnych slotów
 * - Ilość rezerwacji
 * - Procent zapełnienia
 * - Ilość pełnych slotów
 * 
 * @param globalStats - Globalne statystyki (wszystkie sloty)
 * @param weekStats - Statystyki dla wybranego tygodnia
 */

import React from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface CalendarStatsProps {
  globalStats: {
    total: number;
    active: number;
    bookings: number;
    capacity: number;
  };
  weekStats: {
    total: number;
    active: number;
    full: number;
    bookings: number;
    capacity: number;
  };
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ globalStats, weekStats }) => {
  const fillPercentage = globalStats.capacity > 0 
    ? Math.round((globalStats.bookings / globalStats.capacity) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
      {/* Aktywne sloty */}
      <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-500 uppercase">Aktywne</span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl font-semibold text-slate-900">{globalStats.active}</div>
        <div className="text-xs text-slate-500 mt-1">z {globalStats.total} slotów</div>
      </div>

      {/* Rezerwacje */}
      <div 
        className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" 
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-500 uppercase">Rezerwacje</span>
          <Calendar className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="text-xl font-semibold text-slate-900">{globalStats.bookings}</div>
        <div className="text-xs text-slate-500 mt-1">ogółem</div>
      </div>

      {/* Zapełnienie */}
      <div 
        className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" 
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-500 uppercase">Zapełnienie</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-semibold text-slate-900">{fillPercentage}%</div>
        <div className="text-xs text-slate-500 mt-1">średnia</div>
      </div>

      {/* Pełne sloty */}
      <div 
        className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" 
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase">Pełne</span>
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
        <div className="text-xl font-semibold text-slate-900">{weekStats.full}</div>
        <div className="text-xs text-slate-500 mt-1">slotów w tym tygodniu</div>
      </div>
    </div>
  );
};
