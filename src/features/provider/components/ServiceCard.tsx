import React from 'react';
import { Briefcase, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  id: number;
  name: string;
  category: string;
  price: string;
  status: 'active' | 'inactive';
  views?: number;
  imageUrl?: string;
}

/**
 * Standardowa karta usługi providera
 * Glass-card design spójny z resztą panelu
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  category,
  price,
  status,
  views = 0,
  imageUrl,
}) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-slate-200/70">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,transparent_50%)]" />
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Briefcase className="w-16 h-16 text-white opacity-60 relative z-10" />
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{name}</h3>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              status === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {status === 'active' ? 'Aktywna' : 'Nieaktywna'}
          </span>
        </div>

        <p className="text-sm text-slate-600">{category}</p>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            {price}
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">{views}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Link
            to={`/provider/services/edit/${id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
          >
            <Edit className="w-4 h-4" />
            Edytuj
          </Link>
          <button className="px-4 py-2.5 rounded-xl text-cyan-600 hover:bg-cyan-50 font-semibold transition-all">
            Podgląd
          </button>
        </div>
      </div>
    </div>
  );
};
