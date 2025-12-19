import React from 'react';
import { useConversations } from '../hooks/useConversations';
import { BadgeGradient } from '@/components/ui/BadgeGradient';

export const MessagesPage: React.FC = () => {
  const { data, isLoading, error } = useConversations();
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wiadomości</h1>
        {data?.counts && (
          <BadgeGradient className="px-3 py-1">Nieprzeczytane: {data.counts.unread}</BadgeGradient>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Rozmówca</th>
              <th className="px-4 py-3">Ostatnia wiadomość</th>
              <th className="px-4 py-3">Czas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Ładowanie...</td></tr>
            )}
            {error && !isLoading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-error">Błąd ładowania listy</td></tr>
            )}
            {!isLoading && items.map(c => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">{c.participantName}</td>
                <td className="px-4 py-3 text-gray-700 truncate max-w-[420px]">{c.lastMessage}</td>
                <td className="px-4 py-3 text-gray-700">{c.lastMessageAt}</td>
                <td className="px-4 py-3">
                  {c.unreadCount > 0 ? (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700">{c.unreadCount} nowe</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && items.length===0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Brak rozmów</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagesPage;
