import React from 'react';
import { useConversations } from '../dashboard/hooks/useConversations';
import { MessageSquare, Search } from 'lucide-react';
import { PageTitle, Text, Badge, EmptyText, Caption } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

/**
 * Messages Page - zgodny z localservices
 * 
 * Lista konwersacji z klientami, avatary, last message, unread badge.
 */
export const MessagesPage: React.FC = () => {
  const { data, isLoading, error } = useConversations();
  const items = data?.data ?? [];
  const unreadCount = data?.counts?.unread ?? 0;

  return (
    <div className="space-y-6">
      {/* Header z statystykami */}
      <div className="flex items-center justify-between">
        <div>
          <PageTitle gradient>Wiadomości</PageTitle>
          <Text muted size="sm" className="mt-2">Zarządzaj konwersacjami z klientami</Text>
        </div>
        {unreadCount > 0 && (
          <Badge variant="danger" className="text-base px-4 py-2">
            {unreadCount} nieprzeczytanych
          </Badge>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Szukaj rozmów..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Lista konwersacji */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-6 py-12 text-center"><EmptyText>Ładowanie...</EmptyText></div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center"><EmptyText className="text-red-600">Błąd ładowania konwersacji</EmptyText></div>
          )}
          {!isLoading && items.map(c => (
            <div key={c.id} className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {(c.participantName || '?').charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Caption className="font-semibold text-slate-900">{c.participantName || 'Nieznany użytkownik'}</Caption>
                  <Caption muted>{c.lastMessageAt}</Caption>
                </div>
                <Text size="sm" className="text-slate-600 truncate">{c.lastMessage}</Text>
              </div>

              {/* Unread badge */}
              {c.unreadCount > 0 && (
                <Badge variant="danger" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {c.unreadCount}
                </Badge>
              )}
            </div>
          ))}
          {!isLoading && items.length===0 && (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <EmptyText className="font-medium text-base">Brak konwersacji</EmptyText>
              <Text muted size="sm" className="mt-1">Wiadomości pojawią się po pierwszych rezerwacjach</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;
