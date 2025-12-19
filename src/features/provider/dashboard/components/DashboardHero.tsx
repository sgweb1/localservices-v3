import React from 'react';
import { Plus, Calendar, Home, Briefcase, ShieldCheck } from 'lucide-react';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';

/**
 * Dashboard Hero Section - zgodny z localservices/provider/dashboard
 * 
 * Hero gradient + statystyki w glass cards.
 */
export const DashboardHero: React.FC = () => {
  const { data: widgets, isLoading } = useDashboardWidgets();
  
  const stats = widgets?.stats ?? {
    upcoming_bookings: 0,
    active_services: 0,
    trust_score: 0,
    verification_level: 0
  };

  return (
    <header className="relative mb-12">
      {/* Tło gradientowe subtelniejsze + warstwa glass dla treści */}
      <div className="absolute inset-0 hero-gradient opacity-90"></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      <div className="relative text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row mb-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                <Home className="w-8 h-8" />
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Witaj, Jan Kowalski!
                </h1>
              </div>
              <p className="text-sm lg:text-base text-white/90 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span>Weryfikacja: Poziom {stats.verification_level}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  Trust Score™ {stats.trust_score}/100
                </span>
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <a href="/provider/services" className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl">
                <Plus className="w-5 h-5" />
                Dodaj usługę
              </a>
              <a href="/provider/availability" className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/30">
                <Calendar className="w-5 h-5" />
                Kalendarz
              </a>
            </div>
          </div>
          
          {/* Statystyki w headerze */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mb-24 md:-mb-24 mt-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-cyan-600" />
                <span className="text-sm text-gray-600">Nadchodzące rezerwacje</span>
              </div>
              <div className="text-3xl font-bold text-gradient">
                {isLoading ? '—' : stats.upcoming_bookings}
              </div>
              <div className="text-xs text-gray-500 mt-1">Najbliższe 7 dni</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-6 h-6 text-cyan-600" />
                <span className="text-sm text-gray-600">Aktywne usługi</span>
              </div>
              <div className="text-3xl font-bold text-gradient">
                {isLoading ? '—' : stats.active_services}
              </div>
              <div className="text-xs text-gray-500 mt-1">Widoczne w katalogu</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-6 h-6 text-cyan-600" />
                <span className="text-sm text-gray-600">Trust Score™</span>
              </div>
              <div className="text-3xl font-bold text-gradient">
                {isLoading ? '—' : `${stats.trust_score}/100`}
              </div>
              <div className="text-xs text-gray-500 mt-1">Poziom {stats.verification_level}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
