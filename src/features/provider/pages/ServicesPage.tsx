import React from 'react';
import { useServices } from '../dashboard/hooks/useServices';
import { Briefcase, Plus, Edit, Eye } from 'lucide-react';

/**
 * Services Page - zgodny z localservices
 * 
 * Grid usług z obrazkami, views, edycją.
 */
export const ServicesPage: React.FC = () => {
  const { data, isLoading, error } = useServices();
  const items = data?.data ?? [];
  const activeCount = data?.counts?.active ?? 0;
  const inactiveCount = data?.counts?.inactive ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje Usługi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aktywne: {activeCount} · Nieaktywne: {inactiveCount}
          </p>
        </div>
        <a
          href="/provider/services/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Dodaj usługę
        </a>
      </div>

      {/* Grid usług */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full text-center py-12 text-gray-500">Ładowanie...</div>
        )}
        {error && !isLoading && (
          <div className="col-span-full text-center py-12 text-error">Błąd ładowania usług</div>
        )}
        {!isLoading && items.map(s => (
          <div key={s.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition">
            {/* Image placeholder */}
            <div className="h-48 bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Briefcase className="w-16 h-16 text-white opacity-50" />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{s.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  s.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{s.category}</p>
              <p className="text-xl font-bold text-gradient mb-4">{s.price}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>0 wyświetleń</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`/provider/services/edit/${s.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Edit className="w-4 h-4" />
                  Edytuj
                </a>
                <button className="px-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg font-medium transition">
                  Podgląd
                </button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && items.length===0 && (
          <div className="col-span-full text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">Brak usług w ofercie</p>
            <p className="text-sm text-gray-400 mb-6">Dodaj pierwszą usługę, aby klienci mogli Cię znaleźć</p>
            <a
              href="/provider/services/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Dodaj pierwszą usługę
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
