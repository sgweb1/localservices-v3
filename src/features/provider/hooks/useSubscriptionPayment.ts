/**
 * Hook do zarządzania subskrypcjami
 */

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  initiateSubscriptionCheckout,
  fetchSubscriptionPlans,
  fetchActiveSubscription
} from '../utils/paymentHandler'
import type { SubscriptionPlan, Subscription, SubscriptionPurchaseRequest } from '../types/subscription'

export function useSubscription() {
  const [error, setError] = useState<string | null>(null)

  // Pobieranie planów
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: fetchSubscriptionPlans,
    staleTime: 60000,
    onError: (err: any) => {
      setError(err?.message || 'Błąd przy pobieraniu planów')
    }
  })

  // Pobieranie aktywnej subskrypcji
  const { data: activeSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: fetchActiveSubscription,
    refetchInterval: 30000,
    staleTime: 30000
  })

  // Mutacja: zakup subskrypcji
  const purchaseMutation = useMutation({
    mutationFn: async (payload: SubscriptionPurchaseRequest) => {
      setError(null)
      const result = await initiateSubscriptionCheckout(payload)
      // Redirect do Stripe
      window.location.href = result.checkout_url
      return result
    },
    onError: (err: any) => {
      const message = err?.message || 'Błąd podczas zakupu'
      setError(message)
    }
  })

  return {
    plans,
    activeSubscription,
    isLoading: plansLoading || subscriptionLoading,
    error,
    purchaseSubscription: purchaseMutation.mutate
  }
}
