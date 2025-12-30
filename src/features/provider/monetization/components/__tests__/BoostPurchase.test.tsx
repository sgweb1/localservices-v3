/**
 * Testy dla komponentu BoostPurchase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoostPurchase } from './BoostPurchase'
import * as paymentHandler from '../utils/paymentHandler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock paymentHandler
vi.mock('../utils/paymentHandler', () => ({
  initiateBoostCheckout: vi.fn()
}))

// Mock useBoost hook
vi.mock('../hooks/useBoost', () => ({
  useBoost: () => ({
    boosts: [],
    isLoading: false,
    error: null,
    purchaseBoost: {
      mutate: vi.fn(),
      isPending: false
    },
    renewBoost: {
      mutate: vi.fn(),
      isPending: false
    },
    cancelBoost: {
      mutate: vi.fn(),
      isPending: false
    }
  })
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BoostPurchase />
    </QueryClientProvider>
  )
}

describe('BoostPurchase Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderuje formularz z podstawowymi elementami', () => {
    renderComponent()
    
    expect(screen.getByText('Kup Boost')).toBeInTheDocument()
    expect(screen.getByText('City Boost')).toBeInTheDocument()
    expect(screen.getByText('Spotlight')).toBeInTheDocument()
  })

  it('zmienia typ boosta na City Boost', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    const cityBoostBtn = screen.getByRole('button', { name: /City Boost/i })
    await user.click(cityBoostBtn)
    
    expect(screen.getByPlaceholderText(/Wpisz miasto/i)).toBeInTheDocument()
  })

  it('zmienia typ boosta na Spotlight', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    const spotlightBtn = screen.getByRole('button', { name: /Spotlight/i })
    await user.click(spotlightBtn)
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('wyświetla cenę dla wybranego boosta i czasu', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    // Ustaw typ i dni
    const cityBoostBtn = screen.getByRole('button', { name: /City Boost/i })
    await user.click(cityBoostBtn)
    
    const sevenDaysBtn = screen.getByRole('button', { name: /7 dni/i })
    await user.click(sevenDaysBtn)
    
    expect(screen.getByText('9.99 PLN')).toBeInTheDocument()
  })

  it('waliduje pole miasta dla City Boost', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    const cityBoostBtn = screen.getByRole('button', { name: /City Boost/i })
    await user.click(cityBoostBtn)
    
    const submitBtn = screen.getByRole('button', { name: /Kup teraz/i })
    
    // Bez miasta - przycisk powinien być disabled lub błąd
    expect(submitBtn).toBeDisabled()
  })

  it('pokazuje różne ceny dla różnych czasów trwania', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    const cityBoostBtn = screen.getByRole('button', { name: /City Boost/i })
    await user.click(cityBoostBtn)
    
    // 7 dni
    await user.click(screen.getByRole('button', { name: /7 dni/i }))
    expect(screen.getByText('9.99 PLN')).toBeInTheDocument()
    
    // 14 dni
    await user.click(screen.getByRole('button', { name: /14 dni/i }))
    expect(screen.getByText('19.99 PLN')).toBeInTheDocument()
    
    // 30 dni
    await user.click(screen.getByRole('button', { name: /30 dni/i }))
    expect(screen.getByText('29.99 PLN')).toBeInTheDocument()
  })
})
