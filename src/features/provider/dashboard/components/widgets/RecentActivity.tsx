import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Recent Activity - zgodny z localservices
 * 
 * Timeline ostatnich aktywności na profilu (widoki, kliknięcia, zapytania).
 */
export const RecentActivity: React.FC = () => {
  // Mock data - zamienić na API
  const activities = [
    { id: 1, type: 'view', text: 'Anna Nowak obejrzała Twój profil', time: '15 min temu' },
    { id: 2, type: 'click', text: 'Jan Kowalski kliknął "Kontakt"', time: '1 godz. temu' },
    { id: 3, type: 'inquiry', text: 'Nowe zapytanie od Marii', time: '3 godz. temu' },
  ];

  return (
    <div className="glass-card rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Activity className="w-6 h-6 text-cyan-600" />
        <h3 className="text-lg font-bold text-gray-900">Ostatnia aktywność</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map(act => (
            <div key={act.id} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{act.text}</p>
                <p className="text-xs text-gray-500 mt-1">{act.time}</p>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Brak ostatniej aktywności</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
