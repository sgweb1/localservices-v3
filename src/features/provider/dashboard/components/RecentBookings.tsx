import React, { useEffect } from 'react';
import { Calendar, MapPin, User, Clock, ChevronRight } from 'lucide-react';
import { useRecentBookings } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/echo';

/**
 * Ostatnie rezerwacje
 */
export const RecentBookings: React.FC = () => {
  const { data, isLoading } = useRecentBookings(5);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Realtime: odśwież po zmianie rezerwacji
  useEffect(() => {
    if (!user?.id || !window.Echo) return;
    const channel = window.Echo.private(`user.${user.id}`);
    const handler = (payload: any) => {
      try {
        if (payload?.metadata?.event?.startsWith('booking.')) {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'bookings'] });
        }
      } catch (_) {}
    };
    channel.listen('NotificationToast', handler);
    return () => { try { channel.stopListening('NotificationToast'); } catch (_) {} };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const bookings = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Potwierdzona',
      pending: 'Oczekująca',
      completed: 'Ukończona',
    };
    return labels[status] || status;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gradient-strong">
          Ostatnie rezerwacje
        </h3>
        <Link
          to="/provider/bookings"
          className="text-sm btn-gradient font-semibold flex items-center gap-1 px-3 py-1 rounded-xl"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Brak rezerwacji</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white font-heading">
                    {booking.service}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <User size={14} />
                    {booking.customer_name}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary-600" />
                  {booking.date} {booking.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary-600" />
                  {booking.location}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
