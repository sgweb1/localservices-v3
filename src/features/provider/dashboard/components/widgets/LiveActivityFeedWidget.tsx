import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Eye,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp,
  User,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'view' | 'inquiry' | 'booking' | 'review' | 'follow';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
  location?: string;
}

/**
 * Live Activity Feed Widget - real-time feed z animacjami
 * 
 * Cechy:
 * - Simulated real-time updates
 * - Slide-in animations dla nowych elementów
 * - Pulse indicators dla aktywności
 * - Hover tooltips
 * - Auto-scroll
 */
export const LiveActivityFeedWidget: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'view',
      title: 'Nowe wyświetlenie profilu',
      description: 'Ktoś oglądał Twoją ofertę "Hydraulik 24/7"',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      icon: Eye,
      color: 'cyan',
      location: 'Warszawa, Śródmieście',
    },
    {
      id: '2',
      type: 'inquiry',
      title: 'Nowe zapytanie',
      description: 'Anna K. pyta o dostępność w przyszłym tygodniu',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      icon: MessageSquare,
      color: 'teal',
    },
    {
      id: '3',
      type: 'booking',
      title: 'Nowa rezerwacja',
      description: 'Piotr M. zarezerwował usługę na jutro 10:00',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      icon: Calendar,
      color: 'purple',
    },
  ]);

  const [isLive, setIsLive] = useState(true);

  // Simulate real-time activity
  useEffect(() => {
    if (!isLive) return;

    const mockActivities: Omit<ActivityItem, 'id' | 'timestamp'>[] = [
      {
        type: 'view',
        title: 'Nowe wyświetlenie profilu',
        description: 'Użytkownik z Krakowa oglądał Twój profil',
        icon: Eye,
        color: 'cyan',
        location: 'Kraków',
      },
      {
        type: 'inquiry',
        title: 'Nowe zapytanie',
        description: 'Klient pyta o cenę usługi',
        icon: MessageSquare,
        color: 'teal',
      },
      {
        type: 'review',
        title: 'Nowa opinia',
        description: 'Otrzymałeś 5 gwiazdek od Marka J.',
        icon: Star,
        color: 'orange',
      },
      {
        type: 'follow',
        title: 'Nowy obserwujący',
        description: 'Ktoś dodał Cię do ulubionych',
        icon: User,
        color: 'pink',
      },
    ];

    const interval = setInterval(() => {
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      const newActivity: ActivityItem = {
        ...randomActivity,
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 latest
    }, 8000); // New activity every 8 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-500' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-500' },
    };
    return colors[color] || colors.cyan;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h temu`;
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-600" />
            Aktywność na żywo
          </h2>
          <p className="text-sm text-gray-600 mt-1">Co się dzieje z Twoim profilem</p>
        </div>
        
        {/* Live indicator */}
        <button
          onClick={() => setIsLive(!isLive)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
            transition-all duration-300
            ${isLive 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-600'
            }
          `}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
          {isLive ? 'NA ŻYWO' : 'PAUZA'}
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const colorClasses = getColorClasses(activity.color);
          const isNew = index === 0;

          return (
            <div
              key={activity.id}
              className={`
                group relative
                flex items-start gap-3 p-3 rounded-xl
                bg-white border border-gray-200
                hover:border-gray-300 hover:shadow-md
                transition-all duration-300
                ${isNew ? 'animate-slide-in' : ''}
              `}
            >
              {/* Pulse indicator for new items */}
              {isNew && (
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${colorClasses.text}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  {activity.description}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(activity.timestamp)}
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover action */}
              <button className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 hover:text-cyan-700">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-gradient">
              {activities.filter(a => a.type === 'view').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Wyświetlenia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gradient">
              {activities.filter(a => a.type === 'inquiry').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Zapytania</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gradient">
              {activities.filter(a => a.type === 'booking').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Rezerwacje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gradient">
              {activities.filter(a => a.type === 'review').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Opinie</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4">
        <a 
          href="/provider/analytics"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow group"
        >
          <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
          Zobacz szczegółową analitykę
        </a>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: rgb(243 244 246);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};
