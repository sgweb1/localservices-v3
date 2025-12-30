# ⚠️ DEPRECATED - Patrz nowe dokumenty

**Nowe lokalizacje:**
- [PHASE_6_README.md](PHASE_6_README.md) - Overview
- [PHASE_6_IMPLEMENTATION.md](PHASE_6_IMPLEMENTATION.md) - Szczegóły
- [PHASE_6_ENVIRONMENT.md](PHASE_6_ENVIRONMENT.md) - Setup
- [INDEX.md](INDEX.md) - Mapa dokumentacji

---

# ~~Phase 6 Plan — Frontend UI & Stripe Integration~~

**Stary plik - archiwum referencyjne**

## 📋 Phase 6 Overview

Implementacja frontend'u dla systemu Boost'ów i Subskrypcji w **React + TypeScript**. Podłączenie Stripe.js, obsługa płatności, success/cancel pages, real-time countdown timers.

### Objectives

| # | Objective | Priority | Effort | Status |
|---|-----------|----------|--------|--------|
| 1 | React components dla BoostPurchase | CRITICAL | 1.5 dni | ⏳ |
| 2 | React components dla SubscriptionPurchase | CRITICAL | 1.5 dni | ⏳ |
| 3 | Stripe.js integration | CRITICAL | 1 dzień | ⏳ |
| 4 | Success/Cancel page handling | HIGH | 0.5 dnia | ⏳ |
| 5 | Countdown timers + real-time | HIGH | 0.5 dnia | ⏳ |
| 6 | Feature tests (E2E) | HIGH | 1 dzień | ⏳ |
| 7 | Documentation + commit | MEDIUM | 0.5 dnia | ⏳ |
| **Total** | | | **6.5 dni** | |

---

## 📁 Phase 6 Architecture

### Folder Structure (React + TypeScript)

```
src/
├── features/
│   └── provider/
│       ├── monetization/
│       │   ├── components/
│       │   │   ├── BoostPurchase.tsx          (NEW)
│       │   │   ├── BoostList.tsx              (NEW)
│       │   │   ├── BoostDetail.tsx            (NEW)
│       │   │   ├── BoostRenew.tsx             (NEW)
│       │   │   ├── SubscriptionPurchase.tsx   (NEW)
│       │   │   ├── SubscriptionList.tsx       (NEW)
│       │   │   ├── SubscriptionDetail.tsx     (NEW)
│       │   │   ├── SuccessModal.tsx           (NEW)
│       │   │   └── ErrorModal.tsx             (NEW)
│       │   ├── hooks/
│       │   │   ├── useBoost.ts                (NEW)
│       │   │   ├── useSubscription.ts         (NEW)
│       │   │   ├── useStripe.ts               (NEW)
│       │   │   └── useCountdown.ts            (NEW)
│       │   ├── types/
│       │   │   ├── boost.ts                   (NEW)
│       │   │   ├── subscription.ts            (NEW)
│       │   │   └── stripe.ts                  (NEW)
│       │   ├── utils/
│       │   │   ├── stripeClient.ts            (NEW)
│       │   │   ├── paymentHandler.ts          (NEW)
│       │   │   └── dateUtils.ts               (NEW)
│       │   └── pages/
│       │       ├── BoostMarketplace.tsx       (NEW)
│       │       ├── SubscriptionPlans.tsx      (NEW)
│       │       ├── CheckoutSuccess.tsx        (NEW)
│       │       └── CheckoutCancel.tsx         (NEW)
│       └── subscription/ (existing)
│           └── pages/
│               ├── PaymentSuccessPage.tsx (updated - integrate with Phase 6)
│               └── SubscriptionPage.tsx (updated - integrate with Phase 6)
└── lib/
    └── api-client.ts                          (existing - Axios instance)
```

### Tech Stack

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^1.46.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-query": "^3.39.0",
    "react-router-dom": "^6.18.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "devDependencies": {
    "vitest": "^0.34.0",
    "playwright": "^1.40.0"
  }
}
```

---

## 🛒 6.1 BoostPurchase Component

### Purpose

React component for purchasing boosts (City Boost or Spotlight). Handles form validation, pricing calculation, and Stripe checkout initiation.

### Types Definition

**File:** `src/features/provider/monetization/types/boost.ts`

```typescript
export type BoostType = 'city_boost' | 'spotlight'
export type BoostDuration = 7 | 14 | 30

export interface BoostPurchaseRequest {
  type: BoostType
  days: BoostDuration
  city?: string
  category?: string
}

export interface Boost {
  id: number
  provider_id: number
  type: BoostType
  city?: string
  category?: string
  expires_at: string
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const BOOST_PRICES: Record<BoostType, Record<BoostDuration, number>> = {
  city_boost: {
    7: 9.99,
    14: 19.99,
    30: 29.99
  },
  spotlight: {
    7: 14.99,
    14: 24.99,
    30: 39.99
  }
}
```

### Component Implementation

**File:** `src/features/provider/monetization/components/BoostPurchase.tsx`

```tsx
import React, { useState } from 'react'
import { useBoost } from '../hooks/useBoost'
import { BOOST_PRICES } from '../types/boost'
import type { BoostType, BoostDuration } from '../types/boost'

interface BoostPurchaseProps {
  initialType?: BoostType
  preSelectedCity?: string
  preSelectedCategory?: string
  onSuccess?: () => void
}

export const BoostPurchase: React.FC<BoostPurchaseProps> = ({
  initialType = 'city_boost',
  preSelectedCity = '',
  preSelectedCategory = '',
  onSuccess
}) => {
  const { purchaseBoost, isLoading, error } = useBoost()

  const [type, setType] = useState<BoostType>(initialType)
  const [city, setCity] = useState(preSelectedCity)
  const [category, setCategory] = useState(preSelectedCategory)
  const [days, setDays] = useState<BoostDuration>(7)
  const [localError, setLocalError] = useState('')

  const isValid = type === 'city_boost' ? city.trim().length > 0 : category.trim().length > 0
  const price = BOOST_PRICES[type][days]

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!isValid) {
      setLocalError('Uzupełnij wszystkie wymagane pola')
      return
    }

    try {
      await purchaseBoost({
        type,
        days,
        city: type === 'city_boost' ? city : undefined,
        category: type === 'spotlight' ? category : undefined
      })
      onSuccess?.()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Błąd podczas zakupu')
    }
  }

  return (
    <form onSubmit={handlePurchase} className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-teal-600 mb-2">Kup Boost</h2>
      <p className="text-gray-600 mb-6">Zwiększ widoczność na 7, 14 lub 30 dni</p>

      {/* Type Selector */}
      <div className="mb-6 flex gap-3">
        {(['city_boost', 'spotlight'] as BoostType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 px-4 py-2 rounded font-medium transition ${
              type === t ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t === 'city_boost' ? 'Miasto' : 'Spotlight'}
          </button>
        ))}
      </div>

      {/* Location Input */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">
          {type === 'city_boost' ? 'Miasto' : 'Kategoria'}
        </label>
        {type === 'city_boost' ? (
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="np. Warszawa"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        ) : (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Wybierz kategorię</option>
            <option value="elektryk">Elektryk</option>
            <option value="hydraulik">Hydraulik</option>
            <option value="malarz">Malarz</option>
            <option value="snycerz">Ślusarz</option>
          </select>
        )}
      </div>

      {/* Duration Buttons */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-3">Długość boost'a</label>
        <div className="grid grid-cols-3 gap-2">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d as BoostDuration)}
              className={`p-3 rounded border-2 text-center transition ${
                days === d
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-300 hover:border-teal-300'
              }`}
            >
              <div className="font-bold text-lg">{d}d</div>
              <div className="text-sm text-gray-600">{BOOST_PRICES[type][d as BoostDuration]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Typ:</span>
          <span className="font-semibold">{type === 'city_boost' ? 'City Boost' : 'Spotlight'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Lokalizacja:</span>
          <span className="font-semibold">{city || category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Dni:</span>
          <span className="font-semibold">{days}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold text-teal-600">
          <span>Razem:</span>
          <span>{price.toFixed(2)} PLN</span>
        </div>
      </div>

      {/* Error Display */}
      {(localError || error) && (
        <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {localError || error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Przetwarzanie...' : 'Przejdź do płatności'}
      </button>
    </form>
  )
}
```

---

## 📦 6.2 SubscriptionPurchase Component

**File:** `src/features/provider/monetization/components/SubscriptionPurchase.tsx`

```tsx
import React, { useState, useMemo } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import type { SubscriptionPlan } from '../types/subscription'

export const SubscriptionPurchase: React.FC = () => {
  const { plans, purchaseSubscription, isLoading } = useSubscription()
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const selectedPlan = useMemo(
    () => plans.find(p => p.id === selectedPlanId),
    [selectedPlanId, plans]
  )

  const handlePurchase = async () => {
    if (!selectedPlanId) return
    await purchaseSubscription({
      plan_id: selectedPlanId,
      billing_period: selectedPeriod
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Plany Subskrypcji</h2>
        <p className="text-gray-600 mb-8">Wybierz plan, który najlepiej odpowiada Twoim potrzebom</p>

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

              {/* Period Toggle */}
              <div className="flex gap-2 mb-4">
                {['monthly', 'yearly'].map(period => (
                  <button
                    key={period}
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedPeriod(period as 'monthly' | 'yearly')
                    }}
                    className={`flex-1 text-sm py-1 rounded transition ${
                      selectedPeriod === period
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'monthly' ? 'Miesiąc' : 'Rok'}
                  </button>
                ))}
              </div>

              {/* Price */}
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

              {/* Features */}
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

      {/* Checkout Section */}
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
              <span className="font-semibold">
                {selectedPeriod === 'monthly' ? 'Miesiąc' : 'Rok'}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Razem:</span>
              <span className="text-teal-600">
                {(selectedPeriod === 'monthly'
                  ? selectedPlan.price_monthly
                  : selectedPlan.price_yearly
                ).toFixed(2)}{' '}
                PLN
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Przetwarzanie...' : 'Zapłać teraz'}
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 💳 6.3 Stripe Integration

### Stripe Client

**File:** `src/features/provider/monetization/utils/stripeClient.ts`

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripeInstance: Stripe | null = null

export async function getStripeInstance(): Promise<Stripe | null> {
  if (!stripeInstance) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
    if (!publishableKey) {
      throw new Error('VITE_STRIPE_PUBLIC_KEY not configured')
    }
    stripeInstance = await loadStripe(publishableKey)
  }
  return stripeInstance
}
```

### Payment Handler

**File:** `src/features/provider/monetization/utils/paymentHandler.ts`

```typescript
import axios from 'axios'
import type { BoostPurchaseRequest, SubscriptionPurchaseRequest } from '../types'

export async function initiateBoostCheckout(payload: BoostPurchaseRequest) {
  const { data } = await axios.post('/api/v1/boosts/purchase', payload)
  return data.data // { checkout_url, session_id, ...}
}

export async function initiateSubscriptionCheckout(payload: SubscriptionPurchaseRequest) {
  const { data } = await axios.post('/api/v1/subscriptions/purchase', payload)
  return data.data
}

export async function confirmPayment(sessionId: string, type: 'boost' | 'subscription') {
  const endpoint = type === 'boost'
    ? `/api/v1/boosts/success?session_id=${sessionId}`
    : `/api/v1/subscriptions/success?session_id=${sessionId}`

  const { data } = await axios.get(endpoint)
  return data.data
}
```

### useBoost Hook

**File:** `src/features/provider/monetization/hooks/useBoost.ts`

```typescript
import { useState, useCallback } from 'react'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import { initiateBoostCheckout } from '../utils/paymentHandler'
import type { Boost, BoostPurchaseRequest, BoostDuration } from '../types/boost'

export function useBoost() {
  const [error, setError] = useState<string | null>(null)

  const { data: boosts = [], isLoading, refetch } = useQuery(
    'boosts',
    async () => {
      const { data } = await axios.get('/api/v1/boosts')
      return data.data as Boost[]
    },
    { refetchInterval: 30000 }
  )

  const purchaseMutation = useMutation(
    async (payload: BoostPurchaseRequest) => {
      const result = await initiateBoostCheckout(payload)
      window.location.href = result.checkout_url
      return result
    },
    {
      onError: (err: any) => {
        const message = err?.response?.data?.message || 'Błąd podczas zakupu'
        setError(message)
      }
    }
  )

  const daysRemaining = useCallback((boost: Boost): number => {
    if (!boost.expires_at) return 0
    const expiresAt = new Date(boost.expires_at).getTime()
    const now = new Date().getTime()
    return Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
  }, [])

  const isExpiringSoon = useCallback((boost: Boost): boolean => {
    return daysRemaining(boost) <= 7
  }, [daysRemaining])

  const renewBoost = useCallback(async (boostId: number, days: BoostDuration) => {
    try {
      const { data } = await axios.put(`/api/v1/boosts/${boostId}/renew`, { days })
      await refetch()
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Błąd podczas przedłużenia')
    }
  }, [refetch])

  const cancelBoost = useCallback(async (boostId: number) => {
    try {
      await axios.delete(`/api/v1/boosts/${boostId}`)
      await refetch()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Błąd podczas anulowania')
    }
  }, [refetch])

  return {
    boosts,
    isLoading,
    error,
    daysRemaining,
    isExpiringSoon,
    purchaseBoost: purchaseMutation.mutate,
    renewBoost,
    cancelBoost,
    refetch
  }
}
```

### useSubscription Hook

**File:** `src/features/provider/monetization/hooks/useSubscription.ts`

```typescript
import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import { initiateSubscriptionCheckout } from '../utils/paymentHandler'
import type { SubscriptionPlan, Subscription, SubscriptionPurchaseRequest } from '../types/subscription'

export function useSubscription() {
  const [error, setError] = useState<string | null>(null)

  const { data: plans = [] } = useQuery('subscription-plans', async () => {
    const { data } = await axios.get('/api/v1/subscription-plans')
    return data.data as SubscriptionPlan[]
  })

  const { data: activeSubscription } = useQuery('active-subscription', async () => {
    try {
      const { data } = await axios.get('/api/v1/subscriptions/active')
      return data.data as Subscription
    } catch {
      return null
    }
  })

  const purchaseMutation = useMutation(
    async (payload: SubscriptionPurchaseRequest) => {
      const result = await initiateSubscriptionCheckout(payload)
      window.location.href = result.checkout_url
      return result
    },
    {
      onError: (err: any) => {
        setError(err?.response?.data?.message || 'Błąd podczas zakupu')
      }
    }
  )

  return {
    plans,
    activeSubscription,
    error,
    isLoading: purchaseMutation.isLoading,
    purchaseSubscription: purchaseMutation.mutate
  }
}
```

---

## ✅ 6.4 Success & Cancel Pages

### CheckoutSuccess Page

**File:** `src/features/provider/monetization/pages/CheckoutSuccess.tsx`

```tsx
import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { confirmPayment } from '../utils/paymentHandler'

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [details, setDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')
  const type = (searchParams.get('type') as 'boost' | 'subscription') || 'boost'

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard')
      return
    }

    (async () => {
      try {
        const result = await confirmPayment(sessionId, type)
        setDetails(result)
      } catch (err) {
        setError('Błąd przy potwierdzaniu płatności')
        setTimeout(() => navigate('/dashboard'), 3000)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [sessionId, type, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md text-center">
        <div className="text-6xl mb-6">✓</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {type === 'boost' ? 'Boost Aktywny!' : 'Subskrypcja Aktywna!'}
        </h1>

        <p className="text-gray-600 mb-8">
          {type === 'boost'
            ? 'Twój boost jest teraz aktywny. Pojawisz się wyżej w wynikach wyszukiwania!'
            : 'Twoja subskrypcja jest aktywna. Korzystaj ze wszystkich przywileji!'}
        </p>

        {details && (
          <div className="bg-gray-50 rounded p-4 mb-8 text-left space-y-2">
            <div className="text-sm">
              <strong className="text-gray-600">Typ:</strong>
              <span className="float-right">{details.type}</span>
            </div>
            <div className="text-sm">
              <strong className="text-gray-600">Wygasa:</strong>
              <span className="float-right">
                {new Date(details.expires_at).toLocaleDateString('pl-PL')}
              </span>
            </div>
            {details.days_remaining && (
              <div className="text-sm border-t pt-2">
                <strong className="text-gray-600">Pozostało:</strong>
                <span className="float-right font-bold text-teal-600">
                  {details.days_remaining} dni
                </span>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-600 mb-6 text-sm">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={() => navigate(type === 'boost' ? '/dashboard/boosts' : '/dashboard/subscription')}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            {type === 'boost' ? 'Moje Boost\'y' : 'Moja Subskrypcja'}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Wróć do Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
```

### CheckoutCancel Page

**File:** `src/features/provider/monetization/pages/CheckoutCancel.tsx`

```tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md text-center">
        <div className="text-6xl mb-6">✕</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Płatność Anulowana</h1>

        <p className="text-gray-600 mb-8">
          Twoja płatność została anulowana. Możesz spróbować ponownie lub wrócić do dashboard.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/monetization/boost')}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Spróbuj Ponownie
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Wróć do Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔄 6.5 Countdown Timer & Real-time

### useCountdown Hook

**File:** `src/features/provider/monetization/hooks/useCountdown.ts`

```typescript
import { useEffect, useState } from 'react'

export function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(interval)
      } else {
        setRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  return remaining
}
```

### BoostList with Countdown

**File:** `src/features/provider/monetization/components/BoostList.tsx`

```tsx
import React from 'react'
import { useBoost } from '../hooks/useBoost'
import { useCountdown } from '../hooks/useCountdown'

export const BoostList: React.FC = () => {
  const { boosts, isExpiringSoon, renewBoost, cancelBoost, isLoading } = useBoost()

  return (
    <div className="space-y-4">
      {boosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nie masz aktywnych boost'ów
        </div>
      ) : (
        boosts.map(boost => (
          <BoostCard
            key={boost.id}
            boost={boost}
            isExpiringSoon={isExpiringSoon(boost)}
            onRenew={renewBoost}
            onCancel={cancelBoost}
          />
        ))
      )}
    </div>
  )
}

interface BoostCardProps {
  boost: any
  isExpiringSoon: boolean
  onRenew: (id: number, days: any) => Promise<void>
  onCancel: (id: number) => Promise<void>
}

const BoostCard: React.FC<BoostCardProps> = ({ boost, isExpiringSoon, onRenew, onCancel }) => {
  const countdown = useCountdown(boost.expires_at)

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isExpiringSoon ? 'border-red-300 bg-red-50' : 'border-teal-300 bg-teal-50'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{boost.type === 'city_boost' ? 'City Boost' : 'Spotlight'}</h3>
          <p className="text-gray-600">{boost.city || boost.category}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${isExpiringSoon ? 'text-red-600' : 'text-teal-600'}`}>
            {countdown.days}
          </div>
          <div className="text-sm text-gray-500">dni</div>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="mb-4 p-2 bg-red-200 rounded text-red-800 text-sm">
          ⚠️ Boost wygasa za {countdown.days} dni!
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onRenew(boost.id, 14)}
          className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        >
          Przedłuż
        </button>
        <button
          onClick={() => onCancel(boost.id)}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Anuluj
        </button>
      </div>
    </div>
  )
}
```

---

## 📝 Testing Strategy

### Unit Tests (Vitest)

```typescript
// src/features/provider/monetization/hooks/__tests__/useBoost.test.ts
import { renderHook, act } from '@testing-library/react'
import { useBoost } from '../useBoost'

describe('useBoost', () => {
  it('should calculate days remaining correctly', () => {
    const { result } = renderHook(() => useBoost())

    const boost = {
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const days = result.current.daysRemaining(boost as any)
    expect(days).toBe(7)
  })

  it('should identify expiring soon', () => {
    const { result } = renderHook(() => useBoost())

    const boost = {
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }

    expect(result.current.isExpiringSoon(boost as any)).toBe(true)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/monetization.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Monetization Flow', () => {
  test('provider can purchase boost', async ({ page }) => {
    await page.goto('/dashboard/monetization/boost')
    
    await page.click('text=City Boost')
    await page.fill('input[placeholder="np. Warszawa"]', 'Warszawa')
    await page.click('button:has-text("14")')
    
    await page.click('text=Przejdź do płatności')
    
    // Verify redirect to Stripe
    await expect(page).toHaveURL(/stripe\.com/)
  })

  test('success page displays boost details', async ({ page }) => {
    await page.goto('/checkout/success?session_id=cs_test&type=boost')
    
    await expect(page.locator('text=Boost Aktywny!')).toBeVisible()
    await expect(page.locator('text=Moje Boost\'y')).toBeClickable()
  })
})
```

---

## 🎯 Implementation Checklist

- [ ] Create folder structure `src/features/provider/monetization/`
- [ ] Create types definitions (boost.ts, subscription.ts, stripe.ts)
- [ ] Implement Stripe utilities (stripeClient.ts, paymentHandler.ts)
- [ ] Implement hooks (useBoost.ts, useSubscription.ts, useCountdown.ts)
- [ ] Create BoostPurchase component
- [ ] Create SubscriptionPurchase component
- [ ] Create CheckoutSuccess page
- [ ] Create CheckoutCancel page
- [ ] Create BoostList & SubscriptionList components
- [ ] Integrate into routing (`/monetization/boost`, `/checkout/success`, etc.)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update documentation
- [ ] Commit Phase 6 implementation

---

## ⏱ Timeline

| Task | Duration |
|------|----------|
| Setup structure + types | 0.5 day |
| Stripe utils + hooks | 1 day |
| BoostPurchase component | 1.5 days |
| SubscriptionPurchase component | 1.5 days |
| Success/Cancel pages | 0.5 day |
| Countdown + real-time | 0.5 day |
| Testing (unit + E2E) | 1 day |
| Documentation + commits | 0.5 day |
| **TOTAL** | **6.5 days** |

---

**Status:** ✅ Ready to Implement  
**Approval:** React + TypeScript confirmed  
**Next Step:** Start with component structure & types

