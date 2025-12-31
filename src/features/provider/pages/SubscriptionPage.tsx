import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Check, Crown, Zap, TrendingUp, AlertCircle, Sparkles, Gift } from 'lucide-react';
import { PageTitle, Text, SectionTitle, Caption, StatValue, EmptyText } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLAN_LIMITS, LIMITS_COMPARISON } from '../subscription/constants/planLimits';

/**
 * Subscription Management Page
 * 
 * Zarządzanie subskrypcją i planem providera:
 * - Wyświetlanie aktualnego planu i jego limitów
 * - Porównanie dostępnych planów
 * - Informacje o zaletach każdego planu
 * - CTA do upgrade/downgrade
 * - Informacje o naliczaniu opłat
 * 
 * Dostępne plany:
 * - free: Do 5 usług, 5 zdjęć
 * - basic: Do 25 usług, 50 zdjęć
 * - pro: Nieograniczone usługi, zaawansowana analityka
 * - premium: Wszystkie funkcje + priorytet i dedykowany manager
 * 
 * @component
 * @returns {React.ReactElement} Subscription dashboard with plan comparison
 */
export const SubscriptionPage: React.FC = () => {
  const { data, isLoading, error } = useSubscription();
  const sub = data?.data;

  // Mapowanie planów na opisy marketingowe
  const planDescriptions: Record<string, { title: string; description: string; benefits: string[] }> = {
    free: {
      title: 'Plan Darmowy',
      description: 'Idealny do rozpoczęcia - testuj funkcje bez zobowiązań',
      benefits: ['Do 5 usług', '5 zdjęć', 'Podstawowe powiadomienia', 'Profil publiczny'],
    },
    basic: {
      title: 'Plan Podstawowy',
      description: 'Dla firm chcących się rozwijać',
      benefits: ['Do 25 usług', '50 zdjęć', 'Priorytetowe powiadomienia', 'Statystyki podstawowe', 'Subdomena'],
    },
    pro: {
      title: 'Plan Pro',
      description: 'Dla profesjonalistów - maksymalna widoczność',
      benefits: ['Nieograniczone usługi', 'Nieograniczone zdjęcia', 'Wsparcie 24/7', 'Analityka zaawansowana', 'Subdomena +'],
    },
    premium: {
      title: 'Plan Premium',
      description: 'Dla liderów rynku - wszystkie funkcje + priorytet',
      benefits: ['Wszystko z Pro', 'Dedykowany menedżer', 'API dostęp', 'White label opcje', 'Priorytet w wyszukiwaniu'],
    },
  };

  const planInfo = planDescriptions[sub?.plan || 'free'];
  const planColors: Record<string, string> = {
    free: 'from-slate-400 to-slate-600',
    basic: 'from-blue-500 to-cyan-500',
    pro: 'from-cyan-500 to-teal-500',
    premium: 'from-purple-500 to-pink-500',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <PageTitle gradient>Subskrypcja</PageTitle>
        <Text muted size="sm" className="mt-2">Zarządzaj planem i funkcjami - odblokuj potencjał swojego biznesu</Text>
      </div>

      {isLoading && (
        <Card className="p-12 text-center"><EmptyText>Ładowanie...</EmptyText></Card>
      )}
      {error && !isLoading && (
        <Card className="p-12 text-center"><EmptyText className="text-red-600">Błąd ładowania danych subskrypcji</EmptyText></Card>
      )}
      {sub && !isLoading && (
        <>
          {/* Aktualny plan - duża karta główna */}
          <div className="glass-card p-8 rounded-2xl border-2" style={{
            borderColor: sub.plan === 'premium' ? '#a855f7' : sub.plan === 'pro' ? '#06b6d4' : '#64748b'
          }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {(sub.plan === 'pro' || sub.plan === 'premium') && (
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                      <Crown className="w-6 h-6 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <h2 className={`text-3xl font-bold text-gradient bg-gradient-to-r ${planColors[sub.plan]} bg-clip-text text-transparent`}>
                      {planInfo.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{planInfo.description}</p>
                  </div>
                </div>
                {sub.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    Wygasa: <span className="font-semibold">{sub.expiresAt}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => window.location.href = '/provider/subscription/plans'}
                variant="primary"
                size="lg"
              >
                <Gift className="w-5 h-5" />
                Zmień plan
              </Button>
            </div>

            {/* Funkcje - grid */}
            <div className="mb-8">
              <SectionTitle className="text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Funkcje w Twoim planie
              </SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sub.features.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 dark:from-cyan-900/10 dark:to-teal-900/10 rounded-xl border border-cyan-100 dark:border-cyan-800">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <Text size="sm" className="text-slate-700 dark:text-slate-300">{f}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Limity - cards */}
            <div>
              <SectionTitle className="text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Limity i wykorzystanie
              </SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Caption muted className="mb-2">Max usług</Caption>
                  <StatValue className="text-2xl">
                    {PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxServices === 999 ? '∞' : PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxServices}
                  </StatValue>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Caption muted className="mb-2">Zdjęcia per usługa</Caption>
                  <StatValue className="text-2xl">
                    {PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxPhotosPerService === 999 ? '∞' : PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxPhotosPerService}
                  </StatValue>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Caption muted className="mb-2">Portfolio razem</Caption>
                  <StatValue className="text-2xl">
                    {PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxPortfolioPhotos === 999 ? '∞' : PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].maxPortfolioPhotos}
                  </StatValue>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Caption muted className="mb-2">Wsparcie</Caption>
                  <StatValue className="text-lg">
                    {PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].dedicatedManager ? 'Menedżer' : 
                     PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS].prioritySupport ? '24/7' : 'Email'}
                  </StatValue>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing tips - spójne z BusinessProfileTab */}
          {sub.plan === 'free' && (
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">💡 Porada: Wzrost przychodów</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Klienci na planach Pro/Premium zarabiają <strong>średnio 150% więcej</strong>. Wyższe limity usług i zdjęć to 70% zwiększenia zapytań.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/provider/subscription/plans'}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Sprawdź plan Pro
                  </Button>
                </div>
              </div>
            </div>
          )}

          {sub.plan === 'basic' && (
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/10 dark:to-teal-900/10 border border-cyan-200 dark:border-cyan-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl">
                    <Zap className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">⚡ Gotów na wzrost?</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Twój profil robi się popularny! Plan Pro doda Ci <strong>wyższą pozycję w wyszukiwaniu</strong> i dostęp do <strong>zaawansowanej analityki</strong> - dowiedz się, skąd przychodzą klienci.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/provider/subscription/plans'}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade na Pro
                  </Button>
                </div>
              </div>
            </div>
          )}

          {sub.plan === 'pro' && (
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">👑 Provedeł się! Plan Premium czeka</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Klienci na Premium mają dostęp do <strong>dedykowanego menedżera</strong>, <strong>API integracji</strong> i <strong>priorytetu w algorytmie wyszukiwania</strong>. Średni przychód +45% vs Plan Pro.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/provider/subscription/plans'}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                  >
                    <Gift className="w-4 h-4" />
                    Sprawdź Premium
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Porównanie wszystkich planów */}
          <div>
            <SectionTitle className="mb-6">Porównanie wszystkich planów</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Funkcja</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Darmowy</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Podstawowy</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Pro</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {LIMITS_COMPARISON.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{row.feature}</td>
                      <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">{row.free}</td>
                      <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">{row.basic}</td>
                      <td className="text-center py-3 px-4 text-cyan-600 dark:text-cyan-400 font-semibold">{row.pro}</td>
                      <td className="text-center py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA do upgrade jeśli nie premium */}
          {sub.plan !== 'premium' && (
            <Card className="p-8 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-2 border-cyan-200 dark:border-cyan-800">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <SectionTitle className="mb-2">
                    Odblokuj pełny potencjał LocalServices
                  </SectionTitle>
                  <Text className="mb-4">
                    Najlepsi providerzy korzystają z planów Pro/Premium. Więcej klientów, wyższe zarobki, profesjonalny wizerunek.
                  </Text>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <Text size="sm">Nieograniczona liczba usług i zdjęć</Text>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <Text size="sm">Wyższa pozycja w wynikach wyszukiwania</Text>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <Text size="sm">Analityka i raporty w czasie rzeczywistym</Text>
                    </li>
                  </ul>
                  <Button
                    onClick={() => window.location.href = '/provider/subscription/plans'}
                    variant="primary"
                    size="lg"
                  >
                    <Crown className="w-5 h-5" />
                    Sprawdź plany
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionPage;
