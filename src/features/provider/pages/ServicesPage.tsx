import React from 'react';
import { useServices } from '../hooks/useServices';
import { Briefcase, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Services Page - spójny z Dashboard, Calendar, Bookings
 * 
 * Glass-card design z gradientami cyan/teal.
 * Używa standardowych komponentów PageHeader i ServiceCard.
 */
export const ServicesPage: React.FC = () => {
  const { data, isLoading, error } = useServices();
  const items = data?.data ?? [];
  const activeCount = data?.counts?.active ?? 0;
  const inactiveCount = data?.counts?.inactive ?? 0;
  const totalViews = items.reduce((sum: number, s: any) => sum + (s.views ?? 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section */}
        <PageHeader
          title="Moje Usługi"
          subtitle="Zarządzaj ofertą"
          stats={[
            { label: 'Aktywne usługi', value: activeCount, icon: Sparkles, accent: 'from-emerald-400 to-teal-500' },
            { label: 'Nieaktywne', value: inactiveCount, icon: Briefcase, accent: 'from-slate-400 to-slate-500' },
            { label: 'Wyświetlenia', value: totalViews, icon: TrendingUp, accent: 'from-cyan-400 to-blue-500' },
          ]}
          actionButton={{
            label: 'Dodaj usługę',
            icon: Plus,
            href: '/provider/services/create',
          }}
        />

        {/* Services Grid - glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-full">
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-cyan-600 animate-pulse" />
                </div>
                <p className="text-slate-600 font-semibold">Ładowanie usług...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="col-span-full">
              <div className="glass-card rounded-2xl p-12 text-center border-2 border-red-200 bg-red-50/50">
                <p className="text-red-600 font-semibold">Błąd ładowania usług</p>
                <p className="text-sm text-red-500 mt-2">Spróbuj odświeżyć stronę</p>
              </div>
            </div>
          )}

          {!isLoading && items.map((service: any) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              category={service.category}
              price={service.price}
              status={service.status as 'active' | 'inactive'}
              views={service.views ?? 0}
            />
          ))}

          {/* Empty State */}
          {!isLoading && items.length === 0 && (
            <div className="col-span-full">
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-10 h-10 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Brak usług w ofercie</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Dodaj pierwszą usługę, aby klienci mogli Cię znaleźć w wyszukiwarce LocalServices
                </p>
                <Link
                  to="/provider/services/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Dodaj pierwszą usługę
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
