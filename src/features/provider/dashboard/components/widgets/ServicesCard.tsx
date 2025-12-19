import React from 'react';
import { Briefcase, Plus, Edit } from 'lucide-react';

interface ServicesCardProps {
  services: any[];
}

/**
 * Services Card - zgodny z localservices
 * 
 * Lista usług w ofercie z możliwością edycji i dodawania.
 */
export const ServicesCard: React.FC<ServicesCardProps> = ({ services }) => {
  return (
    <div className="glass-card rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Briefcase className="w-6 h-6 text-cyan-600" />
        <h3 className="text-lg font-bold text-gray-900">Moje usługi</h3>
      </div>

      <div className="p-6">
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cyan-200 bg-white/70 p-6 text-center">
            <p className="font-bold text-slate-700">Brak usług w ofercie</p>
            <p className="text-sm text-slate-500 mt-2">Dodaj pierwszą usługę, aby klienci mogli zarezerwować wizytę.</p>
            <a href="/provider/services/create" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-white font-semibold shadow-sm hover:bg-cyan-600 transition">
              <Plus className="w-4 h-4" />
              Dodaj usługę
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service, idx) => (
              <div key={idx} className="rounded-xl p-4 border border-slate-100 bg-white/70 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{service.title}</p>
                  <p className="text-xs text-gray-500 truncate">{service.price ? `${service.price} zł` : '—'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {service.is_active ? 'Aktywna' : 'W przygotowaniu'}
                  </span>
                  <a href={`/provider/services/edit/${service.id}`} className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 transition">
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Edytuj</span>
                  </a>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <a href="/provider/services/create" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                <Plus className="w-4 h-4" />
                Dodaj nową
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
