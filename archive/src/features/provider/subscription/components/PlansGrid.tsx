import React from 'react';
import { PLAN_LIMITS, PlanType } from '../constants/planLimits';
import { Check, Crown, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text, Caption, StatValue } from '@/components/ui/typography';

interface PlansGridProps {
  currentPlan?: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  isLoading?: boolean;
}

export const PlansGrid: React.FC<PlansGridProps> = ({ 
  currentPlan = 'free', 
  onSelectPlan,
  isLoading = false,
}) => {
  const plans: PlanType[] = ['free', 'basic', 'pro', 'premium'];

  const planColors: Record<PlanType, string> = {
    free: 'slate',
    basic: 'blue',
    pro: 'cyan',
    premium: 'purple',
  };

  const planIcons: Record<PlanType, React.ReactNode> = {
    free: null,
    basic: <Zap className="w-5 h-5" />,
    pro: <TrendingUp className="w-5 h-5" />,
    premium: <Crown className="w-5 h-5" />,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <SectionTitle className="text-3xl mb-2">Wybierz swój plan</SectionTitle>
        <Text muted size="sm">Zmień plan w każdej chwili, bez kar ani zobowiązań</Text>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const isCurrentPlan = plan === currentPlan;
          const colorClass = planColors[plan];
          const isFeatured = plan === 'pro';

          return (
            <div
              key={plan}
              className={`glass-card rounded-2xl p-6 border-2 transition-all ${
                isCurrentPlan
                  ? `border-${colorClass}-500 shadow-lg shadow-${colorClass}-500/20`
                  : isFeatured
                  ? `border-cyan-300 dark:border-cyan-700 shadow-lg shadow-cyan-500/10`
                  : `border-slate-200 dark:border-slate-700 hover:border-${colorClass}-300`
              } ${isFeatured ? 'lg:scale-105 lg:z-10' : ''}`}
            >
              {/* Badge */}
              {limits.badge && (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full mb-3 text-xs font-semibold ${
                  plan === 'pro' 
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {planIcons[plan] && <span className="mr-1">{planIcons[plan]}</span>}
                  {limits.badge}
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                <h3 className={`text-xl font-bold capitalize mb-2 ${
                  plan === 'premium' ? 'text-purple-600 dark:text-purple-400' :
                  plan === 'pro' ? 'text-cyan-600 dark:text-cyan-400' :
                  plan === 'basic' ? 'text-blue-600 dark:text-blue-400' :
                  'text-slate-900 dark:text-slate-100'
                }`}>
                  {plan}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 h-8">
                  {limits.description}
                </p>
              </div>

              {/* Price */}
              {limits.monthlyPrice === null ? (
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Darmowy</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Zawsze</div>
                </div>
              ) : (
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {limits.monthlyPrice}
                    <span className="text-sm text-slate-600 dark:text-slate-400"> PLN</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">/miesiąc</div>
                </div>
              )}

              {/* Limits */}
              <div className="mb-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {limits.maxServices === 999 ? '∞' : limits.maxServices} usług
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {limits.maxServices === 999 ? 'Bez limitów' : `Maksymalnie ${limits.maxServices}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {limits.maxPhotosPerService === 999 ? '∞' : limits.maxPhotosPerService} zdjęć/usługa
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {limits.maxPhotosPerService === 999 ? 'Bez limitów' : `Do ${limits.maxPhotosPerService} per usługa`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      Portfolio {limits.maxPortfolioPhotos === 999 ? '∞' : limits.maxPortfolioPhotos}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {limits.maxPortfolioPhotos === 999 ? 'Bez limitów' : `Łącznie ${limits.maxPortfolioPhotos}`}
                    </div>
                  </div>
                </div>

                {limits.subdomain && (
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Subdomena</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Twoja unikalna strona</div>
                    </div>
                  </div>
                )}

                {limits.analytics && (
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Analityka</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Pełne statystyki 24/7</div>
                    </div>
                  </div>
                )}

                {limits.dedicatedManager && (
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Dedykowany manager</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Osobista wsparcie</div>
                    </div>
                  </div>
                )}

                {limits.apiAccess && (
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">API dostęp</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Integracje i automatyzacja</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Button */}
              <Button
                onClick={() => onSelectPlan(plan)}
                disabled={isLoading || isCurrentPlan}
                variant={isCurrentPlan ? 'outline' : isFeatured ? 'primary' : 'outline'}
                size="md"
                className="w-full"
              >
                {isCurrentPlan ? (
                  <>
                    <Check className="w-4 h-4" />
                    Aktualny plan
                  </>
                ) : (
                  <>
                    Wybierz plan
                  </>
                )}
              </Button>

              {/* Annual savings badge */}
              {plan === 'premium' && (
                <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                    💰 Rocznie: 2388 PLN
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ / Info */}
      <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <SectionTitle className="text-lg mb-4">Pytania?</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">🔄 Zmiana planu</p>
            <p className="text-slate-600 dark:text-slate-400">Zmień plan w dowolnej chwili. Rozliczymy Ci zmianę proporcjonalnie.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">❌ Anulowanie</p>
            <p className="text-slate-600 dark:text-slate-400">Anuluj subskrypcję bez kar. Dostęp będzie dostępny do końca okresu.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">📧 Faktury</p>
            <p className="text-slate-600 dark:text-slate-400">Automatyczne faktury VAT na każdą opłatę, dostępne w panelu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansGrid;
