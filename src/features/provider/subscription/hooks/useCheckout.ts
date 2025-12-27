import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlanType } from '../constants/planLimits';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

/**
 * Checkout request payload
 */
export interface CheckoutRequest {
  planId: PlanType;
  billingPeriod: 'monthly' | 'yearly';
  billingAddress: {
    fullName: string;
    email: string;
    country: string;
    city: string;
    postalCode: string;
    address: string;
  };
}

/**
 * Checkout response - zawiera sesję do Stripe
 */
export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  orderId: string;
}

/**
 * Order status response
 */
export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  plan: PlanType;
  activatedAt?: string;
  expiresAt: string;
  invoiceUrl?: string;
}

/**
 * Invoice type
 */
export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
  downloadUrl: string;
}

/**
 * Create checkout session
 */
const createCheckoutSession = async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/subscription/checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

/**
 * Get order status
 */
const getOrderStatus = async (orderId: string): Promise<OrderStatus> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/subscription/order/${orderId}`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

/**
 * Get user invoices
 */
const getInvoices = async (): Promise<Invoice[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/subscription/invoices`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.invoices || [];
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/subscription/cancel`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

/**
 * Hook for creating checkout
 */
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      toast.success('Sesja płatności utworzona - przekierowujemy Cię na bramkę');
      // Redirect to Stripe
      setTimeout(() => {
        window.location.href = data.checkoutUrl;
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Błąd podczas tworzenia sesji checkout');
    },
  });
};

/**
 * Hook for polling order status
 */
export const useOrderStatus = (orderId: string | null) => {
  return useQuery({
    queryKey: ['subscription', 'order', orderId],
    queryFn: () => getOrderStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: orderId ? 3000 : undefined, // Poll every 3s while pending
    staleTime: 0,
  });
};

/**
 * Hook for fetching invoices
 */
export const useInvoices = () => {
  return useQuery({
    queryKey: ['subscription', 'invoices'],
    queryFn: getInvoices,
    staleTime: 60_000,
  });
};

/**
 * Hook for cancelling subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success('Subskrypcja anulowana - dostęp będzie dostępny do końca okresu');
      queryClient.invalidateQueries({ queryKey: ['provider', 'subscription'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Błąd podczas anulowania subskrypcji');
    },
  });
};
