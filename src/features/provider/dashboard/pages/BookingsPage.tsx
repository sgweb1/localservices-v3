import React from 'react';
import { useBookings } from '../hooks/useBookings';
import { BadgeGradient } from '@/components/ui/BadgeGradient';

export const BookingsPage: React.FC = () => {
  const { data, isLoading, error } = useBookings();
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rezerwacje</h1>
        {data?.counts && (
          <div className="flex items-center gap-2">
            <BadgeGradient className="px-3 py-1">Oczekujące: {data.counts.pending}</BadgeGradient>
            <BadgeGradient className="px-3 py-1">Potwierdzone: {data.counts.confirmed}</BadgeGradient>
            <BadgeGradient className="px-3 py-1">Zrealizowane: {data.counts.completed}</BadgeGradient>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Klient</th>
              <th className="px-4 py-3">Usługa</th>
              <th className="px-4 py-3">Termin</th>
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
            {!isLoading && items.map(b => (
              <tr key={b.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">{b.customerName}</td>
                <td className="px-4 py-3 text-gray-700">{b.serviceName}</td>
                <td className="px-4 py-3 text-gray-700">{b.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    b.status==='pending' ? 'bg-amber-100 text-amber-700' :
                    b.status==='confirmed' ? 'bg-primary-100 text-primary-700' :
                    b.status==='completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
            {!isLoading && items.length===0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Brak rezerwacji</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
