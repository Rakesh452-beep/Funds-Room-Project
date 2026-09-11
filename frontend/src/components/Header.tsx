import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { Logo } from './Logo';
import { Menu, Bell } from 'lucide-react';

export const Header = ({ title, onMenuClick }: { title: string; onMenuClick: () => void }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-stone-100">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-stone-500 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-all hover:scale-105">
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" className="hidden sm:inline-flex" />
        <div>
          <p className="eyebrow text-[9px] mb-0.5 flex items-center gap-1.5">
            FundsRoom
            <span className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
          </p>
          <h2 className="text-base font-semibold text-stone-900 tracking-tight">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-50 border border-lime-200 transition-all hover:border-lime-300 hover:shadow-lime-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-600 animate-pulse" />
          <span className="text-xs font-medium text-lime-900 font-mono">{today}</span>
        </div>
        <button className="relative w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 transition-all hover:text-black hover:border-stone-300 hover:scale-105">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-pink-500" />
        </button>
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-full bg-white border border-stone-200 transition-all hover:border-stone-300 hover:shadow-sm">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-[10px] font-bold text-black font-mono">
            {user ? getInitials(user.name) : '?'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};