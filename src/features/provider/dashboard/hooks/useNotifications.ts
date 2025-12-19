import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

export interface Notification {
  id: number;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  counts: {
    unread: number;
  };
}

const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/notifications`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return MOCK_SUBPAGES.notifications;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

export const useNotifications = () => {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ['provider', 'notifications'],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return MOCK_SUBPAGES.notifications;
      }
      return fetchNotifications();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
