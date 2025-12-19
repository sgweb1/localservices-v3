import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationsInboxCardProps {
  notifications: any[];
}

/**
 * Notifications Inbox Card - zgodny z localservices
 * 
 * Lista powiadomień z możliwością oznaczenia jako przeczytane.
 */
export const NotificationsInboxCard: React.FC<NotificationsInboxCardProps> = ({ notifications }) => {
  return (
    <div className="glass-card rounded-2xl mt-8">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Bell className="w-6 h-6 text-cyan-600" />
        <h3 className="text-lg font-bold text-gray-900">Powiadomienia</h3>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {notifications.map((notif, idx) => (
            <article key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-start gap-3">
              {!notif.read_at && (
                <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2"></div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{notif.title}</p>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                <p className="text-xs text-slate-500 mt-2">{notif.created_at}</p>
              </div>
            </article>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Brak powiadomień</p>
              <p className="text-xs text-slate-500 mt-1">Bądź na bieżąco z aktywnością</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
