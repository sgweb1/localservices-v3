import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Provider Dashboard Page (STUB - under development)
 * 
 * Pokazuje podstawowe informacje o provideru
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Musisz być zalogowany</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Witaj, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Panel Providera - LocalServices
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Usługi</div>
              <div className="text-3xl font-bold text-primary-600">0</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rezerwacje</div>
              <div className="text-3xl font-bold text-primary-600">0</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Trust Score™</div>
              <div className="text-3xl font-bold text-primary-600">85</div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ✨ Dashboard w przygotowaniu
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Pełny dashboard z analityką, zarządzaniem usługami i rezerwacjami będzie dostępny wkrótce.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/provider/services"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Moje Usługi</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zarządzaj swoimi usługami</p>
            </a>
            <a
              href="/provider/bookings"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📅 Rezerwacje</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Przeglądaj i zarządzaj rezerwacjami</p>
            </a>
            <a
              href="/provider/calendar"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📆 Kalendarz</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zarządzaj swoją dostępnością</p>
            </a>
            <a
              href="/provider/messages"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💬 Wiadomości</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Komunikuj się z klientami</p>
            </a>
            <a
              href="/provider/subscription"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⭐ Subskrypcja</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zarządzaj planem subskrypcji</p>
            </a>
            <a
              href="/provider/settings"
              className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ Ustawienia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zmień ustawienia profilu</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
