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
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col pr-4">
      {/* Main nav */}
      <div className="glass-card rounded-2xl p-3 mb-3">
        <nav className="space-y-1">
          {navItems.slice(0,5).map(({ to, label, icon: Icon }) => (
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

      {/* Tools Pro */}
      <div className="mb-2 px-2">
        <div className="sidebar-heading">NARZĘDZIA PRO</div>
      </div>
      <div className="glass-card rounded-2xl p-3 mb-3">
        <NavLink
          to="/provider/analytics"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
            isActive ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
          }`}
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
