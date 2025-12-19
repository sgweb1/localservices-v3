import React from 'react';
import { useConversations } from '../hooks/useConversations';
import { MessageSquare, Search } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-gray-900">Wiadomości</h1>
          <p className="text-sm text-gray-500 mt-1">Zarządzaj konwersacjami z klientami</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-semibold">
            {unreadCount} nieprzeczytanych
          </div>
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
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-6 py-12 text-center text-gray-500">Ładowanie...</div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center text-error">Błąd ładowania konwersacji</div>
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
                  <p className="font-semibold text-gray-900">{c.participantName || 'Nieznany użytkownik'}</p>
                  <p className="text-xs text-gray-500">{c.lastMessageAt}</p>
                </div>
                <p className="text-sm text-gray-600 truncate">{c.lastMessage}</p>
              </div>

              {/* Unread badge */}
              {c.unreadCount > 0 && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">
                  {c.unreadCount}
                </div>
              )}
            </div>
          ))}
          {!isLoading && items.length===0 && (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Brak konwersacji</p>
              <p className="text-sm text-gray-400 mt-1">Wiadomości pojawią się po pierwszych rezerwacjach</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
