import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { NotificationsCard as NotificationsCardType } from '../../types';
import { Calendar, Star, CheckCircle, Bell } from 'lucide-react';

interface NotificationsCardProps {
  data: NotificationsCardType;
}

/**
 * Widget: Notifications Card
 * 
 * Ostatnie 5 powiadomień systemowych (nowe rezerwacje, opinie, 
 * przypomnienia o weryfikacji). Filtr: tylko przeczytane=false.
 */
export const NotificationsCard: React.FC<NotificationsCardProps> = ({ data }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created': return Calendar;
      case 'new_review': return Star;
      case 'verification_reminder': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_created': return 'from-success to-emerald-500';
      case 'new_review': return 'from-warning to-amber-500';
      case 'verification_reminder': return 'from-primary-500 to-accent-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Powiadomienia</h3>
          {data.unread_count > 0 && (
            <BadgeGradient>{data.unread_count} nowych</BadgeGradient>
          )}
        </div>

        {data.items.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Brak powiadomień</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.items.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
              <a
                key={notification.id}
                href={notification.action_url || '#'}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{notification.created_at}</p>
                </div>

                {/* Unread indicator */}
                {!notification.read_at && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                )}
              </a>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          {data.unread_count > 0 && (
            <button className="flex-1 text-center px-4 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold text-sm transition-all">
              Oznacz jako przeczytane
            </button>
          )}
          <a
            href="/provider/notifications"
            className="flex-1 text-center px-4 py-2 rounded-xl border-2 border-primary-200 text-primary-600 hover:border-primary-400 hover:bg-primary-50 font-semibold text-sm transition-all"
          >
            Zobacz wszystkie
          </a>
        </div>
      </div>
    </GlassCard>
  );
};
