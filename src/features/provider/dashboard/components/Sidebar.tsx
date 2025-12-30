import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessagesSquare, Briefcase, CreditCard, Settings, CalendarDays, User, Zap } from 'lucide-react';
import { useConversations } from '@/features/provider/hooks/useConversations';

const navItems = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/bookings', label: 'Rezerwacje', icon: Calendar },
  { to: '/provider/calendar', label: 'Kalendarz', icon: CalendarDays },
  { to: '/provider/messages', label: 'Wiadomości', icon: MessagesSquare, dynamic: 'messages' },
  { to: '/provider/services', label: 'Usługi', icon: Briefcase },
  { to: '/provider/profile', label: 'Profil', icon: User },
  { to: '/provider/monetization/boost', label: 'Boost', icon: Zap },
  { to: '/provider/monetization/subscription', label: 'Subskrypcja', icon: CreditCard },
  { to: '/provider/settings', label: 'Ustawienia', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { data: conversationsData } = useConversations(false);
  
  // Policz wszystkie nieprzeczytane wiadomości
  const totalUnread = (conversationsData?.data || []).reduce((sum, conv) => {
    return sum + (conv.unread_count || 0);
  }, 0);

  return (
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col pr-4">
      <div className="glass-card rounded-2xl p-3 mb-3">
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, dynamic }) => (
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
              {dynamic === 'messages' && totalUnread > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
