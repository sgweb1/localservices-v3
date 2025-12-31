import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Moon, Sun, LayoutDashboard, Users, Menu, X, Calendar, MessagesSquare, Briefcase, CreditCard, Settings, CalendarDays, User, Zap } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';
import { useConversations } from './features/provider/hooks/useConversations';
import { Toaster } from 'sonner';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { DevLoginPage } from './pages/DevLoginPage';
import { DashboardPage } from './features/provider/dashboard/components';
import { ProviderLayout } from './features/provider/dashboard/components/ProviderLayout';
import { BookingsPageWithTabs } from './features/provider/pages/BookingsPageWithTabs';
import { MessagesPage } from './features/provider/pages/MessagesPage';
import { ServicesPage as ProviderServicesPage } from './features/provider/pages/ServicesPage';
import ServiceFormPageV2 from './features/provider/pages/ServiceFormPageV2';
import ServiceFormPage from './features/provider/pages/ServiceFormPage';
import { SettingsPage } from './features/provider/pages/SettingsPage';
import { BoostPurchase, SubscriptionPurchase, BoostList, SubscriptionList } from './features/provider/monetization/components';
import { CheckoutSuccess, CheckoutCancel } from './features/provider/monetization/pages';
import { CalendarPage } from './features/provider/calendar/CalendarPage';
import { ProfilePage } from './features/provider/profile/ProfilePage';
import { DevSimulatorPage } from './features/provider/pages/DevSimulatorPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import { useToastNotifications } from './hooks/useToastNotifications';
import '../resources/css/app.css';
import './styles/select.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

// Konfiguracja QueryClient z lepszymi ustawieniami cache
const qc = new QueryClient({
  defaultOptions: {
    queries: {
      // Deduplikacja: jeśli inny komponent robi ten sam query w ciągu 30s, podziel cache
      gcTime: 1000 * 60 * 5, // Garbage collect po 5 minutach (było: 5 minut)
      staleTime: 1000 * 60, // Cache jest fresh przez 60 sekund (było: 0)
      refetchOnWindowFocus: false, // Nie refetch przy focus (było: true)
      refetchOnMount: false, // Nie refetch przy mount (używamy prefetch + cache)
      retry: 2, // 2 ponowne próby na error (było: 3)
      refetchInterval: 1000 * 60 * 5, // Background refetch co 5 minut (było: false)
    },
  },
});

// Provider Dashboard Link (tylko dla providerów)
const ProviderDashboardLink = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/provider/dashboard"
            className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg flex items-center gap-2"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="sm:hidden">
          <p>Dashboard providera</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Provider Dashboard Link for Mobile Sidebar
const ProviderDashboardLinkMobile: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  return (
    <Link
      to="/provider/dashboard"
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg transition-all font-medium"
    >
      <LayoutDashboard size={20} />
      Dashboard
    </Link>
  );
};

// Provider Navigation Links for Mobile Sidebar
const ProviderNavLinksMobile: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const { data: conversationsData } = useConversations(false);
  
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  // Policz wszystkie nieprzeczytane wiadomości
  const totalUnread = (conversationsData?.data || []).reduce((sum, conv) => {
    return sum + (conv.unread_count || 0);
  }, 0);

  const navItems = [
    { to: '/provider/bookings', label: 'Rezerwacje', icon: Calendar },
    { to: '/provider/calendar', label: 'Kalendarz', icon: CalendarDays },
    { to: '/provider/messages', label: 'Wiadomości', icon: MessagesSquare, showBadge: totalUnread > 0, badgeCount: totalUnread },
    { to: '/provider/services', label: 'Usługi', icon: Briefcase },
    { to: '/provider/profile', label: 'Profil', icon: User },
    { to: '/provider/monetization/boost', label: 'Boost', icon: Zap },
    { to: '/provider/monetization/subscription', label: 'Subskrypcja', icon: CreditCard },
    { to: '/provider/settings', label: 'Ustawienia', icon: Settings },
  ];

  return (
    <>
      {navItems.map(({ to, label, icon: Icon, showBadge, badgeCount }) => (
        <Link
          key={to}
          to={to}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <Icon size={20} />
          <span className="flex-1">{label}</span>
          {showBadge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
              {badgeCount! > 99 ? '99+' : badgeCount}
            </span>
          )}
        </Link>
      ))}
    </>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useToastNotifications();

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [window.location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 font-archivo hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            LocalServices
          </Link>
          <div className="hidden md:flex gap-2 sm:gap-3 ml-auto items-center">
            {/* DEV Login Link - publiczny */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/dev/login"
                    className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg flex items-center gap-2"
                  >
                    <Users size={16} />
                    <span className="hidden sm:inline">DEV Login</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">
                  <p>DEV Login</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
          
          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="md:hidden ml-auto p-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-50 shadow-xl md:hidden transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <Link
                  to="/dev/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all font-medium"
                >
                  <Users size={20} />
                  DEV Login
                </Link>

                <ProviderDashboardLinkMobile onClose={() => setMobileMenuOpen(false)} />
                
                {/* Provider Navigation Links */}
                <ProviderNavLinksMobile onClose={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page Content */}
      <main className="flex-1 transition-colors">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/szukaj" element={<ServicesPage />} />
          <Route path="/szukaj/:category" element={<ServicesPage />} />
          <Route path="/szukaj/:category/:city" element={<ServicesPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/dev/login" element={<DevLoginPage />} />
          
          {/* Provider Routes - wymagają autoryzacji jako provider */}
          <Route path="/provider" element={
            <ProtectedRoute requiredRole="provider">
              <ProviderLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPageWithTabs />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="services" element={<ProviderServicesPage />} />
            <Route path="services/create" element={<ServiceFormPage />} />
            <Route path="services/edit/:id" element={<ServiceFormPageV2 />} />
            <Route path="services/edit-legacy/:id" element={<ServiceFormPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="monetization/boost" element={<BoostPurchase />} />
            <Route path="monetization/subscription" element={<SubscriptionPurchase />} />
            <Route path="monetization/boosts" element={<BoostList />} />
            <Route path="monetization/subscriptions" element={<SubscriptionList />} />
            <Route path="dev-simulator" element={<DevSimulatorPage />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

createRoot(rootEl).render(
  // StrictMode tylko w dev do debugowania - wyłącz dla production performance
  import.meta.env.DEV ? (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <AuthProvider>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  ) : (
    <BrowserRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
);