import { apiClient } from '@/api/client';

/**
 * API Client do płatności (PayU)
 *
 * @since 2025-12-24
 */
export const paymentApi = {
  /**
   * POST /api/v1/payment/payu/create-order
   * Utwórz order w PayU dla subskrypcji
   */
  async createPayUOrder(
    subscriptionPlanId: number,
    returnUrl: string,
  ) {
    const response = await apiClient.post('/payment/payu/create-order', {
      subscription_plan_id: subscriptionPlanId,
      return_url: returnUrl,
    });
    return response.data;
  },

  /**
   * GET /api/v1/payment/{id}/status
   * Pobierz status płatności
   */
  async getPaymentStatus(paymentId: number) {
    const response = await apiClient.get(`/payment/${paymentId}/status`);
    return response.data;
  },
};
