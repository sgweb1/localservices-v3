import React from 'react';
import { MessageCircle, User, Clock, ChevronRight } from 'lucide-react';
import { useRecentMessages } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Ostatnie wiadomości z rozmów
 */
export const RecentMessages: React.FC = () => {
  const { data, isLoading } = useRecentMessages(5);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Mock data
  const conversations = data?.data || [
    {
      id: 1,
      customer_name: 'Jan Kowalski',
      last_message: 'Czy jeszcze są dostępne terminy w ten weekend?',
      time: '5 min temu',
      unread: 1,
    },
    {
      id: 2,
      customer_name: 'Maria Nowak',
      last_message: 'Dziękuję za szybką Service! Polecę Cię znajomym.',
      time: '2 godziny temu',
      unread: 0,
    },
    {
      id: 3,
      customer_name: 'Anna Wójcik',
      last_message: 'O której będziesz jutro?',
      time: '1 dzień temu',
      unread: 0,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Ostatnie wiadomości
        </h3>
        <Link
          to="/provider/messages"
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Brak wiadomości</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              to={`/provider/messages?conv=${conv.id}`}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {conv.customer_name}
                  </p>
                  <div className="flex items-center gap-2">
                    {conv.unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {conv.time}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.last_message}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
