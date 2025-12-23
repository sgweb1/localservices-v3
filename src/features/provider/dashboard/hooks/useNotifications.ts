import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

// Helper do pobierania CSRF tokenu z cookie
const getCsrfToken = (): string => {
  const name = 'XSRF-TOKEN';
  let token = '';
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        token = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return token;
};

export interface Notification {
  id: number;
  event_key: string;
  recipient_type: string;
  data: Record<string, any>;
  channels_sent: string[];
  read: boolean;
  read_at: string | null;
  created_at: string;
  event?: {
    id: number;
    key: string;
    name: string;
  };
  template?: {
    id: number;
    title: string;
  };
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}

const fetchNotifications = async (page = 1, unread = false): Promise<NotificationsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    per_page: '20',
  });
  if (unread) {
    params.append('unread', '1');
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/notifications?${params}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return {
        data: MOCK_SUBPAGES.notifications.data,
        meta: {
          current_page: 1,
          per_page: 20,
          total: MOCK_SUBPAGES.notifications.data.length,
          last_page: 1,
        },
      };
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

const fetchUnreadCount = async (): Promise<UnreadCountResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/unread-count`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return { unread_count: MOCK_SUBPAGES.notifications.counts.unread };
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

const markAsRead = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
};

const markAllAsRead = async (): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
};

export const useNotifications = (page = 1, unread = false) => {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ['notifications', page, unread],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return {
          data: MOCK_SUBPAGES.notifications.data,
          meta: {
            current_page: 1,
            per_page: 20,
            total: MOCK_SUBPAGES.notifications.data.length,
            last_page: 1,
          },
        };
      }
      return fetchNotifications(page, unread);
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useUnreadCount = () => {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      if (isMockMode()) {
        return { unread_count: MOCK_SUBPAGES.notifications.counts.unread };
      }
      return fetchUnreadCount();
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
