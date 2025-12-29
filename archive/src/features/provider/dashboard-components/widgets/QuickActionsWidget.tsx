import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  Settings, 
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock
} from 'lucide-react';

/**
 * Quick Actions Widget - interaktywny widget z szybkimi akcjami
 * 
 * Cechy:
 * - Animated hover states
 * - Click ripple effect
 * - Action completion feedback
 * - Tooltips with hints
 */
export const QuickActionsWidget: React.FC = () => {
  const [clickedAction, setClickedAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string, href: string) => {
    setClickedAction(actionId);
    setTimeout(() => {
      setClickedAction(null);
      window.location.href = href;
    }, 300);
  };

  const actions = [
    {
      id: 'add-service',
      label: 'Dodaj usługę',
      description: 'Stwórz nową ofertę',
      icon: Plus,
      href: '/provider/services/new',
      color: 'from-cyan-500 to-teal-500',
      hoverColor: 'hover:from-cyan-600 hover:to-teal-600',
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Kalendarz',
      description: 'Zarządzaj dostępnością',
      icon: Calendar,
      href: '/provider/calendar',
      color: 'from-teal-500 to-cyan-500',
      hoverColor: 'hover:from-teal-600 hover:to-cyan-600',
      badge: 'NOWE',
    },
    {
      id: 'messages',
      label: 'Wiadomości',
      description: 'Odpowiedz klientom',
      icon: MessageSquare,
      href: '/provider/messages',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      badge: '3',
    },
    {
      id: 'analytics',
      label: 'Analityka',
      description: 'Zobacz statystyki',
      icon: TrendingUp,
      href: '/provider/analytics',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600',
      badge: null,
    },
    {
      id: 'marketing',
      label: 'Marketing',
      description: 'Porady i promocje',
      icon: Sparkles,
      href: '/provider/marketing',
      color: 'from-yellow-500 to-orange-500',
      hoverColor: 'hover:from-yellow-600 hover:to-orange-600',
      badge: 'PRO',
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      description: 'Konfiguracja profilu',
      icon: Settings,
      href: '/provider/settings',
      color: 'from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
      badge: null,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Szybkie akcje</h2>
          <p className="text-sm text-gray-600 mt-1">Najczęściej używane funkcje</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-cyan-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isClicked = clickedAction === action.id;

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id, action.href)}
              className={`
                group relative overflow-hidden
                rounded-xl p-4 
                bg-gradient-to-br ${action.color} ${action.hoverColor}
                text-white
                transition-all duration-300
                hover:scale-105 hover:shadow-xl
                active:scale-95
                ${isClicked ? 'scale-95' : ''}
              `}
            >
              {/* Ripple effect overlay */}
              {isClicked && (
                <div className="absolute inset-0 bg-white/30 animate-ripple"></div>
              )}

              {/* Badge */}
              {action.badge && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
                  <span className="text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {action.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Label */}
              <div className="text-sm font-bold text-center mb-1">
                {action.label}
              </div>

              {/* Description - pokazuje się na hover */}
              <div className="text-xs text-white/80 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {action.description}
              </div>

              {/* Success checkmark animation */}
              {isClicked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white animate-scale-in" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tips section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Wskazówka dnia</p>
            <p className="text-xs text-gray-600 mt-1">
              Regularnie aktualizuj kalendarz dostępności, aby otrzymywać więcej rezerwacji!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
