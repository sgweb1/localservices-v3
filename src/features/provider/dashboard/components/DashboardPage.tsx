import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MessageSquare, ShieldCheck, Zap, Loader2, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';
import { useRecentBookings, useRecentMessages, useRecentReviews } from '../../hooks/useDashboardData';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RecentBookings } from './RecentBookings';
import { RecentMessages } from './RecentMessages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTitle, Text } from '@/components/ui/typography';

/**
 * Provider Dashboard - styl dopasowany do widoków Rezerwacje/Kalendarz
 * Bazuje na realnych danych z API (widgets + recents) i szklanych kartach z gradientami.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: widgets, isLoading: widgetsLoading } = useDashboardWidgets();

  // Inicjalizujemy wszystkie queries na TOP LEVEL aby React Query deduplikował automatycznie
  // Gdy wszystkie mountują w tym samym rendera cycle, React Query robi JEDEN request dla każdego queryKey
  useRecentBookings(5);
  useRecentMessages(5);
  useRecentReviews(4);

  const pipeline = widgets?.pipeline ?? widgets?.pipeline_board;
  const bookingsStats = pipeline?.bookings ?? { pending: 0, confirmed: 0, completed: 0 };
  const requestsStats = pipeline?.requests ?? { incoming: 0, quoted: 0, converted: 0 };
  const insights = widgets?.insights ?? widgets?.insights_card;
  const performance = widgets?.performance ?? widgets?.performance_snapshot;
  const messageCenter = widgets?.messages ?? widgets?.message_center;

  const trustScore = (insights as any)?.trust_score ?? (performance as any)?.trust_score ?? 0;
  const unreadMessages = messageCenter?.unread_notifications ?? messageCenter?.unread_count ?? 0;
  const responseMinutes = (performance as any)?.response_minutes ?? null;

  const heroStats = [
    { label: 'Oczekujące', value: bookingsStats.pending ?? 0, icon: Clock, accent: 'from-amber-400 to-orange-500' },
    { label: 'Potwierdzone', value: bookingsStats.confirmed ?? 0, icon: CheckCircle2, accent: 'from-emerald-400 to-teal-500' },
    { label: 'Nieprzeczytane', value: unreadMessages, icon: MessageSquare, accent: 'from-cyan-400 to-blue-500' },
  ];

  const summaryCards = [
    {
      label: 'Zapytania ofertowe',
      value: (requestsStats.incoming ?? 0) + (requestsStats.quoted ?? 0),
      hint: 'Ostatnie 30 dni',
      accent: 'from-cyan-500 to-teal-500',
      icon: MessageSquare,
    },
    {
      label: 'Potwierdzone rezerwacje',
      value: bookingsStats.confirmed ?? 0,
      hint: 'Instant booking i ręczne',
      accent: 'from-emerald-500 to-teal-500',
      icon: CheckCircle2,
    },
    {
      label: 'Ukończone',
      value: bookingsStats.completed ?? 0,
      hint: 'Zamknięte zlecenia',
      accent: 'from-blue-500 to-cyan-500',
      icon: Calendar,
    },
    {
      label: 'Trust Score™',
      value: trustScore,
      hint: trustScore >= 70 ? 'Premium widoczność aktywna' : 'Cel: 70+',
      accent: 'from-amber-400 to-orange-500',
      icon: Zap,
    },
  ];

  const firstName = user?.name?.split(' ')[0] ?? 'Providera';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero inspirowany Rezerwacjami/Kalendarzem */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-500 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_35%)]" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10 blur-3xl" />

          <div className="relative p-8 sm:p-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Panel providera</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-md">Witaj, {firstName}!</h1>
                <p className="text-white text-sm sm:text-base max-w-2xl">
                  Przegląd rezerwacji, wiadomości i zaufania w jednym miejscu. Styling spójny z zakładkami Rezerwacje i Kalendarz.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/provider/calendar"
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    Przejdź do kalendarza
                  </Link>
                  <Link
                    to="/provider/bookings"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/20 px-4 py-2 font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Zarządzaj rezerwacjami
                  </Link>
                </div>
              </div>

              <div className="glass-card bg-white/90 border border-white/40 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">Trust Score™</p>
                  <p className="text-4xl font-black leading-none text-gradient">
                    {widgetsLoading ? <Loader2 className="w-6 h-6 animate-spin text-cyan-600" /> : trustScore}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 font-semibold">
                    {trustScore >= 70 ? 'Premium widoczność utrzymana' : 'Cel: 70+ aby odblokować premium'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="glass-card bg-white/90 border border-white/40 rounded-2xl p-4 flex items-center justify-between shadow-lg"
                  >
                    <div>
                      <p className="text-xs text-slate-600 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-black mt-1 text-slate-900">
                        {widgetsLoading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-600" /> : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skrócone podsumowanie w stylu kart z Rezerwacji */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-card rounded-2xl p-5 border border-slate-200/70 bg-white/80 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">{card.label}</p>
                    <p className="text-xs text-slate-500">{card.hint}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${card.accent} text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-gradient">
                  {widgetsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : card.value}
                </div>
                {card.label === 'Trust Score™' && responseMinutes !== null && (
                  <p className="mt-2 text-xs text-emerald-700">
                    Śr. czas odpowiedzi: {responseMinutes} min
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Sekcja wydajności */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Zap className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-bold">Wydajność</h2>
          </div>
          <PerformanceMetrics data={performance as any} isLoading={widgetsLoading} />
        </div>

        {/* Rezerwacje + Wiadomości */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentBookings />
          <RecentMessages />
        </div>
      </div>
    </div>
  );
};
