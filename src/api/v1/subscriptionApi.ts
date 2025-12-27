import { apiClient } from '@/api/client';

/**
 * API Client do subskrypcji
 */
export const subscriptionApi = {
  /**
   * GET /api/v1/subscription/plans
   */
  async getPlans() {
    const response = await apiClient.get('/subscription/plans');
    return response.data;
  },

  /**
   * GET /api/v1/subscription/status
   */
  async getStatus() {
    const response = await apiClient.get('/subscription/status');
    return response.data;
  },

  /**
   * GET /api/v1/subscription/limits
   */
  async getLimits() {
    const response = await apiClient.get('/subscription/limits');
    return response.data;
  },

  /**
   * GET /api/v1/subscription/transactions
   */
  async getTransactions(limit = 10) {
    const response = await apiClient.get('/subscription/transactions', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * POST /api/v1/subscription/upgrade
   * Natychmiastowy upgrade (HARD)
   */
  async upgrade(planId: number, amount?: number) {
    const response = await apiClient.post('/subscription/upgrade', {
      plan_id: planId,
      amount,
    });
    return response.data;
  },

  /**
   * POST /api/v1/subscription/schedule-change
   * Zaplanuj zmianę na koniec okresu (SOFT)
   */
  async scheduleChange(planId: number) {
    const response = await apiClient.post('/subscription/schedule-change', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * POST /api/v1/subscription/cancel
   */
  async cancel(reason?: string) {
    const response = await apiClient.post('/subscription/cancel', {
      reason,
    });
    return response.data;
  },
};
