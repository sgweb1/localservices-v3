import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { DashboardPage } from '@/features/provider/dashboard/components/DashboardPage'
import { renderWithProviders } from '../../../utils/test-utils'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Jan Kowalski',
      email: 'jan@example.com',
    },
  }),
}))

// Mock wszystkich hooków Dashboard
vi.mock('@/features/provider/hooks/useDashboardWidgets', () => ({
  useDashboardWidgets: vi.fn(),
}))

vi.mock('@/features/provider/hooks/useDashboardData', () => ({
  useRecentBookings: vi.fn(() => ({ data: null, isLoading: false })),
  useRecentMessages: vi.fn(() => ({ data: null, isLoading: false })),
  useRecentReviews: vi.fn(() => ({ data: null, isLoading: false })),
  useProviderPerformance: vi.fn(() => ({ data: null, isLoading: false })),
}))

// Mock komponentów
vi.mock('@/features/provider/dashboard/components/PerformanceMetrics', () => ({
  PerformanceMetrics: () => <div data-testid="performance-metrics">PerformanceMetrics</div>,
}))

vi.mock('@/features/provider/dashboard/components/RecentBookings', () => ({
  RecentBookings: () => <div data-testid="recent-bookings">RecentBookings</div>,
}))

vi.mock('@/features/provider/dashboard/components/RecentMessages', () => ({
  RecentMessages: () => <div data-testid="recent-messages">RecentMessages</div>,
}))

const { useDashboardWidgets } = await import('@/features/provider/hooks/useDashboardWidgets')

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hero Section', () => {
    it('should render welcome message with user first name', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByText(/Witaj, Jan!/)).toBeInTheDocument()
    })

    it('should render panel description', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByText(/Panel providera/)).toBeInTheDocument()
      expect(screen.getByText(/Przegląd rezerwacji, wiadomości i zaufania/)).toBeInTheDocument()
    })

    it('should render CTA buttons with correct links', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      const calendarButton = screen.getByText('Przejdź do kalendarza')
      const bookingsButton = screen.getByText('Zarządzaj rezerwacjami')
      
      expect(calendarButton).toBeInTheDocument()
      expect(calendarButton.closest('a')).toHaveAttribute('href', '/provider/calendar')
      
      expect(bookingsButton).toBeInTheDocument()
      expect(bookingsButton.closest('a')).toHaveAttribute('href', '/provider/bookings')
    })
  })

  describe('Hero Stats (3 cards)', () => {
    it('should render 3 stat cards with correct labels', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          pipeline: {
            bookings: { pending: 3, confirmed: 12, completed: 45 },
            requests: { incoming: 8, quoted: 5, converted: 3 },
          },
          messages: { unread_count: 7 },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByText('Oczekujące')).toBeInTheDocument()
      expect(screen.getByText('Potwierdzone')).toBeInTheDocument()
      expect(screen.getByText('Nieprzeczytane')).toBeInTheDocument()
    })

    it('should display correct values from API', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          pipeline: {
            bookings: { pending: 3, confirmed: 12, completed: 45 },
            requests: { incoming: 8, quoted: 5, converted: 3 },
          },
          messages: { unread_count: 7 },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // Szukamy wartości w DOM (liczby są wyświetlane jako tekst)
      expect(screen.getByText('3')).toBeInTheDocument() // pending
      expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(1) // confirmed (może być 2x: hero stats + summary cards)
      expect(screen.getByText('7')).toBeInTheDocument() // unread
    })

    it('should default to 0 when no data', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // Powinny być trzy zera (lub więcej, ale co najmniej 3)
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Summary Cards (4 cards)', () => {
    it('should render 4 summary cards with correct labels', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          pipeline: {
            bookings: { pending: 3, confirmed: 12, completed: 45 },
            requests: { incoming: 8, quoted: 5, converted: 3 },
          },
          insights: { trust_score: 85 },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByText('Zapytania ofertowe')).toBeInTheDocument()
      expect(screen.getByText('Potwierdzone rezerwacje')).toBeInTheDocument()
      expect(screen.getByText('Ukończone')).toBeInTheDocument()
      expect(screen.getAllByText('Trust Score™').length).toBeGreaterThanOrEqual(1) // pojawia się 2x: hero card + summary
    })

    it('should calculate requests correctly (incoming + quoted)', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          pipeline: {
            bookings: { pending: 3, confirmed: 12, completed: 45 },
            requests: { incoming: 8, quoted: 5, converted: 3 },
          },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // incoming (8) + quoted (5) = 13
      expect(screen.getByText('13')).toBeInTheDocument()
    })

    it('should show organic visibility hint when trust score >= 70', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          insights: { trust_score: 85 },
          pipeline: { bookings: {}, requests: {} },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getAllByText(/Widoczność organiczna aktywna/).length).toBeGreaterThanOrEqual(1)
    })

    it('should show goal hint when trust score < 70', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          insights: { trust_score: 55 },
          pipeline: { bookings: {}, requests: {} },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // Pojawia się w 2 miejscach: hero card i summary card
      expect(screen.getAllByText(/Cel: 70\+ dla lepszej widoczności/).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Trust Score Card in Hero', () => {
    it('should display trust score value', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          insights: { trust_score: 85 },
          pipeline: { bookings: {}, requests: {} },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // Trust score powinien być widoczny (85) - pojawia się 2x: hero + summary
      expect(screen.getAllByText('85').length).toBeGreaterThanOrEqual(1)
    })

    it('should display response minutes when available', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: {
          insights: { trust_score: 85 },
          performance: { 
            trust_score: 85, 
            response_minutes: 45 
          },
          pipeline: { bookings: {}, requests: {} },
        },
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByText(/45 min/)).toBeInTheDocument()
    })
  })

  describe('Child Components', () => {
    it('should render PerformanceMetrics component', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument()
    })

    it('should render RecentBookings component', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByTestId('recent-bookings')).toBeInTheDocument()
    })

    it('should render RecentMessages component', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: null,
        isLoading: false,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      expect(screen.getByTestId('recent-messages')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should handle loading state gracefully', () => {
      vi.mocked(useDashboardWidgets).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any)

      renderWithProviders(<DashboardPage />)
      
      // Komponent powinien się zrenderować nawet w loading state
      expect(screen.getByText(/Witaj,/)).toBeInTheDocument()
    })
  })
})
