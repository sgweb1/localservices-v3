import { apiClient } from '../client';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const subscribePush = async (payload: PushSubscriptionPayload) => {
  const { data } = await apiClient.post('/push/subscriptions', payload);
  return data;
};

export const unsubscribePush = async (id: number) => {
  await apiClient.delete(`/push/subscriptions/${id}`);
};
