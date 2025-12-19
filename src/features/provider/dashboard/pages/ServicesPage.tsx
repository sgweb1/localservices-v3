import React from 'react';
import { useServices } from '../hooks/useServices';
import { BadgeGradient } from '@/components/ui/BadgeGradient';

export const ServicesPage: React.FC = () => {
  const { data, isLoading, error } = useServices();
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Moje Usługi</h1>
        {data?.counts && (
          <div className="flex items-center gap-2">
            <BadgeGradient className="px-3 py-1">Aktywne: {data.counts.active}</BadgeGradient>
            <BadgeGradient className="px-3 py-1">Nieaktywne: {data.counts.inactive}</BadgeGradient>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Nazwa usługi</th>
              <th className="px-4 py-3">Kategoria</th>
              <th className="px-4 py-3">Cena</th>
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
            {!isLoading && items.map(s => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-700">{s.category}</td>
                <td className="px-4 py-3 text-gray-700">{s.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    s.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                  </span>
                </td>
              </tr>
            ))}
            {!isLoading && items.length===0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Brak usług</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesPage;
