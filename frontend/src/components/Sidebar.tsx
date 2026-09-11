import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Logo } from './Logo';
import { LogOut, LayoutDashboard, Users, Package, FileText, ShieldCheck, X, Lock } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, end }: { to: string; icon: any; label: string; end?: boolean }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `nav-item group ${isActive ? 'nav-item-active' : ''}`}>
    <Icon className="w-[18px] h-[18px]" />
    <span className="flex-1">{label}</span>
    {end && <span className="w-1.5 h-1.5 rounded-full bg-lime-400/80" />}
  </NavLink>
);

const LockedNavItem = ({ icon: Icon, label, hint }: { icon: any; label: string; hint: string }) => (
  <div className="nav-item group opacity-40 cursor-not-allowed" title={`${label} — ${hint}`}>
    <Icon className="w-[18px] h-[18px]" />
    <span className="flex-1">{label}</span>
    <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">{hint}</span>
    <Lock className="w-3 h-3 text-lime-400/60" />
  </div>
);

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 pt-5 pb-2 eyebrow text-[9px] text-white/30 line-clamp-1">{children}</div>
);

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const isSalesOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 bg-black text-white ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* brand plate logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="text-[15px] font-semibold text-white leading-none tracking-tight">FundsRoom</h1>
              <p className="eyebrow text-[8px] mt-1 text-lime-400">Console</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <GroupLabel>Overview</GroupLabel>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
          <GroupLabel>Operations</GroupLabel>
          <NavItem to="/customers" icon={Users} label="Customers" />
          <NavItem to="/products" icon={Package} label="Products" />
          {isSalesOrAdmin
            ? <NavItem to="/challans" icon={FileText} label="Sales Challans" />
            : <LockedNavItem icon={FileText} label="Sales Challans" hint="Sales·Admin" />}
          <GroupLabel>System</GroupLabel>
          {isAdmin
            ? <NavItem to="/users" icon={ShieldCheck} label="User Access" />
            : <LockedNavItem icon={ShieldCheck} label="User Access" hint="Admin only" />}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 border border-pink-300/40 flex items-center justify-center text-xs font-bold text-black font-mono">
                {user ? getInitials(user.name) : '?'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime-400 border-2 border-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="eyebrow text-[8px] mt-0.5 text-lime-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 transition-all hover:text-red-300 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};