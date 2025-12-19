import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessagesSquare, Briefcase, Star, Bell, CreditCard, Settings, LifeBuoy } from 'lucide-react';

const navItems = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/bookings', label: 'Rezerwacje', icon: Calendar },
  { to: '/provider/messages', label: 'Wiadomości', icon: MessagesSquare },
  { to: '/provider/services', label: 'Usługi', icon: Briefcase },
  { to: '/provider/reviews', label: 'Opinie', icon: Star },
  { to: '/provider/notifications', label: 'Powiadomienia', icon: Bell },
  { to: '/provider/subscription', label: 'Subskrypcja', icon: CreditCard },
  { to: '/provider/settings', label: 'Ustawienia', icon: Settings },
  { to: '/provider/support', label: 'Wsparcie', icon: LifeBuoy },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col gap-2 pr-4">
      <div className="glass-card rounded-2xl p-4">
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
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
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
