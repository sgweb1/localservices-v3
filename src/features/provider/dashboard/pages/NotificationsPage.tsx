import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Calendar, MessageSquare, Star, Bell, Check } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'booking': return Calendar;
    case 'message': return MessageSquare;
    case 'review': return Star;
    default: return Bell;
  }
};

/**
 * Notifications Page - zgodny z localservices
 * 
 * Timeline powiadomień z typami, akcjami, mark as read.
 */
export const NotificationsPage: React.FC = () => {
  const { data, isLoading, error } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const items = data?.data ?? [];
  const unreadCount = data?.counts?.unread ?? 0;

  const filteredItems = filter === 'all' ? items : items.filter(n => !n.isRead);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Powiadomienia</h1>
          <p className="text-sm text-gray-500 mt-1">Zarządzaj alertami i aktualizacjami</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button className="px-4 py-2 text-sm font-medium text-cyan-600 hover:text-cyan-800">
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
      </div>

      {/* Filtry */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unread' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Nieprzeczytane ({unreadCount})
        </button>
      </div>

      {/* Lista powiadomień */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-6 py-12 text-center text-gray-500">Ładowanie...</div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center text-error">Błąd ładowania powiadomień</div>
          )}
          {!isLoading && filteredItems.map(n => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={`px-6 py-4 flex items-start gap-4 ${
                  !n.isRead ? 'bg-cyan-50' : 'hover:bg-gray-50'
                } transition cursor-pointer`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  !n.isRead ? 'bg-cyan-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    !n.isRead ? 'text-cyan-600' : 'text-gray-600'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-gray-900">{n.title}</p>
                    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">{n.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-700">{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="flex-shrink-0 w-2 h-2 bg-cyan-600 rounded-full mt-2"></div>
                )}
              </div>
            );
          })}
          {!isLoading && filteredItems.length===0 && (
            <div className="px-6 py-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Brak powiadomień</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' ? 'Wszystkie powiadomienia są przeczytane' : 'Powiadomienia pojawią się tutaj'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
