/**
 * Hook do zarządzania boost'ami
 */

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  initiateBoostCheckout,
  fetchUserBoosts,
  renewBoost as apiRenewBoost,
  cancelBoost as apiCancelBoost
} from '../utils/paymentHandler'
import type { Boost, BoostPurchaseRequest, BoostDuration } from '../types/boost'

export function useBoost() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Pobieranie boost'ów
  const {
    data: boosts = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['user-boosts'],
    queryFn: fetchUserBoosts,
    refetchInterval: 30000, // Odświeżaj co 30 sekund
    staleTime: 30000,
    onError: (err: any) => {
      setError(err?.message || 'Błąd przy pobieraniu boost')
    }
  })

  // Mutacja: zakup boost
  const purchaseMutation = useMutation({
    mutationFn: async (payload: BoostPurchaseRequest) => {
      setError(null)
      const result = await initiateBoostCheckout(payload)
      // Redirect do Stripe
      window.location.href = result.checkout_url
      return result
    },
    onError: (err: any) => {
      const message = err?.message || 'Błąd podczas zakupu'
      setError(message)
    }
  })

  // Mutacja: przedłużenie boost
  const renewMutation = useMutation({
    mutationFn: async ({ boostId, days }: { boostId: number; days: BoostDuration }) => {
      setError(null)
      return await apiRenewBoost(boostId, days)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-boosts'] })
    },
    onError: (err: any) => {
      const message = err?.message || 'Błąd przy przedłużeniu'
      setError(message)
    }
  })

  // Mutacja: anulowanie boost
  const cancelMutation = useMutation({
    mutationFn: async (boostId: number) => {
      setError(null)
      return await apiCancelBoost(boostId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-boosts'] })
    },
    onError: (err: any) => {
      const message = err?.message || 'Błąd przy anulowaniu'
      setError(message)
    }
  })

  // Helper: oblicz pozostałe dni
  const daysRemaining = useCallback((boost: Boost): number => {
    if (!boost.expires_at) return 0
    
    const expiresAt = new Date(boost.expires_at).getTime()
    const now = new Date().getTime()
    const distance = expiresAt - now
    
    if (distance <= 0) return 0
    
    return Math.ceil(distance / (1000 * 60 * 60 * 24))
  }, [])

  // Helper: sprawdź czy wygasa niedługo
  const isExpiringSoon = useCallback((boost: Boost): boolean => {
    return daysRemaining(boost) <= 7 && daysRemaining(boost) > 0
  }, [daysRemaining])

  // Helper: sprawdź czy już wygasł
  const isExpired = useCallback((boost: Boost): boolean => {
    return daysRemaining(boost) <= 0
  }, [daysRemaining])

  return {
    boosts,
    isLoading,
    isError,
    error,
    daysRemaining,
    isExpiringSoon,
    isExpired,
    purchaseBoost: purchaseMutation.mutate,
    renewBoost: renewMutation.mutate,
    cancelBoost: cancelMutation.mutate,
    refetch
  }
}
