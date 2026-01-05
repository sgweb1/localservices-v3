import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from '@/features/provider/pages/SettingsPage';
import type { SettingsResponse } from '@/api/v1/settingsApi';

// Mocks lekkie komponenty zakładek (żeby nie ciągnąć dużej logiki/forms)
vi.mock('@/features/provider/settings/BusinessProfileTab', () => ({
  BusinessProfileTab: () => <div data-testid="business-tab" />,
}));

vi.mock('@/features/provider/settings/NotificationsTab', () => ({
  NotificationsTab: () => <div data-testid="notifications-tab" />,
}));

vi.mock('@/features/provider/settings/SecurityTab', () => ({
  SecurityTab: () => <div data-testid="security-tab" />,
}));

// Mock API
const mockGetSettings = vi.hoisted(() => vi.fn<[], Promise<SettingsResponse>>());
vi.mock('@/api/v1/settingsApi', () => ({
  getSettings: (...args: unknown[]) => mockGetSettings(...args),
}));

// Helper: wrapper z QueryClient
const renderWithProviders = (ui: React.ReactElement, route: string = '/provider/settings') => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

const baseResponse: SettingsResponse = {
  success: true,
  data: {
    business: {
      name: 'Acme',
      short_description: 'Opis',
      bio: 'Bio',
      logo: null,
      video_url: null,
      website: null,
      social_media: {},
      subdomain: null,
      subdomain_active: false,
      can_use_subdomain: false,
    },
    notifications: {
      email: {
        new_booking: true,
        booking_cancelled: true,
        new_message: true,
        new_review: true,
      },
      push: {
        new_booking: true,
        new_message: true,
        new_review: true,
      },
    },
    security: {
      two_factor_enabled: false,
      email: 'user@example.com',
      email_verified: true,
    },
  },
};

describe('SettingsPage', () => {
  beforeEach(() => {
    mockGetSettings.mockReset();
  });

  it('renderuje loading state', async () => {
    mockGetSettings.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(baseResponse), 50))
    );

    renderWithProviders(<SettingsPage />);

    // Spinner + tekst ładowania
    expect(await screen.findByText('Ładowanie ustawień...')).toBeInTheDocument();
  });

  it('renderuje error state przy błędzie API', async () => {
    mockGetSettings.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Błąd ładowania')).toBeInTheDocument();
    });
  });

  it('pokazuje domyślnie zakładkę Profil biznesu', async () => {
    mockGetSettings.mockResolvedValue(baseResponse);

    renderWithProviders(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('business-tab')).toBeInTheDocument();
    });
  });

  it('po kliknięciu przełącza na zakładkę Powiadomienia', async () => {
    mockGetSettings.mockResolvedValue(baseResponse);

    renderWithProviders(<SettingsPage />);

    await userEvent.click(await screen.findByText(/Powiadomienia/i));

    await waitFor(() => {
      expect(screen.getByTestId('notifications-tab')).toBeInTheDocument();
    });
  });

  it('respektuje query param section=security', async () => {
    mockGetSettings.mockResolvedValue(baseResponse);

    renderWithProviders(<SettingsPage />, '/provider/settings?section=security');

    await waitFor(() => {
      expect(screen.getByTestId('security-tab')).toBeInTheDocument();
    });
  });
});
