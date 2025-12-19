import React from 'react';
import { Calendar, CalendarDays } from 'lucide-react';

interface ReservationsCalendarCardProps {
  reservations: any[];
}

/**
 * Reservations Calendar Card - zgodny z localservices
 * 
 * Lista nadchodzących rezerwacji/zleceń.
 */
export const ReservationsCalendarCard: React.FC<ReservationsCalendarCardProps> = ({ reservations }) => {
  return (
    <div className="glass-card rounded-2xl mt-8">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-900">Nadchodzące zlecenia</h3>
        </div>
        <a href="/provider/availability" className="text-sm text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Pokaż kalendarz
        </a>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {reservations.map((res, idx) => (
            <article key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
              <p className="font-semibold text-slate-900">{res.title || 'Rezerwacja'}</p>
              <p className="text-xs text-slate-600 mt-1">
                {res.date} · {res.time} · {res.customer}
              </p>
              <span className={`inline-block mt-3 text-xs font-bold px-2 py-1 rounded-full ${
                res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {res.status === 'confirmed' ? 'Potwierdzone' : 'Oczekuje'}
              </span>
            </article>
          ))}

          {reservations.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Brak nadchodzących zleceń</p>
              <p className="text-xs text-slate-500 mt-1">Dodaj dostępność lub zaproś klientów</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
