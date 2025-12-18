import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthDemo } from './features/auth/components/AuthDemo';
import { ServicesPage } from './pages/ServicesPage';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const qc = new QueryClient();

// Simple routing - toggle between pages
const App = () => {
  const [page, setPage] = useState<'auth' | 'services'>('services');

  return (
    <div>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
          <h1 className="text-2xl font-bold text-cyan-600">LocalServices</h1>
          <div className="flex gap-4 ml-auto">
            <button
              onClick={() => setPage('services')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === 'services'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Usługi
            </button>
            <button
              onClick={() => setPage('auth')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === 'auth'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Auth
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {page === 'services' && <ServicesPage />}
      {page === 'auth' && <AuthDemo />}
    </div>
  );
};

createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
