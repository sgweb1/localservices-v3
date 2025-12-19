import React from 'react';
import { HeroGradient } from '@/components/ui/HeroGradient';
import { TextGradient } from '@/components/ui/TextGradient';
import { BadgeGradient } from '@/components/ui/BadgeGradient';

interface DashboardHeroProps {
  userName: string;
  trustScore: number;
  planName: string;
}

/**
 * Dashboard Hero Section
 * 
 * Hero z przywitaniem, Trust Score badge i nazwą planu.
 * Gradient background z Archivo font.
 */
export const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  trustScore,
  planName,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  return (
    <HeroGradient className="rounded-3xl mb-8">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-start justify-between">
          {/* Left: Greeting */}
          <div>
            <p className="text-gray-700 text-sm font-medium mb-2">
              {getGreeting()}, {userName}!
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Panel Providera
            </h1>
            <p className="text-gray-600 text-sm">
              Zarządzaj swoją działalnością w jednym miejscu
            </p>
          </div>

          {/* Right: Trust Score + Plan */}
          <div className="flex items-center gap-4">
            <div className="glass-card rounded-2xl px-6 py-4 text-center">
              <TextGradient strong className="text-3xl font-bold block mb-1">
                {trustScore}
              </TextGradient>
              <p className="text-xs text-gray-700">Trust Score™</p>
            </div>

            <BadgeGradient className="px-4 py-2">
              {planName}
            </BadgeGradient>
          </div>
        </div>
      </div>
    </HeroGradient>
  );
};
