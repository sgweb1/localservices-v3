import React from 'react';
import { Lightbulb } from 'lucide-react';

/**
 * Tips Sidebar - zgodny z localservices
 * 
 * Podpowiedzi i wskazówki dla usługodawcy.
 */
export const TipsSidebar: React.FC = () => {
  // Mock data - zamienić na API
  const tips = [
    'Dodaj zdjęcia do portfolio - profily ze zdjęciami otrzymują 3x więcej zapytań!',
    'Odpowiadaj na zapytania w ciągu 2 godzin - to podnosi Twój Trust Score™.',
    'Uzupełnij dostępność w kalendarzu - klienci chętniej rezerwują terminy.',
  ];

  return (
    <div className="glass-card rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-900">Podpowiedzi</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                {idx + 1}
              </div>
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
