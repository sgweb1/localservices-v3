import React, { useState, useEffect } from 'react';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';
import { DashboardHero } from './DashboardHero';
import { MainGrid } from './MainGrid';
import { DevToolsPopup } from './DevToolsPopup';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardData } from '../mocks/mockData';
import { Loader2 } from 'lucide-react';
import { OnboardingTour, OnboardingChecklist, PROVIDER_ONBOARDING_STEPS, PROVIDER_CHECKLIST_ITEMS } from '../../onboarding/OnboardingTour';
import { EmptyText } from '@/components/ui/typography';

/**
 * Provider Dashboard Page
 * 
 * Kompozycja hero + grid. Używa useDashboardWidgets() do pobrania danych.
 * Loading/error states + auto-refresh co 5min.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: apiData, isLoading, error, isError } = useDashboardWidgets();
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checklistItems, setChecklistItems] = useState(PROVIDER_CHECKLIST_ITEMS);

  useEffect(() => {
    // Check if user is new (first login)
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleChecklistItemComplete = (id: string) => {
    setChecklistItems(prev => 
      prev.map(item => item.id === id ? { ...item, completed: true } : item)
    );
  };

  // Fallback do mocków tylko przy błędzie API
  const data = isError ? mockDashboardData : apiData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <EmptyText className="font-semibold text-base">Ładowanie dashboardu...</EmptyText>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <EmptyText className="font-semibold text-base">Ładowanie dashboardu...</EmptyText>
        </div>
      </div>
    );
  }

  // Oblicz Trust Score z insights_card
  const trustScore = data.insights_card?.trust_score || 0;
  const planName = data.plan_card?.plan_name || 'FREE';
  const userName = user?.name.split(' ')[0] || 'Użytkowniku';

  const completedCount = checklistItems.filter(item => item.completed).length;
  const showChecklist = completedCount < checklistItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          steps={PROVIDER_ONBOARDING_STEPS}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* DEV Banner - API Status Info */}
        {import.meta.env.DEV && isError && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                ⚠️
              </div>
              <div>
                <p className="font-semibold text-gray-900">API Error</p>
                <p className="text-sm text-gray-600">
                  {error?.message || 'Błąd pobierania danych z API - fallback do mock data'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Checklist - tylko dla nowych użytkowników */}
        {showChecklist && (
          <div className="mb-6">
            <OnboardingChecklist
              items={checklistItems}
              onItemComplete={handleChecklistItemComplete}
            />
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
