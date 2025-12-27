import React from 'react';
import { Calendar, MapPin, User, Clock, ChevronRight } from 'lucide-react';
import { useRecentBookings } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Ostatnie rezerwacje
 */
export const RecentBookings: React.FC = () => {
  const { data, isLoading } = useRecentBookings(5);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Mock data dla dev
  const bookings = data?.data || [
    {
      id: 1,
      customer_name: 'Jan Kowalski',
      service: 'Naprawa kranu',
      date: '2025-12-27',
      time: '14:30',
      status: 'confirmed',
      location: 'ul. Główna 5, Warszawa',
    },
    {
      id: 2,
      customer_name: 'Maria Nowak',
      service: 'Montaż oświetlenia',
      date: '2025-12-28',
      time: '10:00',
      status: 'pending',
      location: 'ul. Brzozowa 12, Warszawa',
    },
    {
      id: 3,
      customer_name: 'Piotr Wiśniewski',
      service: 'Przegląd instalacji',
      date: '2025-12-29',
      time: '15:00',
      status: 'completed',
      location: 'ul. Leśna 8, Piaseczno',
    },
  ];

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
    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Ostatnie rezerwacje
        </h3>
        <Link
          to="/provider/bookings"
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
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
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
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
