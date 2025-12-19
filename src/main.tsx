import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Moon, Sun } from 'lucide-react';
import { AuthDemo } from './features/auth/components/AuthDemo';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { Footer } from './components/Footer';
import '../resources/css/app.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const qc = new QueryClient();

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
            <Link
              to="/auth-demo"
              className="px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Auth
            </Link>

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
          <Route path="/auth-demo" element={<AuthDemo />} />
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
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);