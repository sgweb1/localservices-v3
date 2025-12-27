import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/v1/subscriptionApi';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  is_popular: boolean;
  limits: {
    max_services: number;
    max_photos_per_service: number;
    max_portfolio_photos: number;
  };
  features: {
    has_promotional_video: boolean;
    has_calendar: boolean;
    has_instant_booking: boolean;
    has_messaging: boolean;
    has_gallery: boolean;
    has_subdomain: boolean;
  };
  analytics_level: string;
}

export interface SubscriptionStatus {
  current_plan: SubscriptionPlan | null;
  pending_plan: SubscriptionPlan | null;
  subscription_status: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  next_billing_date: string | null;
  subscription_auto_renew: boolean;
  limits: Record<string, any>;
}

/**
 * Hook do zarządzania subskrypcją
 */
export function useSubscription() {
  const queryClient = useQueryClient();

  // Pobierz listę planów
  const plansQuery = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionApi.getPlans(),
  });

  // Pobierz status subskrypcji
  const statusQuery = useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: () => subscriptionApi.getStatus(),
  });

  // Pobierz limity
  const limitsQuery = useQuery({
    queryKey: ['subscription', 'limits'],
    queryFn: () => subscriptionApi.getLimits(),
  });

  // Upgrade na nowy plan (HARD)
  const upgradeMutation = useMutation({
    mutationFn: (planId: number) => subscriptionApi.upgrade(planId),
    onSuccess: (data) => {
      toast.success('✅ ' + data.message);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Błąd upgradu';
      toast.error('❌ ' + message);
    },
  });

  // Zaplanuj zmianę na koniec okresu (SOFT)
  const scheduleChangeMutation = useMutation({
    mutationFn: (planId: number) => subscriptionApi.scheduleChange(planId),
    onSuccess: (data) => {
      toast.success('✅ ' + data.message);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Błąd zaplanowania zmiany';
      toast.error('❌ ' + message);
    },
  });

  // Anuluj subskrypcję
  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: (data) => {
      toast.success('✅ ' + data.message);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Błąd anulowania';
      toast.error('❌ ' + message);
    },
  });

  return {
    // Queries
    plans: plansQuery.data?.data || [],
    plansLoading: plansQuery.isLoading,
    plansError: plansQuery.error,

    status: statusQuery.data?.data,
    statusLoading: statusQuery.isLoading,
    statusError: statusQuery.error,

    limits: limitsQuery.data?.data || {},
    limitsLoading: limitsQuery.isLoading,

    // Mutations
    upgrade: (planId: number) => upgradeMutation.mutate(planId),
    upgradeLoading: upgradeMutation.isPending,

    scheduleChange: (planId: number) => scheduleChangeMutation.mutate(planId),
    scheduleChangeLoading: scheduleChangeMutation.isPending,

    cancel: () => cancelMutation.mutate(),
    cancelLoading: cancelMutation.isPending,

    // Helpers
    isLoading: plansQuery.isLoading || statusQuery.isLoading,
    currentPlanId: statusQuery.data?.data?.current_plan?.id,
    pendingPlanId: statusQuery.data?.data?.pending_plan?.id,
    endsAt: statusQuery.data?.data?.subscription_ends_at,
  };
}
