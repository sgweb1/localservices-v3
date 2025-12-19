import React, { useState } from 'react';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';
import { DashboardHero } from './DashboardHero';
import { MainGrid } from './MainGrid';
import { DevToolsPopup } from './DevToolsPopup';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardData } from '../mocks/mockData';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Provider Dashboard Page
 * 
 * Kompozycja hero + grid. Używa useDashboardWidgets() do pobrania danych.
 * Loading/error states + auto-refresh co 5min.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [useMockData, setUseMockData] = useState(true); // DEV: Start z mock data
  const { data: apiData, isLoading, error, isError } = useDashboardWidgets();

  // Używaj mock data jeśli włączone lub API error
  const data = useMockData || isError ? mockDashboardData : apiData;

  if (isLoading && !useMockData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Ładowanie dashboardu...</p>
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
  const userName = user?.name.split(' ')[0] || 'Użytkowniku';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* DEV Banner - Mock Data Info */}
        {import.meta.env.DEV && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                DEV
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {useMockData ? '📊 Mock Data Mode' : '🔌 API Mode'}
                </p>
                <p className="text-sm text-gray-600">
                  {useMockData 
                    ? 'Wyświetlane są przykładowe dane testowe' 
                    : isError 
                      ? '⚠️ API error - fallback do mock data'
                      : 'Dane z API Laravel'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              {useMockData ? 'Przełącz na API' : 'Przełącz na Mock'}
            </button>
          </div>
        )}

        <DashboardHero />
        
        <MainGrid />
      </div>

      {/* DEV Tools - tylko w local env */}
      <DevToolsPopup />
    </div>
  );
};
