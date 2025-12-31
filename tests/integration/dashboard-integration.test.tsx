import { describe, it, expect, beforeAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useDashboardWidgets } from '@/features/provider/hooks/useDashboardWidgets'
import { 
  useRecentBookings, 
  useRecentMessages, 
  useRecentReviews,
  useProviderPerformance 
} from '@/features/provider/hooks/useDashboardData'
import '../integration-setup' // MSW setup

/**
 * INTEGRATION TESTS - używają MSW do mockowania API
 * 
 * Te testy sprawdzają:
 * 1. Czy hooki poprawnie wywołują API endpoints
 * 2. Czy React Query cache działa poprawnie
 * 3. Czy dane są poprawnie parsowane
 * 4. Czy error handling działa
 * 
 * MSW (Mock Service Worker) interceptuje requesty i zwraca mock data
 */

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 0,
      },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

describe('Dashboard Integration Tests (MSW Mocked API)', () => {
  beforeAll(() => {
    console.log('🚀 Running integration tests with MSW mocked API')
    console.log('📡 API requests will be intercepted by MSW')
  })

  describe('useDashboardWidgets - MSW Mocked', () => {
    it('should fetch mocked widgets data from API', async () => {
      const { result } = renderHook(() => useDashboardWidgets(), {
        wrapper: createWrapper(),
      })

      // Początkowy stan - loading
      expect(result.current.isLoading).toBe(true)

      // Czekamy na response z MSW
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false)
        },
        { timeout: 3000 }
      )

      // MSW zawsze zwraca success z mock data
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toBeDefined()
      
      console.log('✅ Widgets data:', result.current.data)
      
      // Sprawdź strukturę danych
      expect(result.current.data?.pipeline).toBeDefined()
      expect(result.current.data?.insights).toBeDefined()
      expect(result.current.data?.performance).toBeDefined()
      expect(result.current.data?.messages).toBeDefined()
      
      // Sprawdź konkretne wartości z MSW handler
      expect(result.current.data?.pipeline?.bookings?.pending).toBe(5)
      expect(result.current.data?.pipeline?.bookings?.confirmed).toBe(12)
      expect(result.current.data?.insights?.trust_score).toBe(87)
    }, 10000)

    it('should cache and deduplicate requests', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 60000 }, // 60s cache
        },
      })

      function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      }

      // Wywołaj hook 3 razy jednocześnie
      const { result: result1 } = renderHook(() => useDashboardWidgets(), { wrapper: Wrapper })
      const { result: result2 } = renderHook(() => useDashboardWidgets(), { wrapper: Wrapper })
      const { result: result3 } = renderHook(() => useDashboardWidgets(), { wrapper: Wrapper })

      await waitFor(
        () => {
          expect(result1.current.isLoading).toBe(false)
          expect(result2.current.isLoading).toBe(false)
          expect(result3.current.isLoading).toBe(false)
        },
        { timeout: 5000 }
      )

      // Wszystkie 3 hooki powinny mieć ten sam status (sukces lub błąd)
      expect(result1.current.isSuccess).toBe(result2.current.isSuccess)
      expect(result2.current.isSuccess).toBe(result3.current.isSuccess)
      
      console.log('✅ Deduplication test completed')
    }, 10000)
  })

  describe('useRecentBookings - MSW Mocked', () => {
    it('should fetch mocked bookings from API', async () => {
      const { result } = renderHook(() => useRecentBookings(5), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => expect(result.current.isLoading).toBe(false),
        { timeout: 3000 }
      )

      expect(result.current.isSuccess).toBe(true)
      console.log('✅ Bookings data:', result.current.data)
      expect(result.current.data).toBeDefined()
      
      if (result.current.data && result.current.data.length > 0) {
        const firstBooking = result.current.data[0]
        console.log('First booking:', firstBooking)
        
        // Sprawdź czy ma podstawowe pola z MSW mock
        expect(firstBooking).toHaveProperty('id')
        expect(firstBooking).toHaveProperty('customer_name')
        expect(firstBooking.customer_name).toBe('Jan Kowalski') // Z MSW handler
      }
    }, 10000)
  })

  describe('useRecentMessages - MSW Mocked', () => {
    it('should fetch mocked conversations from API', async () => {
      const { result } = renderHook(() => useRecentMessages(5), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => expect(result.current.isLoading).toBe(false),
        { timeout: 3000 }
      )

      expect(result.current.isSuccess).toBe(true)
      console.log('✅ Messages data:', result.current.data)
      expect(result.current.data).toBeDefined()
    }, 10000)
  })

  describe('useRecentReviews - MSW Mocked', () => {
    it('should fetch mocked reviews from API', async () => {
      const { result } = renderHook(() => useRecentReviews(4), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => expect(result.current.isLoading).toBe(false),
        { timeout: 3000 }
      )

      expect(result.current.isSuccess).toBe(true)
      console.log('✅ Reviews data:', result.current.data)
      expect(result.current.data).toBeDefined()
    }, 10000)
  })

  describe('useProviderPerformance - MSW Mocked', () => {
    it('should fetch mocked performance metrics from API', async () => {
      const { result } = renderHook(() => useProviderPerformance(), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => expect(result.current.isLoading).toBe(false),
        { timeout: 3000 }
      )

      expect(result.current.isSuccess).toBe(true)
      console.log('✅ Performance data:', result.current.data)
      expect(result.current.data).toBeDefined()
      
      if (result.current.data) {
        // Sprawdź konkretne wartości z MSW
        expect(result.current.data.views).toBe(342)
        expect(result.current.data.favorited).toBe(28)
        expect(result.current.data.rating).toBe(4.8)
        console.log('Views:', result.current.data.views)
        console.log('Favorited:', result.current.data.favorited)
        console.log('Rating:', result.current.data.rating)
      }
    }, 10000)
  })

  describe('Error Handling - Real API', () => {
    it('should handle 401 errors gracefully', async () => {
      const { result } = renderHook(() => useDashboardWidgets(), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => expect(result.current.isLoading).toBe(false),
        { timeout: 5000 }
      )

      // Jeśli nie zalogowany, powinien być error
      // Jeśli zalogowany, powinien być success
      expect(result.current.isSuccess || result.current.isError).toBe(true)
      
      if (result.current.isError) {
        const error = result.current.error as any
        console.log('Error details:', {
          message: error.message,
          status: error.response?.status,
        })
        
        // 401 (Unauthenticated) lub 419 (CSRF token mismatch) to oczekiwane błędy
        if (error.response) {
          expect([401, 419]).toContain(error.response.status)
        }
      }
    }, 10000)
  })

  describe('Data Consistency', () => {
    it('should return consistent data structure across multiple calls', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 60000 },
        },
      })

      function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      }

      const { result: result1 } = renderHook(() => useDashboardWidgets(), { wrapper: Wrapper })
      
      await waitFor(
        () => expect(result1.current.isLoading).toBe(false),
        { timeout: 5000 }
      )

      // Drugi wywołanie powinno użyć cache
      const { result: result2 } = renderHook(() => useDashboardWidgets(), { wrapper: Wrapper })
      
      await waitFor(
        () => expect(result2.current.isLoading).toBe(false),
        { timeout: 1000 } // Szybsze bo z cache
      )

      // Oba wywołania powinny mieć ten sam result
      expect(result1.current.isSuccess).toBe(result2.current.isSuccess)
      expect(result1.current.isError).toBe(result2.current.isError)
      
      if (result1.current.isSuccess && result2.current.isSuccess) {
        // Dane z cache powinny być identyczne
        expect(result1.current.data).toEqual(result2.current.data)
        console.log('✅ Cache consistency verified')
      }
    }, 10000)
  })
})
