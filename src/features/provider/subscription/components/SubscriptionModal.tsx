import React, { useState } from 'react';
import { useSubscription, SubscriptionPlan } from '../hooks/useSubscription';
import { usePayment } from '../hooks/usePayment';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { X, AlertCircle, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: SubscriptionPlan | null;
  onSuccess?: () => void;
}

type ChangeMode = 'now' | 'end-of-period';

/**
 * Modal do upgradu/zmiany subskrypcji
 * Pokazuje:
 * - Podsumowanie wybranego planu
 * - Opcje: natychmiast (HARD) lub na koniec okresu (SOFT)
 * - Warunki: brak zwrotów
 * - PayU payment form dla HARD opcji
 */
export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSuccess,
}) => {
  const { status, scheduleChange, scheduleChangeLoading } = useSubscription();
  const { createPayUOrder, isCreatingPayUOrder } = usePayment();
  const [changeMode, setChangeMode] = useState<ChangeMode>('now');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !selectedPlan) return null;

  const currentPlan = status?.current_plan;
  const endsAt = status?.subscription_ends_at;

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      setIsProcessing(true);

      if (changeMode === 'now') {
        // HARD upgrade - natychmiastowy, wymaga płatności PayU
        const returnUrl = `${window.location.origin}/subscription/payment-success`;
        
        createPayUOrder({
          subscriptionPlanId: selectedPlan.id,
          returnUrl,
        });
      } else {
        // SOFT - zaplanuj na koniec okresu (bez płatności tutaj)
        scheduleChange(selectedPlan.id);

        // Po sukcesie zamknij modal
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      toast.error('Coś poszło nie tak');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading =
    isCreatingPayUOrder || scheduleChangeLoading || isProcessing;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div>
            <SectionTitle className="text-2xl mb-1">Potwierdzenie upgradu</SectionTitle>
            <Text muted size="sm">
              Przejdź na plan {selectedPlan.name} i odbierz nowe funkcje
            </Text>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Podsumowanie Planu */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Plan Obecny */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                <Text size="sm" muted className="mb-2">
                  Obecny plan
                </Text>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentPlan?.name || 'Brak'}
                </div>
                {currentPlan?.price && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {currentPlan.price} PLN/miesiąc
                  </div>
                )}
              </div>

              {/* Plan Docelowy */}
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <Text size="sm" muted className="mb-2">
                  Nowy plan
                </Text>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {selectedPlan.name}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300 mt-1 font-semibold">
                  {selectedPlan.price} PLN/miesiąc
                </div>
              </div>
            </div>

            {/* Nowe funkcje */}
            <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
              <Text size="sm" className="font-semibold mb-3">
                Zyskasz dostęp do:
              </Text>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedPlan.limits.max_services} usług (zamiast{' '}
                    {currentPlan?.limits?.max_services || 1})
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedPlan.limits.max_photos_per_service} zdjęć per usługa
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Portfolio: {selectedPlan.limits.max_portfolio_photos} zdjęć
                  </span>
                </li>
                {selectedPlan.features.has_subdomain && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-slate-700 dark:text-slate-300">Własna subdomena</span>
                  </li>
                )}
                {selectedPlan.features.has_calendar && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-slate-700 dark:text-slate-300">Kalendarz dostępności</span>
                  </li>
                )}
                {selectedPlan.analytics_level !== 'none' && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Analityka ({selectedPlan.analytics_level})
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Data startu */}
          <div className="space-y-3">
            <Text className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Kiedy wejdzie w życie zmiana?
            </Text>

            <div className="space-y-2">
              {/* Opcja 1: Natychmiast (HARD) */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                <input
                  type="radio"
                  name="changeMode"
                  value="now"
                  checked={changeMode === 'now'}
                  onChange={() => setChangeMode('now')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Natychmiast
                  </div>
                  <Text size="sm" muted>
                    Zmiana obowiązuje od razu. Płacisz już teraz.
                  </Text>
                </div>
              </label>

              {/* Opcja 2: Na koniec okresu (SOFT) */}
              {endsAt && (
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                  <input
                    type="radio"
                    name="changeMode"
                    value="end-of-period"
                    checked={changeMode === 'end-of-period'}
                    onChange={() => setChangeMode('end-of-period')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      Na koniec okresu
                    </div>
                    <Text size="sm" muted>
                      Zmiana obowiązuje od {new Date(endsAt).toLocaleDateString('pl-PL')}. Bieżący
                      plan pozostanie aktywny.
                    </Text>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Ostrzeżenie o braku zwrotów */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-1">⚠️ Brak zwrotów</p>
              <p>
                Płatności za subskrypcje nie podlegają zwrotowi. Jeśli zmienisz plan na niższy,
                zmiana obowiązuje od końca bieżącego okresu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Anuluj
          </Button>
          <Button
            variant="primary"
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Przetwarzanie...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                {changeMode === 'now' ? 'Upgrade Teraz' : 'Zaplanuj Zmianę'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
