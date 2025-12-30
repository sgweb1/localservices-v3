import React, { useEffect } from 'react';
import { Calendar, MapPin, User, Clock, ChevronRight } from 'lucide-react';
import { useRecentBookings } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/echo';

type RecentBooking = {
  id: string | number;
  service: string;
  customer_name: string;
  status: string;
  date: string;
  time: string;
  location: string;
};

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
      <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/80 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const bookings = (data?.data as RecentBooking[]) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      case 'pending':
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      case 'completed':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white';
      default:
        return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
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
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/70 bg-white/80 shadow-sm">
      <div className="p-6 border-b border-slate-200/70 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Ostatnie rezerwacje
        </h3>
        <Link
          to="/provider/bookings"
          className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-md transition-all"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {!bookings || bookings.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <p>Brak rezerwacji</p>
          </div>
        ) : (
          bookings.map((booking: any) => (
            <div
              key={booking.id}
              className="p-5 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {booking.service}
                  </h4>
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                    <User size={14} className="text-cyan-600" />
                    {booking.customer_name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm ${getStatusColor(booking.status)}`}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-cyan-600" />
                  {booking.date} {booking.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-600" />
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
