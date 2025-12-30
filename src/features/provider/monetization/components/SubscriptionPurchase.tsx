/**
 * Komponent do wyboru i kupowania subskrypcji
 */

import React, { useState, useMemo } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { BILLING_PERIOD_LABELS } from '../types/subscription'
import type { BillingPeriod } from '../types/subscription'

export const SubscriptionPurchase: React.FC = () => {
  const { plans, error: hookError, purchaseSubscription, isLoading } = useSubscription()
  
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly')
  const [localError, setLocalError] = useState('')

  const selectedPlan = useMemo(
    () => plans.find(p => p.id === selectedPlanId),
    [selectedPlanId, plans]
  )

  const currentPrice = useMemo(() => {
    if (!selectedPlan) return 0
    return selectedPeriod === 'monthly'
      ? selectedPlan.price_monthly
      : selectedPlan.price_yearly
  }, [selectedPlan, selectedPeriod])

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!selectedPlanId) {
      setLocalError('Wybierz plan')
      return
    }

    purchaseSubscription({
      plan_id: selectedPlanId,
      billing_period: selectedPeriod
    })
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ładowanie planów...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handlePurchase} className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Plany Subskrypcji</h2>
        <p className="text-gray-600 mb-8">
          Wybierz plan, który najlepiej odpowiada Twoim potrzebom
        </p>

        {/* Grid planów */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                selectedPlanId === plan.id
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

              {/* Toggle okresu */}
              <div className="flex gap-2 mb-4">
                {(['monthly', 'yearly'] as BillingPeriod[]).map(period => (
                  <button
                    key={period}
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedPeriod(period)
                    }}
                    className={`flex-1 text-sm py-1 rounded transition ${
                      selectedPeriod === period
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {BILLING_PERIOD_LABELS[period]}
                  </button>
                ))}
              </div>

              {/* Cena */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-teal-600">
                  {(selectedPeriod === 'monthly'
                    ? plan.price_monthly
                    : plan.price_yearly
                  ).toFixed(2)}{' '}
                  PLN
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPeriod === 'monthly' ? 'na miesiąc' : 'na rok'}
                </p>
              </div>

              {/* Cechy */}
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sekcja checkout */}
      {selectedPlan && (
        <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 max-w-md">
          <h3 className="text-xl font-bold mb-4">Podsumowanie Zamówienia</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Okres:</span>
              <span className="font-semibold">{BILLING_PERIOD_LABELS[selectedPeriod]}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Razem:</span>
              <span className="text-teal-600">{currentPrice.toFixed(2)} PLN</span>
            </div>
          </div>

          {/* Wyświetlanie błędów */}
          {(localError || hookError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
              {localError || hookError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Przetwarzanie...' : 'Zapłać teraz'}
          </button>
        </div>
      )}
    </form>
  )
}
