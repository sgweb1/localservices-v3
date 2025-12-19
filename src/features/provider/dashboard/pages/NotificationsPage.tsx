import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Calendar, MessageSquare, Star, Bell } from 'lucide-react';
import { BadgeGradient } from '@/components/ui/BadgeGradient';

const getIcon = (type: string) => {
  switch (type) {
    case 'booking': return Calendar;
    case 'message': return MessageSquare;
    case 'review': return Star;
    default: return Bell;
  }
};

export const NotificationsPage: React.FC = () => {
  const { data, isLoading, error } = useNotifications();
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Powiadomienia</h1>
        {data?.counts && data.counts.unread > 0 && (
          <BadgeGradient className="px-3 py-1">Nieprzeczytane: {data.counts.unread}</BadgeGradient>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-4 py-6 text-center text-gray-500">Ładowanie...</div>
          )}
          {error && !isLoading && (
            <div className="px-4 py-6 text-center text-error">Błąd ładowania listy</div>
          )}
          {!isLoading && items.map(n => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={`px-4 py-4 flex items-start gap-3 ${
                  !n.isRead ? 'bg-primary-50' : ''
                }`}
              >
                <div className="mt-1">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{n.title}</div>
                  <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                  <span className="text-xs text-gray-500 mt-2 inline-block">{n.createdAt}</span>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                )}
              </div>
            );
          })}
          {!isLoading && items.length===0 && (
            <div className="px-4 py-6 text-center text-gray-500">Brak powiadomień</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
