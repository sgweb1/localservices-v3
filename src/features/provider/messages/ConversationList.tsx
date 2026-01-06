import React, { useState } from 'react';
import { Conversation, ConversationsResponse, useUnhideConversation } from '../hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Eye } from 'lucide-react';

interface ConversationListProps {
  conversations?: ConversationsResponse;
  isLoading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  searchQuery: string;
  filter: 'active' | 'hidden';
  onUnhide?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  searchQuery,
  filter,
  onUnhide,
}) => {
  const { mutate: unhide, isPending: isUnhiding } = useUnhideConversation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-slate-100 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filtered = conversations?.data.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const otherUser = conv.customer || conv.provider;
    return otherUser?.name.toLowerCase().includes(query) || 
           conv.last_message?.toLowerCase().includes(query);
  }) || [];

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        {searchQuery ? 'Brak wyników' : 'Brak konwersacji'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((conversation) => {
        const otherUser = conversation.other_user || conversation.customer || conversation.provider;
        const unreadCount = conversation.unread_count || 0;
        const isUnread = unreadCount > 0;
        const isSelected = conversation.id === selectedId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            onMouseEnter={() => setHoveredId(conversation.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
              isSelected ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : ''
            }`}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {otherUser?.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium text-sm ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                    {otherUser?.name || 'Nieznany użytkownik'}
                  </span>
                  {conversation.last_message_at && (
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { 
                        locale: pl, 
                        addSuffix: true 
                      })}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${isUnread ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                  {conversation.last_message || 'Brak wiadomości'}
                </p>
              </div>

              {/* Unread badge or unhide button */}
              {isUnread && filter === 'active' && (
                <div className="flex-shrink-0 self-center">
                  <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {unreadCount}
                  </div>
                </div>
              )}
              {filter === 'hidden' && hoveredId === conversation.id && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    unhide(conversation.id);
                    onUnhide?.();
                  }}
                  className="flex-shrink-0 p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                  title="Pokaż konwersację"
                >
                  <Eye className="w-4 h-4" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
