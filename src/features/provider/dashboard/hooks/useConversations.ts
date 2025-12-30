import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface ConversationListItem {
  id: number;
  customerName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ConversationListResponse {
  data: ConversationListItem[];
  meta?: { page?: number; total?: number; per_page?: number };
}

async function fetchConversations(): Promise<ConversationListResponse> {
  const response = await apiClient.get<ConversationListResponse>('/provider/conversations');
  return response.data;
}

export function useConversations() {
  return useQuery({
    queryKey: ['provider','conversations'],
    queryFn: fetchConversations,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
