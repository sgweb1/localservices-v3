import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { 
  Calendar, 
  MessageSquare, 
  Star, 
  Bell, 
  Check, 
  TrendingUp,
  DollarSign,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
  Search,
  Clock,
  User,
  X
} from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'booking': return Calendar;
    case 'message': return MessageSquare;
    case 'review': return Star;
    case 'payment': return DollarSign;
    case 'marketing': return TrendingUp;
    default: return Bell;
  }
};

const getTypeColor = (type: string) => {
  const colors = {
    booking: 'from-cyan-500 to-teal-500',
    message: 'from-purple-500 to-pink-500',
    review: 'from-yellow-500 to-orange-500',
    payment: 'from-green-500 to-emerald-500',
    marketing: 'from-blue-500 to-indigo-500',
    system: 'from-gray-500 to-gray-600',
  };
  return colors[type as keyof typeof colors] || colors.system;
};

/**
 * Notifications Page - zgodny z localservices
 * 
 * Timeline powiadomień z typami, akcjami, mark as read.
 */
export const NotificationsPage: React.FC = () => {
  const { data, isLoading, error } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'message' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(data?.data ?? []);
  
  useEffect(() => {
    if (data?.data) {
      setNotifications(data.data);
    }
  }, [data]);

  const items = notifications;
  const unreadCount = items.filter(n => !n.isRead).length;

  const filteredItems = items.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter !== 'all' && filter !== 'unread' && n.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return n.title?.toLowerCase().includes(query) || n.message?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  const handleBulkMarkAsRead = () => {
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(n => n.id));
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Teraz';
      if (diffMins < 60) return `${diffMins} min temu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h temu`;
      return date.toLocaleDateString('pl-PL');
    } catch {
      return dateStr;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Wszystkie', count: items.length },
    { value: 'unread', label: 'Nieprzeczytane', count: unreadCount },
    { value: 'booking', label: 'Rezerwacje', count: items.filter(n => n.type === 'booking').length },
    { value: 'message', label: 'Wiadomości', count: items.filter(n => n.type === 'message').length },
    { value: 'review', label: 'Opinie', count: items.filter(n => n.type === 'review').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-cyan-600" />
            <h1 className="text-2xl font-bold text-gray-900">Powiadomienia</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold">
                {unreadCount} nowych
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Zarządzaj alertami i aktualizacjami</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl hover:shadow-lg transition-shadow"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj powiadomień..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtry */}
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`
                px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all
                ${filter === option.value
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === option.value ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Zaznaczono {selectedIds.length} powiadomień
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-4 py-2 bg-white border border-cyan-300 rounded-lg text-sm font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors"
              >
                Oznacz jako przeczytane
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 rounded-lg text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Select All */}
      {filteredItems.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            {selectedIds.length === filteredItems.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
          </button>
        </div>
      )}

      {/* Lista powiadomień */}
      <div className="space-y-3">
        {isLoading && (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-500">Ładowanie...</div>
        )}
        {error && !isLoading && (
          <div className="glass-card rounded-2xl p-12 text-center text-red-600">Błąd ładowania powiadomień</div>
        )}
        {!isLoading && filteredItems.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Brak powiadomień</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Nie znaleziono powiadomień spełniających kryteria' : 'Nie masz jeszcze żadnych powiadomień'}
            </p>
          </div>
        )}
        {!isLoading && filteredItems.map(n => {
          const Icon = getIcon(n.type);
          const isSelected = selectedIds.includes(n.id);
          
          return (
            <div
              key={n.id}
              className={`
                glass-card rounded-2xl p-6 transition-all hover:shadow-lg
                ${!n.isRead ? 'border-l-4 border-cyan-500' : ''}
                ${isSelected ? 'ring-2 ring-cyan-500' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      setSelectedIds(prev => prev.filter(id => id !== n.id));
                    } else {
                      setSelectedIds(prev => [...prev, n.id]);
                    }
                  }}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(n.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className={`font-bold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    </div>
                    <button
                      onClick={() => setShowActions(showActions === n.id ? null : n.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors relative"
                    >
                      <MoreVertical className="w-5 h-5" />

                      {/* Actions Menu */}
                      {showActions === n.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => {
                              if (n.isRead) {
                                handleMarkAsUnread(n.id);
                              } else {
                                handleMarkAsRead(n.id);
                              }
                              setShowActions(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {n.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {n.isRead ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane'}
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(n.id);
                              setShowActions(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(n.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
