/**
 * Testy dla hooku useBoost
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBoost } from '../useBoost'
import * as paymentHandler from '../../utils/paymentHandler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock paymentHandler
vi.mock('../../utils/paymentHandler', () => ({
  fetchUserBoosts: vi.fn(),
  initiateBoostCheckout: vi.fn(),
  renewBoost: vi.fn(),
  cancelBoost: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const mockBoosts = [
  {
    id: 1,
    type: 'city_boost',
    city: 'Warszawa',
    category: null,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    price: 9.99,
    is_active: true
  }
]

describe('useBoost Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches user boosts on mount', async () => {
    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue(mockBoosts)

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts).toEqual(mockBoosts)
    })

    expect(paymentHandler.fetchUserBoosts).toHaveBeenCalled()
  })

  it('calculates days remaining correctly', async () => {
    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue(mockBoosts)

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts.length).toBeGreaterThan(0)
    })

    const boost = result.current.boosts[0]
    const days = result.current.daysRemaining(boost)
    
    expect(days).toBe(7)
  })

  it('detects expiring boosts correctly', async () => {
    const expiringBoost = {
      ...mockBoosts[0],
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    }

    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue([expiringBoost])

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts.length).toBeGreaterThan(0)
    })

    const boost = result.current.boosts[0]
    expect(result.current.isExpiringSoon(boost)).toBe(true)
  })

  it('detects expired boosts', async () => {
    const expiredBoost = {
      ...mockBoosts[0],
      expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }

    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue([expiredBoost])

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts.length).toBeGreaterThan(0)
    })

    const boost = result.current.boosts[0]
    expect(result.current.isExpired(boost)).toBe(true)
  })

  it('calls purchase mutation with correct params', async () => {
    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue(mockBoosts)
    vi.mocked(paymentHandler.initiateBoostCheckout).mockResolvedValue({
      checkout_url: 'https://stripe.com/pay/123',
      session_id: 'cs_123'
    })

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts).toBeDefined()
    })

    const payload = {
      type: 'city_boost',
      days: 7,
      city: 'Warszawa'
    }

    result.current.purchaseBoost.mutate(payload)

    await waitFor(() => {
      expect(paymentHandler.initiateBoostCheckout).toHaveBeenCalledWith(payload)
    })
  })

  it('refetches boosts every 30 seconds', async () => {
    vi.useFakeTimers()
    vi.mocked(paymentHandler.fetchUserBoosts).mockResolvedValue(mockBoosts)

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.boosts).toBeDefined()
    })

    const initialCallCount = vi.mocked(paymentHandler.fetchUserBoosts).mock.calls.length

    // Poczekaj 30 sekund
    vi.advanceTimersByTime(30000)

    await waitFor(() => {
      expect(vi.mocked(paymentHandler.fetchUserBoosts).mock.calls.length).toBeGreaterThan(
        initialCallCount
      )
    })

    vi.useRealTimers()
  })

  it('handles errors gracefully', async () => {
    const errorMessage = 'API Error'
    vi.mocked(paymentHandler.fetchUserBoosts).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useBoost(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })

    expect(result.current.error).toContain(errorMessage)
  })
})
