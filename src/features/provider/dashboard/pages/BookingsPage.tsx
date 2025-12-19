import React, { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { Calendar, Clock, CheckCircle, Trophy } from 'lucide-react';

/**
 * Bookings Management Page - zgodny z localservices
 * 
 * 4 statystyki + tabela z filtrem statusów + akcje.
 */
export const BookingsPage: React.FC = () => {
  const { data, isLoading, error } = useBookings();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const items = data?.data ?? [];
  const stats = data?.counts ?? { total: 0, pending: 0, confirmed: 0, completed: 0 };

  const filteredItems = statusFilter === 'all' 
    ? items 
    : items.filter(b => b.status === statusFilter);

  return (
    <div className="space-y-8">
      {/* 4 Statystyki - grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Wszystkie rezerwacje</p>
              <p className="text-3xl font-semibold text-slate-900">{stats.total}</p>
            </div>
            <Calendar className="w-10 h-10 text-cyan-500" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Śledź pełny lejek od zapytania do realizacji.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Oczekujące</p>
              <p className="text-3xl font-semibold text-slate-900">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Odpowiedz w ciągu 30 min, by utrzymać Trust Score.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Potwierdzone</p>
              <p className="text-3xl font-semibold text-slate-900">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Zadbaj o przypomnienia SMS dzień przed.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ukończone</p>
              <p className="text-3xl font-semibold text-slate-900">{stats.completed}</p>
            </div>
            <Trophy className="w-10 h-10 text-indigo-500" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Poproś o opinie, aby zwiększyć widoczność.</p>
        </div>
      </div>

      {/* Filtry statusów */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'pending' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Oczekujące ({stats.pending})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'confirmed' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Potwierdzone ({stats.confirmed})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'completed' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Ukończone ({stats.completed})
        </button>
      </div>

      {/* Tabela rezerwacji */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Klient</th>
              <th className="px-4 py-3">Usługa</th>
              <th className="px-4 py-3">Termin</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Ładowanie...</td></tr>
            )}
            {error && !isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-error">Błąd ładowania listy</td></tr>
            )}
            {!isLoading && filteredItems.map(b => (
              <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-semibold text-gray-900">{b.customerName}</td>
                <td className="px-4 py-3 text-gray-700">{b.serviceName}</td>
                <td className="px-4 py-3 text-gray-700">{b.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    b.status==='pending' ? 'bg-amber-100 text-amber-700' :
                    b.status==='confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    b.status==='completed' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {b.status === 'pending' && 'Oczekuje'}
                    {b.status === 'confirmed' && 'Potwierdzone'}
                    {b.status === 'completed' && 'Ukończone'}
                    {b.status === 'cancelled' && 'Anulowane'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-cyan-600 hover:text-cyan-800 font-medium text-sm">
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredItems.length===0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                {statusFilter === 'all' ? 'Brak rezerwacji' : `Brak rezerwacji ze statusem "${statusFilter}"`}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
