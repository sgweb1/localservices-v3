import React, { useState } from 'react';
import { TrendingUp, Eye, Users, Calendar, Star, MessageSquare, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { useAnalytics } from './hooks/useAnalytics';

/**
 * Analytics Page - Zaawansowana analityka dla providerów
 * 
 * Features:
 * - Wykresy wizytacji, konwersji, rezerwacji
 * - Porównanie z poprzednim okresem
 * - Top performing services
 * - Źródła ruchu
 * - Czas odpowiedzi
 */

type TimePeriod = '7d' | '30d' | '90d' | 'year';

type MetricCard = {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
};

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  
  const { data, isLoading, error } = useAnalytics(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-cyan-500 mb-4" />
          <p className="text-slate-600">Ładowanie analityki...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-600 font-semibold">Błąd ładowania danych</p>
          <p className="text-slate-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      label: 'Wyświetlenia profilu',
      value: data?.metrics.profile_views.value.toLocaleString() || '0',
      change: data?.metrics.profile_views.change || 0,
      changeLabel: 'vs poprzedni okres',
      icon: <Eye className="w-6 h-6" />,
      color: 'cyan',
    },
    {
      label: 'Zapytania',
      value: data?.metrics.inquiries.value.toLocaleString() || '0',
      change: data?.metrics.inquiries.change || 0,
      changeLabel: 'vs poprzedni okres',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'teal',
    },
    {
      label: 'Rezerwacje',
      value: data?.metrics.bookings.value.toLocaleString() || '0',
      change: data?.metrics.bookings.change || 0,
      changeLabel: 'vs poprzedni okres',
      icon: <Calendar className="w-6 h-6" />,
      color: 'emerald',
    },
    {
      label: 'Konwersja',
      value: `${data?.metrics.conversion.value || 0}%`,
      change: data?.metrics.conversion.change || 0,
      changeLabel: 'zapytania → rezerwacje',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'indigo',
    },
  ];

  const topServices = data?.top_services || [];
  const trafficSources = data?.traffic_sources || [];
  const responseTime = data?.response_time || { minutes: 0, industry_average: 30, comparison: 0 };
  const rating = data?.rating || { average: 0, count: 0 };
  const insights = data?.insights || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analityka</h1>
          <p className="text-sm text-slate-500 mt-1">
            Szczegółowe statystyki Twojego profilu i usług
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'year'] as TimePeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                period === p
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p === '7d' && '7 dni'}
              {p === '30d' && '30 dni'}
              {p === '90d' && '90 dni'}
              {p === 'year' && 'Rok'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${metric.color}-100 text-${metric.color}-600`}>
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {metric.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.label}</p>
            <p className="text-xs text-slate-400 mt-2">{metric.changeLabel}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Wyświetlenia profilu</h3>
        <div className="h-64 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-cyan-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Wykres będzie tu wyświetlony</p>
            <p className="text-xs text-slate-400 mt-1">Integracja z biblioteką wykresów (Chart.js/Recharts)</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Najlepsze usługi</h3>
          <div className="space-y-4">
            {topServices.map((service, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-bold flex items-center justify-center">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{service.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {service.views} wyświetleń
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {service.bookings} rezerwacji
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-emerald-600">{service.conversion}%</p>
                  <p className="text-xs text-slate-500">konwersja</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Źródła ruchu</h3>
          <div className="space-y-4">
            {trafficSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">{source.source}</span>
                  <span className="text-sm font-semibold text-slate-900">{source.visits}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{source.percentage}% całkowitego ruchu</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response Time & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">Średni czas odpowiedzi</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-slate-900">{responseTime.minutes}</p>
            <p className="text-xl text-slate-600">minut</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            {responseTime.comparison > 0 ? (
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-emerald-600">Świetnie!</span> Jesteś {responseTime.comparison}% szybszy od średniej w branży ({responseTime.industry_average} min)
              </p>
            ) : responseTime.minutes > 0 ? (
              <p className="text-sm text-slate-600">
                Średnia w branży to {responseTime.industry_average} minut
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Brak danych o czasie odpowiedzi w tym okresie
              </p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">Średnia ocena</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-slate-900">{rating.average}</p>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(rating.average) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Na podstawie <span className="font-semibold">{rating.count} {rating.count === 1 ? 'opinii' : 'opinii'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">💡 Spostrzeżenia</h3>
        {insights.length > 0 ? (
          <ul className="text-sm text-slate-600 space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx}>• {insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Brak wystarczających danych do wygenerowania spostrzeżeń</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
