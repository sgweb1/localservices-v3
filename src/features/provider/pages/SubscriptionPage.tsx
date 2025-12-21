import React from 'react';
import { useSubscription } from '../dashboard/hooks/useSubscription';
import { Check, Crown, Zap, TrendingUp } from 'lucide-react';
import { PageTitle, Text, SectionTitle, Caption, StatValue, EmptyText } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Subscription Page - zgodny z localservices
 * 
 * Aktualny plan + limity + porównanie planów + upgrade CTA.
 */
export const SubscriptionPage: React.FC = () => {
  const { data, isLoading, error } = useSubscription();
  const sub = data?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <PageTitle gradient>Subskrypcja</PageTitle>
        <Text muted size="sm" className="mt-2">Zarządzaj planem i funkcjami</Text>
      </div>

      {isLoading && (
        <Card className="p-12 text-center"><EmptyText>Ładowanie...</EmptyText></Card>
      )}
      {error && !isLoading && (
        <Card className="p-12 text-center"><EmptyText className="text-red-600">Błąd ładowania danych subskrypcji</EmptyText></Card>
      )}
      {sub && !isLoading && (
        <>
          {/* Aktualny plan */}
          <Card className="p-8 border-2 border-cyan-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {(sub.plan === 'pro' || sub.plan === 'premium') && (
                    <Crown className="w-8 h-8 text-amber-500" />
                  )}
                  <StatValue gradient className="text-3xl capitalize">{sub.plan}</StatValue>
                </div>
                {sub.expiresAt && (
                  <Caption muted>Wygasa: {sub.expiresAt}</Caption>
                )}
              </div>
              <Button
                onClick={() => window.location.href = '/provider/subscription/plans'}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
              >
                Zmień plan
              </Button>
            </div>

            {/* Funkcje */}
            <div className="mb-6">
              <SectionTitle className="text-sm mb-3">Funkcje w Twoim planie</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sub.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <Text size="sm" className="text-slate-700">{f}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Limity */}
            <div>
              <SectionTitle className="text-sm mb-3">Limity i wykorzystanie</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Caption muted className="mb-1">Max usług</Caption>
                  <StatValue className="text-2xl">{sub.limits.maxServices}</StatValue>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Caption muted className="mb-1">Max zdjęć</Caption>
                  <StatValue className="text-2xl">{sub.limits.maxPhotos}</StatValue>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Caption muted className="mb-1">Wsparcie priorytetowe</Caption>
                  <StatValue className="text-2xl">{sub.limits.prioritySupport ? '✔️' : '❌'}</StatValue>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Caption muted className="mb-1">Analityka</Caption>
                  <StatValue className="text-2xl">{sub.limits.analytics ? '✔️' : '❌'}</StatValue>
                </div>
              </div>
            </div>
          </Card>

          {/* Upgrade CTA */}
          {sub.plan === 'free' && (
            <Card className="p-8 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <SectionTitle className="mb-2">
                    Odblokuj pełny potencjał LocalServices
                  </SectionTitle>
                  <Text className="mb-4">
                    Przejdź na plan Pro i zyskaj więcej klientów dzięki zaawansowanym funkcjom.
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
                    className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white"
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
