import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { PLAN_LIMITS } from '../../subscription/constants/planLimits';

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
  const response = await apiClient.get<SubscriptionResponse>('/provider/subscription');
  return response.data;
};

export const useSubscription = () => {
  return useQuery<SubscriptionResponse, Error>({
    queryKey: ['provider', 'subscription'],
    queryFn: fetchSubscription,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
