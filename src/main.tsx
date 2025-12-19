import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Moon, Sun, LayoutDashboard, Users } from 'lucide-react';
import { AuthDemo } from './features/auth/components/AuthDemo';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { DevLoginPage } from './pages/DevLoginPage';
import { DashboardPage } from './features/provider/dashboard/components';
import { ProviderLayout } from './features/provider/dashboard/components/ProviderLayout';
import { BookingsPage } from './features/provider/dashboard/pages/BookingsPage';
import { MessagesPage } from './features/provider/dashboard/pages/MessagesPage';
import { ServicesPage as ProviderServicesPage } from './features/provider/dashboard/pages/ServicesPage';
import { ReviewsPage } from './features/provider/dashboard/pages/ReviewsPage';
import { NotificationsPage } from './features/provider/dashboard/pages/NotificationsPage';
import { SubscriptionPage } from './features/provider/dashboard/pages/SubscriptionPage';
import { SettingsPage } from './features/provider/dashboard/pages/SettingsPage';
import { SupportPage } from './features/provider/dashboard/pages/SupportPage';
import { CalendarPage } from './features/provider/calendar/CalendarPage';
import { MarketingTipsPage } from './features/provider/marketing/MarketingTipsPage';
import { AnalyticsPage } from './features/provider/analytics/AnalyticsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Footer } from './components/Footer';
import '../resources/css/app.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const qc = new QueryClient();

// Provider Dashboard Link (tylko dla providerów)
const ProviderDashboardLink = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  return (
    <Link
      to="/provider/dashboard"
      className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg flex items-center gap-2"
    >
      <LayoutDashboard size={16} />
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
  );
};

// Current User Badge (w navbar)
const CurrentUserBadge = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'provider': return 'bg-primary-100 text-primary-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
        {user.name.split(' ')[0]}
      </span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${getRoleBadgeColor(user.role)}`}>
        {user.role.toUpperCase()}
      </span>
    </div>
  );
};

// App with routing
const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 font-archivo hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            LocalServices
          </Link>
          <div className="flex gap-2 sm:gap-3 ml-auto items-center">
            <Link
              to="/szukaj"
              className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Usługi
            </Link>

            {/* DEV Login Link - publiczny */}
            <Link
              to="/dev/login"
              className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg flex items-center gap-2"
            >
              <Users size={16} />
              <span className="hidden sm:inline">DEV Login</span>
            </Link>

            {/* Provider Dashboard Link - tylko dla providerów */}
            <ProviderDashboardLink />

            {/* Current User Badge */}
            <CurrentUserBadge />

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 transition-colors">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/szukaj" element={<ServicesPage />} />
          <Route path="/szukaj/:category" element={<ServicesPage />} />
          <Route path="/szukaj/:category/:city" element={<ServicesPage />} />
          <Route path="/dev/login" element={<DevLoginPage />} />
          <Route path="/provider" element={<ProviderLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="services" element={<ProviderServicesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="marketing" element={<MarketingTipsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);