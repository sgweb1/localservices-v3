import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import * as useConversationsModule from '@/features/provider/messages/hooks/useConversations';
import * as ConversationListModule from '@/features/provider/messages/ConversationList';

/**
 * Testy komponentu MessagesPage - system wiadomości
 * 
 * UWAGA: Te testy wymagają mockowania useConversations hook
 * oraz AuthContext (logged in user)
 */

// Mock data
const mockConversations = {
  data: [
    {
      id: 1,
      uuid: 'conv-1',
      customer: { id: 10, name: 'Anna Kowalska', email: 'anna@test.com' },
      provider: { id: 20, name: 'Jan Nowak', email: 'jan@test.com' },
      other_user: { id: 10, name: 'Anna Kowalska', email: 'anna@test.com' },
      last_message: 'Witam, interesuje mnie usługa',
      last_message_at: '2025-12-31T10:00:00Z',
      unread_count: 2,
      is_hidden_for_current_user: false,
      created_at: '2025-12-30T10:00:00Z',
      updated_at: '2025-12-31T10:00:00Z',
    },
    {
      id: 2,
      uuid: 'conv-2',
      customer: { id: 11, name: 'Piotr Wiśniewski', email: 'piotr@test.com' },
      provider: { id: 20, name: 'Jan Nowak', email: 'jan@test.com' },
      other_user: { id: 11, name: 'Piotr Wiśniewski', email: 'piotr@test.com' },
      last_message: 'Dziękuję za szybką odpowiedź',
      last_message_at: '2025-12-30T15:00:00Z',
      unread_count: 0,
      is_hidden_for_current_user: false,
      created_at: '2025-12-29T10:00:00Z',
      updated_at: '2025-12-30T15:00:00Z',
    },
  ],
  meta: {
    current_page: 1,
    per_page: 10,
    total: 2,
    last_page: 1,
    unread_count: 2,
  },
};

let MessagesPage: typeof import('@/features/provider/messages/MessagesPage').MessagesPage;

// Ustawiamy szpiegów zamiast vi.mock, żeby mieć pewność, że MessagesPage korzysta z podmienionych modułów
const useConversationsSpy = vi.spyOn(useConversationsModule, 'useConversations');
const useUnhideConversationSpy = vi.spyOn(useConversationsModule, 'useUnhideConversation');
const conversationListSpy = vi.spyOn(ConversationListModule, 'ConversationList');

const applyDefaultMocks = () => {
  useConversationsSpy.mockImplementation(() => ({
    data: mockConversations,
    isLoading: false,
    error: null,
  }));

  useUnhideConversationSpy.mockImplementation(() => ({
    mutate: vi.fn(),
    isPending: false,
  }));

  conversationListSpy.mockImplementation(({ conversations, isLoading }: any) => {
    if (isLoading) {
      return <div>Ładowanie...</div>;
    }

    return (
      <div>
        {conversations?.data?.map((conv: any) => (
          <div key={conv.id}>
            <div>{conv.customer.name}</div>
            <div>{conv.last_message}</div>
            {conv.unread_count ? <span>{conv.unread_count}</span> : null}
          </div>
        ))}
      </div>
    );
  });
};

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { id: 20, name: 'Jan Nowak', email: 'jan@test.com', role: 'provider' },
    isAuthenticated: true,
  }),
}));

import { AuthProvider } from '@/contexts/AuthContext';

beforeAll(async () => {
  applyDefaultMocks();
  ({ MessagesPage } = await import('@/features/provider/messages/MessagesPage'));
});

// Helper do renderowania z providerami
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

describe('MessagesPage - UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applyDefaultMocks();
  });

  it('renderuje stronę wiadomości z nagłówkiem', () => {
    renderWithProviders(<MessagesPage />);

    expect(screen.getByText('Wiadomości')).toBeInTheDocument();
  });

  it('wyświetla input wyszukiwania', () => {
    renderWithProviders(<MessagesPage />);

    const searchInput = screen.getByPlaceholderText(/szukaj konwersacji/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('wyświetla zakładki Aktywne i Ukryte', () => {
    renderWithProviders(<MessagesPage />);

    expect(screen.getByRole('button', { name: /aktywne/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ukryte/i })).toBeInTheDocument();
  });

  it('wyświetla listę konwersacji z mockowanych danych', async () => {
    renderWithProviders(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('Anna Kowalska')).toBeInTheDocument();
      expect(screen.getByText('Piotr Wiśniewski')).toBeInTheDocument();
    });
  });

  it('wyświetla ostatnią wiadomość w konwersacji', async () => {
    renderWithProviders(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('Witam, interesuje mnie usługa')).toBeInTheDocument();
    });
  });

  it('wyświetla licznik nieprzeczytanych wiadomości', async () => {
    renderWithProviders(<MessagesPage />);

    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });
  });

  it('wyświetla placeholder gdy nie wybrano konwersacji (desktop)', async () => {
    renderWithProviders(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText(/wybierz konwersację/i)).toBeInTheDocument();
      expect(screen.getByText(/aby rozpocząć rozmowę/i)).toBeInTheDocument();
    });
  });

  it('pozwala przełączać między zakładkami Aktywne i Ukryte', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MessagesPage />);

    const ukryteButton = screen.getByRole('button', { name: /ukryte/i });
    await user.click(ukryteButton);

    // Sprawdzamy czy zakładka Ukryte jest aktywna (ma gradient background)
    expect(ukryteButton).toHaveClass(/from-cyan-500/);
  });
});

describe('MessagesPage - Search Functionality', () => {
  it('pozwala wpisać tekst w pole wyszukiwania', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MessagesPage />);

    const searchInput = screen.getByPlaceholderText(/szukaj konwersacji/i);
    await user.type(searchInput, 'Anna');

    expect(searchInput).toHaveValue('Anna');
  });
});

describe('MessagesPage - Responsive Design', () => {
  it('renderuje się poprawnie na desktop (pokazuje sidebar i chat area)', () => {
    renderWithProviders(<MessagesPage />);

    // Sidebar z konwersacjami
    const sidebar = screen.getByText('Wiadomości').closest('div');
    expect(sidebar).toBeInTheDocument();

    // Chat area (placeholder)
    expect(screen.getByText(/wybierz konwersację/i)).toBeInTheDocument();
  });

  it('ma responsive classes dla mobile (hidden md:flex)', () => {
    const { container } = renderWithProviders(<MessagesPage />);

    // Sprawdzamy czy główny kontener ma mobile-responsive classes
    const mainContainer = container.querySelector('.flex.h-\\[calc\\(100vh-4rem\\)\\]');
    expect(mainContainer).toBeInTheDocument();
  });
});

describe('MessagesPage - Loading State', () => {
  it('pokazuje loading state gdy dane są ładowane', async () => {
    useConversationsSpy.mockImplementation(() => ({
      data: undefined,
      isLoading: true,
      error: null,
    }));

    conversationListSpy.mockImplementation(({ isLoading }: any) => (
      <div>{isLoading ? 'Ładowanie...' : 'Gotowe'}</div>
    ));

    renderWithProviders(<MessagesPage />);

    // ConversationList powinien obsługiwać isLoading
    // (zakładamy że komponent pokazuje loader lub skeleton)
    await waitFor(() => {
      expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
    });
  });
});
