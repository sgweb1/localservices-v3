import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessagesSquare, Briefcase, Star, Bell, CreditCard, Settings, LifeBuoy, CalendarDays, Lightbulb, TrendingUp, User } from 'lucide-react';
import { useConversations } from '@/features/provider/messages/hooks/useConversations';
import { useUnreadCount } from '@/features/provider/dashboard/hooks/useNotifications';

const navItems = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/bookings', label: 'Rezerwacje', icon: Calendar },
  { to: '/provider/calendar', label: 'Kalendarz', icon: CalendarDays, badge: 'NOWE' },
  { to: '/provider/messages', label: 'Wiadomości', icon: MessagesSquare, dynamic: 'messages' },
  { to: '/provider/services', label: 'Usługi', icon: Briefcase },
  { to: '/provider/reviews', label: 'Opinie', icon: Star },
  { to: '/provider/marketing', label: 'Porady', icon: Lightbulb, badge: 'PRO' },
  { to: '/provider/analytics', label: 'Analityka', icon: TrendingUp },
  { to: '/provider/profile', label: 'Profil', icon: User },
  { to: '/provider/notifications', label: 'Powiadomienia', icon: Bell },
  { to: '/provider/subscription', label: 'Subskrypcja', icon: CreditCard },
  { to: '/provider/settings', label: 'Ustawienia', icon: Settings },
  { to: '/provider/support', label: 'Wsparcie', icon: LifeBuoy },
];

export const Sidebar: React.FC = () => {
  const { data: conversationsData } = useConversations(false);
  const { data: unreadNotifications } = useUnreadCount();
  
  // Policz wszystkie nieprzeczytane wiadomości
  const totalUnread = (conversationsData?.data || []).reduce((sum, conv) => {
    return sum + (conv.unread_count || 0);
  }, 0);

  const notificationCount = unreadNotifications?.unread_count || 0;
  return (
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col pr-4">
      {/* Main nav */}
      <div className="glass-card rounded-2xl p-3 mb-3">
        <nav className="space-y-1">
          {navItems.slice(0,9).map(({ to, label, icon: Icon, badge, dynamic }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  {badge}
                </span>
              )}
              {dynamic === 'messages' && totalUnread > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
              {label === 'Powiadomienia' && notificationCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System */}
      <div className="mb-2 px-2">
        <div className="sidebar-heading">SYSTEM</div>
      </div>
      <div className="glass-card rounded-2xl p-3 mb-3">
        <nav className="space-y-1">
          {navItems.slice(9).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                isActive ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Quick Analytics Card */}
      <div className="glass-card rounded-2xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <TrendingUp className="w-8 h-8 text-teal-600 mb-2" />
        <p className="text-xs font-semibold text-slate-900 mb-1">Analityka PRO</p>
        <p className="text-[10px] text-slate-600 mb-3">Zobacz szczegółowe statystyki swojego profilu</p>
        <NavLink
          to="/provider/analytics"
          className="block text-center text-xs font-bold text-teal-600 bg-white px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-sm mr-auto">Analityka PRO</span>
          <span className="badge-pro">PRO</span>
        </NavLink>
      </div>

      {/* Verification */}
      <div className="mb-2 px-2">
        <div className="sidebar-heading">WERYFIKACJA</div>
      </div>
      <div className="glass-card rounded-2xl p-3">
        <nav className="space-y-1">
          <NavLink to="/provider/certificates" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Star className="w-4 h-4" />
            <span className="text-sm">Certyfikaty</span>
          </NavLink>
          <NavLink to="/provider/verification" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Settings className="w-4 h-4" />
            <span className="text-sm">Weryfikacja</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
