import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubscription } from '@/features/provider/subscription/hooks/useSubscription';

// Mock the API
vi.mock('@/api/subscriptionApi', () => ({
  getPlans: vi.fn(),
  getStatus: vi.fn(),
  getLimits: vi.fn(),
  getTransactions: vi.fn(),
  upgrade: vi.fn(),
  scheduleChange: vi.fn(),
  cancel: vi.fn(),
}));

describe('useSubscription Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch subscription plans', async () => {
    const mockPlans = [
      { id: 1, key: 'free', name: 'Free', price: 0 },
      { id: 2, key: 'basic', name: 'Basic', price: 49 },
      { id: 3, key: 'pro', name: 'Pro', price: 99 },
    ];

    const { getPlans } = await import('@/api/subscriptionApi');
    vi.mocked(getPlans).mockResolvedValue({ data: mockPlans });

    const { result } = renderHook(() => useSubscription().plans, { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPlans);
  });

  it('should fetch subscription status', async () => {
    const mockStatus = {
      current_plan: 'basic',
      is_active: true,
      days_remaining: 15,
      expires_at: '2025-01-08',
    };

    const { getStatus } = await import('@/api/subscriptionApi');
    vi.mocked(getStatus).mockResolvedValue({ data: mockStatus });

    const { result } = renderHook(() => useSubscription().status, { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStatus);
  });

  it('should fetch user limits', async () => {
    const mockLimits = {
      max_services: 10,
      max_photos_per_service: 30,
      max_portfolio_photos: 50,
      has_calendar: true,
      has_subdomain: true,
      has_promotional_video: true,
    };

    const { getLimits } = await import('@/api/subscriptionApi');
    vi.mocked(getLimits).mockResolvedValue({ data: mockLimits });

    const { result } = renderHook(() => useSubscription().limits, { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLimits);
  });

  it('should upgrade subscription with SOFT change', async () => {
    const mockUpgradeResponse = {
      success: true,
      message: 'Plan zmieni się na koniec okresu',
      pending_plan_id: 3,
    };

    const { upgrade } = await import('@/api/subscriptionApi');
    vi.mocked(upgrade).mockResolvedValue({ data: mockUpgradeResponse });

    const { result } = renderHook(() => useSubscription().upgradeMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        planId: 3,
        changeType: 'soft',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUpgradeResponse);
  });

  it('should handle upgrade with HARD change (immediate)', async () => {
    const mockUpgradeResponse = {
      success: true,
      message: 'Upgrade aktywowany natychmiast',
      payment_required: true,
      redirect_uri: 'https://payu.pl/payment',
    };

    const { upgrade } = await import('@/api/subscriptionApi');
    vi.mocked(upgrade).mockResolvedValue({ data: mockUpgradeResponse });

    const { result } = renderHook(() => useSubscription().upgradeMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        planId: 4,
        changeType: 'hard',
      });
    });

    expect(result.current.data?.redirect_uri).toBeDefined();
  });

  it('should schedule plan change', async () => {
    const mockScheduleResponse = {
      success: true,
      scheduled_for: '2025-01-24',
      new_plan: 'pro',
    };

    const { scheduleChange } = await import('@/api/subscriptionApi');
    vi.mocked(scheduleChange).mockResolvedValue({ data: mockScheduleResponse });

    const { result } = renderHook(() => useSubscription().scheduleChangeMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        planId: 3,
        changeType: 'soft',
      });
    });

    expect(result.current.data?.new_plan).toBe('pro');
  });

  it('should cancel subscription', async () => {
    const mockCancelResponse = {
      success: true,
      message: 'Subskrypcja anulowana',
    };

    const { cancel } = await import('@/api/subscriptionApi');
    vi.mocked(cancel).mockResolvedValue({ data: mockCancelResponse });

    const { result } = renderHook(() => useSubscription().cancelMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');

    const { getStatus } = await import('@/api/subscriptionApi');
    vi.mocked(getStatus).mockRejectedValue(mockError);

    const { result } = renderHook(() => useSubscription().status, { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should refetch data after mutation', async () => {
    const mockPlans = [
      { id: 1, key: 'free', name: 'Free', price: 0 },
      { id: 2, key: 'basic', name: 'Basic', price: 49 },
    ];

    const mockStatus = {
      current_plan: 'basic',
      is_active: true,
      days_remaining: 15,
    };

    const { getPlans, getStatus, upgrade } = await import('@/api/subscriptionApi');
    vi.mocked(getPlans).mockResolvedValue({ data: mockPlans });
    vi.mocked(getStatus).mockResolvedValue({ data: mockStatus });
    vi.mocked(upgrade).mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    // Wait for initial queries
    await waitFor(() => {
      expect(result.current.plans.isSuccess).toBe(true);
      expect(result.current.status.isSuccess).toBe(true);
    });

    // Trigger mutation
    await act(async () => {
      await result.current.upgradeMutation.mutateAsync({
        planId: 2,
        changeType: 'soft',
      });
    });

    // Status should be refetched
    await waitFor(() => {
      expect(vi.mocked(getStatus)).toHaveBeenCalledTimes(2);
    });
  });

  it('should fetch transaction history', async () => {
    const mockTransactions = [
      {
        id: 1,
        type: 'upgrade',
        from_plan: 'free',
        to_plan: 'pro',
        created_at: '2025-12-24',
      },
      {
        id: 2,
        type: 'downgrade',
        from_plan: 'pro',
        to_plan: 'basic',
        created_at: '2025-12-01',
      },
    ];

    const { getTransactions } = await import('@/api/subscriptionApi');
    vi.mocked(getTransactions).mockResolvedValue({ data: mockTransactions });

    const { result } = renderHook(() => useSubscription().transactions, { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].type).toBe('upgrade');
  });
});
