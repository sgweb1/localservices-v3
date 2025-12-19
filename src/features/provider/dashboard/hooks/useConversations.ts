import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { conversations as mockConversations } from '../mocks/subpages';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchConversations(): Promise<ConversationListResponse> {
  if (isMockMode()) {
    return { data: mockConversations };
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/provider/conversations`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    if (import.meta.env.DEV) return { data: mockConversations };
    throw new Error(`Conversations API error: ${res.status}`);
  }
  return res.json();
}

export function useConversations() {
  return useQuery({
    queryKey: ['provider','conversations'],
    queryFn: fetchConversations,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
