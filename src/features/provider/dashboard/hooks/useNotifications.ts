import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

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
  const params: Record<string, string> = {
    page: String(page),
    per_page: '20',
  };
  if (unread) {
    params.unread = '1';
  }

  const response = await apiClient.get<NotificationsResponse>('/notifications', { params });
  return response.data;
};

const fetchUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return response.data;
};

const markAsRead = async (id: number): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};

const markAllAsRead = async (): Promise<void> => {
  await apiClient.put('/notifications/read-all');
};

export const useNotifications = (page = 1, unread = false) => {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ['notifications', page, unread],
    queryFn: () => fetchNotifications(page, unread),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useUnreadCount = () => {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
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
