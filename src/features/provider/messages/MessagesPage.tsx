import React, { useState } from 'react';
import { MessageSquare, Send, Paperclip, Smile, Search, MoreVertical } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useConversations } from './hooks/useConversations';

/**
 * Strona wiadomości - system czatu w stylu Facebook Messenger
 */
export const MessagesPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'active' | 'hidden'>('active');

  const { data: conversations, isLoading } = useConversations(filter === 'hidden');

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar - Lista konwersacji */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Wiadomości</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj konwersacji..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-100 border-0 rounded-full focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Aktywne
            </button>
            <button
              onClick={() => setFilter('hidden')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'hidden'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ukryte
            </button>
          </div>
        </div>

        {/* Lista konwersacji */}
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          searchQuery={searchQuery}
          filter={filter}
          onUnhide={() => {
            if (filter === 'hidden') {
              setFilter('active');
            }
          }}
        />
      </div>

      {/* Okno czatu */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Wybierz konwersację</p>
              <p className="text-sm mt-1">aby rozpocząć rozmowę</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
