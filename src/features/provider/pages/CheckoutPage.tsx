import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubscription } from '../dashboard/hooks/useSubscription';
import { useCheckout } from '../subscription/hooks/useCheckout';
import { PLAN_LIMITS, PlanType } from '../subscription/constants/planLimits';
import { OrderSummary } from '../subscription/components/OrderSummary';
import { PageTitle, Text, SectionTitle, Caption } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Checkout page
 * /provider/subscription/checkout/:planId
 */
export const CheckoutPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: subData, isLoading: subLoading } = useSubscription();
  const checkoutMutation = useCheckout();

  const currentPlan = subData?.data?.plan || 'free';
  const selectedPlan = (planId || 'free') as PlanType;

  // Form state
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: 'Polska',
    city: '',
    postalCode: '',
    address: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Pełna nazwa jest wymagana';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Wpisz poprawny email';
    if (!formData.city.trim()) errors.city = 'Miasto jest wymagane';
    if (!formData.postalCode.trim()) errors.postalCode = 'Kod pocztowy jest wymagany';
    if (!formData.address.trim()) errors.address = 'Adres jest wymagany';
    if (!agreedToTerms) errors.terms = 'Musisz zaakceptować warunki';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (selectedPlan === currentPlan) {
      setFormErrors({ submit: 'Już masz ten plan' });
      return;
    }

    checkoutMutation.mutate({
      planId: selectedPlan,
      billingPeriod,
      billingAddress: formData,
    });
  };

  if (subLoading) {
    return <div className="p-8 text-center">Ładowanie...</div>;
  }

  if (!PLAN_LIMITS[selectedPlan]) {
    return <div className="p-8 text-center text-red-600">Nieznany plan</div>;
  }

  const planInfo = PLAN_LIMITS[selectedPlan];

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/provider/subscription/plans')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do planów
        </Button>
        <PageTitle gradient>Potwierdzenie zamówienia</PageTitle>
        <Text muted size="sm" className="mt-2">
          Plan: <span className="font-semibold capitalize text-cyan-600">{selectedPlan}</span>
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {formErrors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{formErrors.submit}</p>
                </div>
              </div>
            )}

            {/* Billing Period */}
            <div>
              <SectionTitle className="text-sm mb-3">Okres rozliczeniowy</SectionTitle>
              <div className="flex gap-3">
                {['monthly', 'yearly'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setBillingPeriod(period as 'monthly' | 'yearly')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      billingPeriod === period
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white capitalize">
                      {period === 'monthly' ? 'Miesięczny' : 'Roczny'}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {period === 'monthly'
                        ? `${planInfo.monthlyPrice || 0} PLN/m`
                        : `${(planInfo.monthlyPrice || 0) * 12} PLN/r`}
                    </div>
                    {period === 'yearly' && (
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">
                        -10% 💰
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <SectionTitle className="text-sm mb-3">Dane osobowe</SectionTitle>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pełna nazwa *
                  </label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                    }}
                    placeholder="Jan Kowalski"
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    placeholder="jan@firma.pl"
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <SectionTitle className="text-sm mb-3">Adres rozliczeniowy</SectionTitle>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kraj
                  </label>
                  <Input
                    type="text"
                    value={formData.country}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Miasto *
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                      }}
                      placeholder="Warszawa"
                      error={!!formErrors.city}
                      helperText={formErrors.city}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Kod pocztowy *
                    </label>
                    <Input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => {
                        setFormData({ ...formData, postalCode: e.target.value });
                        if (formErrors.postalCode) setFormErrors({ ...formErrors, postalCode: '' });
                      }}
                      placeholder="00-001"
                      error={!!formErrors.postalCode}
                      helperText={formErrors.postalCode}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ulica i numer domu *
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                    }}
                    placeholder="ul. Główna 1/1"
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (formErrors.terms) setFormErrors({ ...formErrors, terms: '' });
                  }}
                  className="mt-1"
                />
                <Text size="sm">
                  Zgadzam się z{' '}
                  <a href="/terms" className="text-cyan-600 hover:underline">
                    warunkami użytkowania
                  </a>
                  {' '}i{' '}
                  <a href="/privacy" className="text-cyan-600 hover:underline">
                    polityką prywatności
                  </a>
                  . Zrozumiałem, że subskrypcja będzie automatycznie odnawiana.
                </Text>
              </label>
              {formErrors.terms && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">{formErrors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={checkoutMutation.isPending}
              className="w-full"
            >
              {checkoutMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Przygotowywanie sesji płatności...
                </>
              ) : (
                <>
                  Przejdź do płatności
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="sticky top-8 h-fit">
          <OrderSummary
            fromPlan={currentPlan as PlanType}
            toPlan={selectedPlan}
            billingPeriod={billingPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
