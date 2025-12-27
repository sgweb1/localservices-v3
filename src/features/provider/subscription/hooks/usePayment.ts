import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/api/v1/paymentApi';
import { toast } from 'sonner';

/**
 * Hook do zarządzania płatnościami (PayU)
 *
 * @since 2025-12-24
 */
export const usePayment = () => {
  const queryClient = useQueryClient();

  /**
   * Mutation: Utwórz order PayU
   */
  const createPayUOrderMutation = useMutation({
    mutationFn: (data: {
      subscriptionPlanId: number;
      returnUrl: string;
    }) =>
      paymentApi.createPayUOrder(
        data.subscriptionPlanId,
        data.returnUrl,
      ),
    onSuccess: (data) => {
      toast.success('Przesyłanie do PayU...');
      // Przekieruj do PayU
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Błąd podczas tworzenia płatności',
      );
    },
  });

  /**
   * Query: Pobierz status płatności
   */
  const getPaymentStatusQuery = (paymentId: number | null) =>
    useQuery({
      queryKey: ['payment', paymentId],
      queryFn: () => paymentApi.getPaymentStatus(paymentId!),
      enabled: !!paymentId,
      refetchInterval: 5000, // Sprawdzaj co 5 sekund
    });

  return {
    createPayUOrder: createPayUOrderMutation.mutate,
    createPayUOrderAsync: createPayUOrderMutation.mutateAsync,
    isCreatingPayUOrder: createPayUOrderMutation.isPending,
    getPaymentStatus: getPaymentStatusQuery,
  };
};
