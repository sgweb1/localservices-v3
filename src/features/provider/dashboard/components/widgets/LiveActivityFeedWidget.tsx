import { 
  Activity,
  Eye,
  MessageSquare,
  Calendar,
  Star,
  User,
  Bell
} from 'lucide-react';
import { useDashboardWidgets } from '../../hooks/useDashboardWidgets';

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  timestamp?: string;
}

// Mapowanie nazw ikon na komponenty
const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Star,
  Calendar,
  Bell,
  Eye,
  User,
  Activity,
};

/**
 * Live Activity Feed Widget - ostatnie aktywności z bazy danych
 * 
 * Wyświetla: booking requests, reviews, notifications
 * Sortowane chronologicznie, max 10 pozycji
 */
export const LiveActivityFeedWidget: React.FC = () => {
  const { data, isLoading } = useDashboardWidgets();

  const activities: ActivityItem[] = data?.live_activity?.activities || [];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-500' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-500' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500' },
    };
    return colors[color] || colors.cyan;
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
          <p className="text-sm text-gray-600 mt-1">
            Najnowsze wydarzenia z Twojego profilu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {activities.length}
          </span>
        </div>
      </div>

      {/* Activity Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Brak aktywności</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {activities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon] || Activity;
            const colorClasses = getColorClasses(activity.color);
            
            return (
              <div
                key={index}
                className="group relative flex items-start gap-3 p-4 rounded-xl bg-white/50 hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${colorClasses.bg}`}>
                  <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {activity.title}
                    </h3>
                    <span className="flex-shrink-0 text-xs text-gray-500">
                      {activity.created_at}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${colorClasses.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

