import { useQuery, useMutation, useQueryClient, UseQueryResult, InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  metadata?: any;
  read_at?: string;
  is_edited: boolean;
  edited_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
  uuid: string;
  
  // Relacje
  sender?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: number;
  message_id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  thumbnail_path?: string;
  uuid: string;
  url: string;
  thumbnail_url?: string;
}

export interface MessagesResponse {
  data: Message[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Hook do pobierania wiadomości z konwersacji (z infinite scroll)
 */
export const useMessages = (conversationId: number) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<MessagesResponse>(
        `/conversations/${conversationId}/messages`,
        { params: { page: pageParam, per_page: 50 } }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
  });
};

/**
 * Hook do wysyłania wiadomości
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, body, attachments }: { 
      conversationId: number; 
      body: string;
      attachments?: File[];
    }) => {
      const formData = new FormData();
      formData.append('body', body);
      
      if (attachments) {
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await apiClient.post<{ data: Message }>(
        `/conversations/${conversationId}/messages`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invaliduj messages dla tej konwersacji
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      // Invaliduj conversation żeby status się odświeżył
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
      // Invaliduj listę konwersacji (last_message)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    meta: {
      errorMessage: 'Błąd przy wysyłaniu wiadomości',
    },
  });
};

/**
 * Hook do oznaczania wiadomości jako przeczytane
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: number) => {
      await apiClient.post(`/conversations/${conversationId}/mark-read`);
    },
    onSuccess: (data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
};
/**
 * Hook do usuwania wiadomości
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: number; messageId: number }) => {
      await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    meta: {
      errorMessage: 'Błąd przy usuwaniu wiadomości',
    },
  });
};