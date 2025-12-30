import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface Conversation {
  id: number;
  customer_id: number;
  provider_id: number;
  booking_id?: number;
  service_id?: number;
  subject?: string;
  last_message?: string;
  last_message_at?: string;
  customer_active: boolean;
  provider_active: boolean;
  customer_read_at?: string;
  provider_read_at?: string;
  created_at: string;
  updated_at: string;
  
  customer?: UserBasic;
  provider?: UserBasic;
  other_user?: UserBasic;
  unread_count?: number;
  is_hidden_for_current_user?: boolean;
}

interface UserBasic {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_online?: boolean;
  last_seen_at?: string;
}

export interface ConversationsResponse {
  data: Conversation[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    unread_count: number;
  };
}

/**
 * Hook do pobierania listy konwersacji
 */
export const useConversations = (showHidden: boolean = false): UseQueryResult<ConversationsResponse> => {
  return useQuery({
    queryKey: ['conversations', showHidden ? 'hidden' : 'active'],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (showHidden) {
        params.show_hidden = '1';
      }
      const response = await apiClient.get<ConversationsResponse>('/conversations', { params });
      return response.data;
    },
    refetchInterval: 30000, // Odświeżaj co 30s
  });
};

/**
 * Hook do pobierania pojedynczej konwersacji
 */
export const useConversation = (conversationId: number): UseQueryResult<Conversation> => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Conversation }>(`/conversations/${conversationId}`);
      return response.data.data;
    },
    enabled: !!conversationId,
  });
};

/**
 * Hook do tworzenia nowej konwersacji
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { provider_id?: number; customer_id?: number; subject?: string }) => {
      const response = await apiClient.post<{ data: Conversation }>('/conversations', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Hook do ukrywania konwersacji
 */
export const useHideConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: number) => {
      await apiClient.post(`/conversations/${conversationId}/hide`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    meta: {
      errorMessage: 'Błąd przy ukrywaniu konwersacji',
    },
  });
};

/**
 * Hook do pokazywania ukrytej konwersacji
 */
export const useUnhideConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: number) => {
      await apiClient.post(`/conversations/${conversationId}/unhide`);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    meta: {
      errorMessage: 'Błąd przy pokazywaniu konwersacji',
    },
  });
};
