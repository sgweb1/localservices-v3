import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';
import { PLAN_LIMITS } from '../../subscription/constants/planLimits';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

export interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'premium';
  expiresAt: string | null;
  features: string[];
  limits: {
    maxServices: number;
    maxPhotosPerService: number;
    maxPortfolioPhotos: number;
    prioritySupport: boolean;
    analytics: boolean;
    subdomain: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    dedicatedManager: boolean;
  };
}

export interface SubscriptionResponse {
  data: Subscription;
}

const fetchSubscription = async (): Promise<SubscriptionResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/subscription`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock (endpoint nie istnieje jeszcze)
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return MOCK_SUBPAGES.subscription;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

export const useSubscription = () => {
  return useQuery<SubscriptionResponse, Error>({
    queryKey: ['provider', 'subscription'],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return MOCK_SUBPAGES.subscription;
      }
      return fetchSubscription();
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
