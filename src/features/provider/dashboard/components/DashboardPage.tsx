import React from 'react';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';
import { DashboardHero } from './DashboardHero';
import { DashboardGrid } from './DashboardGrid';
import { DevToolsPopup } from './DevToolsPopup';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Provider Dashboard Page
 * 
 * Kompozycja hero + grid. Używa useDashboardWidgets() do pobrania danych.
 * Loading/error states + auto-refresh co 5min.
 */
export const DashboardPage: React.FC = () => {
  const { data, isLoading, error, isError } = useDashboardWidgets();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Błąd ładowania</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Nie udało się załadować dashboardu'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-gradient"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Oblicz Trust Score z insights_card
  const trustScore = data.insights_card.trust_score;
  const planName = data.plan_card.plan_name;
  // Nazwa użytkownika z kontekstu auth (do dodania później)
  const userName = 'Użytkowniku';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <DashboardHero 
          userName={userName}
          trustScore={trustScore}
          planName={planName}
        />
        
        <DashboardGrid widgets={data} />
      </div>

      {/* DEV Tools - tylko w local env */}
      <DevToolsPopup />
    </div>
  );
};
