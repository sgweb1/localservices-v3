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
            <div className="text-white/70 text-[11px] tracking-widest uppercase font-bold mb-2">Eksperymentalny kokpit rozwoju</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Witaj ponownie, {userName}!
            </h1>
            <p className="text-white/80 text-sm mb-6 max-w-xl">
              Monitoruj limity planu, aktywuj dodatki i reaguj na leady szybciej niż konkurencja. Ta wersja dashboardu skupia się na wzroście i utrzymaniu Trust Score™.
            </p>
            <div className="flex items-center gap-3">
              <a href="/provider/services" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 text-gray-900 font-semibold hover:shadow-md">
                <span className="text-sm">Dodaj usługę</span>
              </a>
              <a href="/provider/subscription" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/25">
                <span className="text-sm">Zarządzaj planem</span>
              </a>
            </div>
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
