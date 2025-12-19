import React from 'react';
import { AlertCircle, MessageSquare, Star } from 'lucide-react';

/**
 * Pending Actions Widget - zgodny z localservices
 * 
 * Pokazuje akcje wymagające uwagi usługodawcy:
 * - Nowe zapytania
 * - Oczekujące rezerwacje
 * - Nowe opinie do odpowiedzi
 */
export const PendingActionsWidget: React.FC = () => {
  // Mock data - zamienić na API
  const pendingActions = [
    { id: 1, type: 'inquiry', title: 'Nowe zapytanie od Anny Nowak', time: '2 godz. temu' },
    { id: 2, type: 'booking', title: 'Oczekująca rezerwacja - Jan Kowalski', time: '5 godz. temu' },
    { id: 3, type: 'review', title: 'Nowa opinia - odpowiedz', time: '1 dzień temu' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-amber-600" />
        <h3 className="text-lg font-bold text-gray-900">Wymagaj uwagi</h3>
      </div>

      <div className="space-y-3">
        {pendingActions.map(action => (
          <div key={action.id} className="p-4 border border-gray-100 rounded-xl bg-white/70 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500 mt-1">{action.time}</p>
            </div>
            {action.type === 'inquiry' && <MessageSquare className="w-5 h-5 text-cyan-600" />}
            {action.type === 'review' && <Star className="w-5 h-5 text-amber-500" />}
          </div>
        ))}
        
        {pendingActions.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Brak oczekujących akcji</p>
          </div>
        )}
      </div>
    </div>
  );
};
