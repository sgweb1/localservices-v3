import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Home, Briefcase, ShieldCheck, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Dashboard Hero Section - interaktywny hero z animacjami
 * 
 * Cechy:
 * - Animated counters (liczby płynnie rosną)
 * - Trust Score progress ring
 * - Hover effects na statystykach
 * - Floating particles background
 */
export const DashboardHero: React.FC = () => {
  const { user } = useAuth();
  const { data: widgets, isLoading } = useDashboardWidgets();
  
  const stats = widgets?.stats ?? {
    upcoming_bookings: 0,
    active_services: 0,
    trust_score: 0,
    verification_level: 0
  };

  // Animated counters
  const [animatedBookings, setAnimatedBookings] = useState(0);
  const [animatedServices, setAnimatedServices] = useState(0);
  const [animatedTrustScore, setAnimatedTrustScore] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Animate bookings
      const bookingInterval = setInterval(() => {
        setAnimatedBookings(prev => {
          if (prev >= stats.upcoming_bookings) {
            clearInterval(bookingInterval);
            return stats.upcoming_bookings;
          }
          return prev + 1;
        });
      }, 80);

      // Animate services
      const servicesInterval = setInterval(() => {
        setAnimatedServices(prev => {
          if (prev >= stats.active_services) {
            clearInterval(servicesInterval);
            return stats.active_services;
          }
          return prev + 1;
        });
      }, 100);

      // Animate trust score
      const trustInterval = setInterval(() => {
        setAnimatedTrustScore(prev => {
          if (prev >= stats.trust_score) {
            clearInterval(trustInterval);
            return stats.trust_score;
          }
          return prev + 2;
        });
      }, 20);

      return () => {
        clearInterval(bookingInterval);
        clearInterval(servicesInterval);
        clearInterval(trustInterval);
      };
    }
  }, [isLoading, stats]);

  const userName = user?.name?.split(' ')[0] || 'Użytkowniku';
  const greetingEmoji = new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 18 ? '🌤️' : '🌙';

  // Trust Score circle progress calculation
  const trustScoreCircumference = 2 * Math.PI * 36; // r=36
  const trustScoreProgress = (animatedTrustScore / 100) * trustScoreCircumference;

  return (
    <header className="relative mb-12 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 opacity-95"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row mb-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start animate-fade-in">
                <span className="text-3xl animate-bounce-slow">{greetingEmoji}</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                  Witaj, {userName}!
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-sm lg:text-base text-white/90 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Weryfikacja: Poziom {stats.verification_level}
                </span>
                <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  Trust Score™ {animatedTrustScore}/100
                </span>
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <a 
                href="/provider/services" 
                className="group flex items-center gap-2 rounded-xl bg-white text-cyan-600 px-6 py-3 font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Dodaj usługę
              </a>
              <a 
                href="/provider/calendar" 
                className="group flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 hover:border-white"
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Kalendarz
              </a>
            </div>
          </div>
          
          {/* Statystyki w headerze - interactive cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mb-24 md:-mb-24 mt-6">
            {/* Bookings Card */}
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Nadchodzące rezerwacje</span>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-4xl font-black text-gradient">
                {isLoading ? '—' : animatedBookings}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span>Najbliższe 7 dni</span>
                {stats.upcoming_bookings > 0 && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">+{Math.floor(stats.upcoming_bookings * 0.15)}</span>
                )}
              </div>
            </div>

            {/* Services Card */}
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Aktywne usługi</span>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-4xl font-black text-gradient">
                {isLoading ? '—' : animatedServices}
              </div>
              <div className="text-xs text-gray-500 mt-1">Widoczne w katalogu</div>
            </div>

            {/* Trust Score Card with circular progress */}
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Trust Score™
                </span>
                {animatedTrustScore >= 70 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Premium</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Circular progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="url(#trust-gradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={trustScoreCircumference}
                      strokeDashoffset={trustScoreCircumference - trustScoreProgress}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="trust-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-gradient">{animatedTrustScore}</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">/100</div>
                  <div className="text-xs text-gray-500">Poziom {stats.verification_level}</div>
                  <div className="text-xs text-cyan-600 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {animatedTrustScore >= 70 ? '+5% ten miesiąc' : 'W budowie'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation keyframes via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
};
