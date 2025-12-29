import React from 'react';
import { PLAN_LIMITS, PlanType } from '../constants/planLimits';
import { AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { SectionTitle, Text, Caption, StatValue } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

interface OrderSummaryProps {
  fromPlan: PlanType;
  toPlan: PlanType;
  billingPeriod?: 'monthly' | 'yearly';
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  fromPlan, 
  toPlan,
  billingPeriod = 'monthly'
}) => {
  const toLimit = PLAN_LIMITS[toPlan];
  const fromLimit = PLAN_LIMITS[fromPlan];
  
  const monthlyPrice = toLimit.monthlyPrice || 0;
  const yearlyPrice = monthlyPrice * 12;
  const displayPrice = billingPeriod === 'yearly' ? yearlyPrice : monthlyPrice;
  const monthlyAfterYearly = billingPeriod === 'yearly' ? monthlyPrice : 0;

  // VAT calculation (23% in Poland)
  const vat = Math.round(displayPrice * 0.23 * 100) / 100;
  const total = Math.round((displayPrice + vat) * 100) / 100;

  const isUpgrade = monthlyPrice > (fromLimit.monthlyPrice || 0);
  const priceChange = monthlyPrice - (fromLimit.monthlyPrice || 0);

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card className="p-8 border-2 border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 rounded-xl">
            <ShoppingCart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1">
            <SectionTitle className="mb-1">Podsumowanie zamówienia</SectionTitle>
            <Text muted size="sm">Przejrzystość kosztów, brak ukrytych opłat</Text>
          </div>
        </div>

        {/* Plan Change */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <Caption className="font-semibold text-slate-700 dark:text-slate-400">Zmiana planu</Caption>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-400 capitalize">{fromPlan}</span>
              <span className="text-slate-400">→</span>
              <span className="text-sm font-bold capitalize bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {toPlan}
              </span>
            </div>
          </div>
          {isUpgrade && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <Text size="sm" className="text-emerald-700 dark:text-emerald-300">
                Upgrade twojego planu - będziesz mieć dostęp do nowych funkcji natychmiast!
              </Text>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <Caption className="text-slate-700 dark:text-slate-400">
              {billingPeriod === 'yearly' ? 'Roczna cena netto' : 'Miesięczna cena netto'}
            </Caption>
            <StatValue className="text-lg">
              {displayPrice.toFixed(2)} PLN
            </StatValue>
          </div>

          <div className="flex justify-between">
            <Caption className="text-slate-700 dark:text-slate-400">VAT (23%)</Caption>
            <Caption className="text-slate-700 dark:text-slate-400">
              +{vat.toFixed(2)} PLN
            </Caption>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <SectionTitle className="text-base">
              {billingPeriod === 'yearly' ? 'Roczna cena brutto' : 'Miesięczna cena brutto'}
            </SectionTitle>
            <StatValue className="text-2xl text-cyan-600 dark:text-cyan-400">
              {total.toFixed(2)} PLN
            </StatValue>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <Text size="sm" className="text-slate-600 dark:text-slate-400">
              <strong>Automatyczne odnowienie:</strong> Subskrypcja będzie automatycznie odnawiana {billingPeriod === 'yearly' ? 'rocznie' : 'co miesiąc'}. Możesz anulować w każdej chwili bez kar.
            </Text>
          </div>

          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <Text size="sm" className="text-slate-600 dark:text-slate-400">
              <strong>Faktura:</strong> Automatycznie wyślemy Ci fakturę VAT na podany email. Dostępna w panelu providera.
            </Text>
          </div>

          {billingPeriod === 'yearly' && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <Text size="sm" className="text-green-700 dark:text-green-300">
                <strong>💰 Oszczędzasz:</strong> {((monthlyPrice * 12 * 0.12) / 2).toFixed(2)} PLN rocznie (10% zniżka)
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* First Payment Info */}
      <Card className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">📅 Pierwsza opłata</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Opłata wejdzie dzisiaj. Następna opłata będzie za {billingPeriod === 'yearly' ? '365 dni' : '30 dni'}.
            </p>
          </div>
        </div>
      </Card>

      {/* Plan Features Comparison */}
      <div className="space-y-4">
        <SectionTitle className="text-base">Co Ci się zmienia?</SectionTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-red-400">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase">Aktualne limity</p>
            <ul className="space-y-1 text-sm">
              <li className="text-slate-700 dark:text-slate-300">
                • <strong>{fromLimit.maxServices}</strong> usług
              </li>
              <li className="text-slate-700 dark:text-slate-300">
                • <strong>{fromLimit.maxPhotosPerService}</strong> zdjęć/usługa
              </li>
              <li className="text-slate-700 dark:text-slate-300">
                • Portfolio: <strong>{fromLimit.maxPortfolioPhotos}</strong>
              </li>
              {!fromLimit.analytics && <li className="text-slate-500 dark:text-slate-500">❌ Brak analityki</li>}
              {!fromLimit.subdomain && <li className="text-slate-500 dark:text-slate-500">❌ Bez subdomeny</li>}
            </ul>
          </Card>

          <Card className="p-4 border-l-4 border-emerald-400">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase">Nowe limity</p>
            <ul className="space-y-1 text-sm">
              <li className="text-emerald-700 dark:text-emerald-300">
                • <strong>{toLimit.maxServices === 999 ? '∞' : toLimit.maxServices}</strong> usług {toLimit.maxServices > fromLimit.maxServices && '✨'}
              </li>
              <li className="text-emerald-700 dark:text-emerald-300">
                • <strong>{toLimit.maxPhotosPerService === 999 ? '∞' : toLimit.maxPhotosPerService}</strong> zdjęć/usługa {toLimit.maxPhotosPerService > fromLimit.maxPhotosPerService && '✨'}
              </li>
              <li className="text-emerald-700 dark:text-emerald-300">
                • Portfolio: <strong>{toLimit.maxPortfolioPhotos === 999 ? '∞' : toLimit.maxPortfolioPhotos}</strong> {toLimit.maxPortfolioPhotos > fromLimit.maxPortfolioPhotos && '✨'}
              </li>
              {toLimit.analytics && !fromLimit.analytics && <li className="text-emerald-700 dark:text-emerald-300">✅ Pełna analityka</li>}
              {toLimit.subdomain && !fromLimit.subdomain && <li className="text-emerald-700 dark:text-emerald-300">✅ Twoja subdomena</li>}
              {toLimit.dedicatedManager && <li className="text-emerald-700 dark:text-emerald-300">✅ Dedykowany manager</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
