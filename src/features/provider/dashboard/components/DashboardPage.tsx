import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, TrendingUp, Calendar, MessageSquare, Star, Bell, CreditCard, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RecentBookings } from './RecentBookings';
import { RecentReviews } from './RecentReviews';
import { RecentMessages } from './RecentMessages';

/**
 * Provider Dashboard Page - FULL VERSION
 * Wyświetla kompletny dashboard z metrykami, rezerwacjami, recenzjami i wiadomościami
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // Quick stats
  const stats = {
    bookingsToday: 3,
    upcomingBookings: 7,
    reviewsAvg: 4.8,
    unreadMessages: 5,
    trustScore: 88,
  };

  const quickLinks = [
    { 
      icon: Calendar, 
      label: 'Rezerwacje', 
      href: '/provider/bookings',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      icon: MessageSquare, 
      label: 'Wiadomości', 
      href: '/provider/messages',
      color: 'from-green-500 to-green-600'
    },
    { 
      icon: LayoutGrid, 
      label: 'Usługi', 
      href: '/provider/services',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Analityka', 
      href: '/provider/analytics',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      icon: Star, 
      label: 'Recenzje', 
      href: '/provider/reviews',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      icon: Bell, 
      label: 'Powiadomienia', 
      href: '/provider/notifications',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      icon: CreditCard, 
      label: 'Plan', 
      href: '/provider/subscription',
      color: 'from-indigo-500 to-indigo-600'
    },
    { 
      icon: Settings, 
      label: 'Ustawienia', 
      href: '/provider/settings',
      color: 'from-gray-600 to-gray-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Witaj, {user?.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Przegląd Twojej aktywności i zarządzanie usługami
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {stats.trustScore}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Trust Score™</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rezerwacje dzisiaj */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Rezerwacje dzisiaj
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.bookingsToday}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-30" />
            </div>
          </div>

          {/* Nadchodzące rezerwacje */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Nadchodzące rezerwacje
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.upcomingBookings}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-30" />
            </div>
          </div>

          {/* Średnia ocena */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Średnia ocena
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.reviewsAvg}⭐
                </p>
              </div>
              <Star className="w-12 h-12 text-yellow-500 opacity-30" />
            </div>
          </div>

          {/* Nowe wiadomości */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Nowe wiadomości
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.unreadMessages}
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Performance Metrics Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap size={24} className="text-primary-600" />
            Wydajność
          </h2>
          <PerformanceMetrics />
        </div>

        {/* Recent Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentBookings />
          <RecentMessages />
        </div>

        {/* Reviews Section */}
        <RecentReviews />

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Szybkie akcje
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${link.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {link.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            💡 Wskazówka
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Utrzymuj swój Trust Score powyżej 70, aby uzyskać dostęp do premium funkcji i wyższą widoczność w wyszukiwaniu. Odpowiadaj na wiadomości szybko - to wpływa na Twoją wydajność!
          </p>
        </div>
      </div>
    </div>
  );
};
