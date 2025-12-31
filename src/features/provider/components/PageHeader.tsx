import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: StatCard[];
  actionButton?: {
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * Standardowy header dla stron providera
 * Spójny design z Dashboard/Calendar/Bookings - glass cards, gradienty cyan/teal
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  stats,
  actionButton,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-500 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_35%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10 blur-3xl" />

      <div className="relative p-8 sm:p-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {subtitle && (
              <p className="text-sm font-semibold text-white/90">{subtitle}</p>
            )}
            <h1 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-md">
              {title}
            </h1>
          </div>

          {actionButton && (
            actionButton.href ? (
              <Link
                to={actionButton.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <actionButton.icon className="w-5 h-5" />
                {actionButton.label}
              </Link>
            ) : (
              <button
                onClick={actionButton.onClick}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <actionButton.icon className="w-5 h-5" />
                {actionButton.label}
              </button>
            )
          )}
        </div>

        {/* Stats Cards */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="glass-card bg-white/90 border border-white/40 rounded-2xl p-4 flex items-center justify-between shadow-lg"
                >
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">{stat.label}</p>
                    <p className="text-3xl font-black mt-1 text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
