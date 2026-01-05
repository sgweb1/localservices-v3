import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsTab } from '@/features/provider/settings/NotificationsTab';

// Mock hook useWebPush (żeby nie korzystać z realnego SW/PushManager)
const mockUseWebPush = vi.hoisted(() => vi.fn(() => ({
  status: 'supported',
  isSupported: true,
  subscribe: vi.fn(),
  error: null,
})));
vi.mock('@/hooks/useWebPush', () => ({
  useWebPush: mockUseWebPush,
}));

// Mock toast z sonner (użyj vi.hoisted by uniknąć TDZ)
const toastError = vi.hoisted(() => vi.fn());
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: (...args: unknown[]) => toastError(...args),
    info: vi.fn(),
  },
}));

// Helpers
const renderWithQueryClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('NotificationsTab', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    toastError.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('gracefully obsługuje 401 (unauthorized) i pokazuje toast', async () => {
    // Mock fetch -> 401
    global.fetch = vi.fn(async () => new Response(null, { status: 401 })) as any;

    renderWithQueryClient(<NotificationsTab />);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Musisz być zalogowany, aby zobaczyć powiadomienia');
    });
  });
});
