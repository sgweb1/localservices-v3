import React, { useState } from 'react';
import { useSubscription, SubscriptionPlan } from '../hooks/useSubscription';
import { PlansGrid } from '../components/PlansGrid';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { AlertCircle, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';

/**
 * Strona zarządzania subskrypcją
 * Wyświetla:
 * - Status obecnej subskrypcji
 * - Ostrzeżenia (expiry, pending changes)
 * - Siatka dostępnych planów
 * - Modal do upgradu/zmiany
 */
export const SubscriptionPage: React.FC = () => {
  const { plans, status, currentPlanId, pendingPlanId, endsAt, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Nie pozwalaj na ten sam plan
    if (plan.id === currentPlanId) {
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  // Oblicz dni do wygaśnięcia
  const daysUntilExpiry = endsAt
    ? Math.ceil((new Date(endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionTitle className="text-4xl mb-3">Plany Subskrypcji</SectionTitle>
          <Text muted size="lg" className="max-w-2xl mx-auto">
            Wybierz plan, który najlepiej pasuje do Twoich potrzeb. Możesz zmienić go w każdej
            chwili.
          </Text>
        </div>

        {/* Status alertów */}
        <div className="space-y-4 mb-12">
          {/* Alert: Nadchodzące wygaśnięcie */}
          {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Twoja subskrypcja wygasa za {daysUntilExpiry} dni
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Przedłuż lub zmień plan, aby utrzymać dostęp do funkcji.
                </p>
              </div>
            </div>
          )}

          {/* Alert: Zaplanowana zmiana */}
          {pendingPlanId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Masz zaplanowaną zmianę planu
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Nowy plan będzie aktywny od {endsAt && new Date(endsAt).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          )}

          {/* Alert: Brak zwrotów */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-3">
            <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">💡 Porada</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                Płatności nie podlegają zwrotowi. Downgrade będzie możliwy na koniec bieżącego
                okresu.
              </p>
            </div>
          </div>
        </div>

        {/* Grida planów */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <PlansGrid
            currentPlan={
              (status?.current_plan?.slug as any) ||
              'free'
            }
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
        )}

        {/* Modal */}
        <SubscriptionModal
          isOpen={showModal}
          onClose={handleCloseModal}
          selectedPlan={selectedPlan}
          onSuccess={() => {
            // Odśwież dane
          }}
        />

        {/* Info sekcja */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Zmiana bez opóźnień</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Zmień plan natychmiast lub zaplanuj zmianę na koniec okresu.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Skaluj z potrzebami</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upgrade'uj gdy rosniesz, downgrade'uj gdy potrzebujesz mniej.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Bez ukrytych opłat</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Przejrzyste ceny, wszystko jasne od pierwszego dnia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
