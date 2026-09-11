import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challanApi } from '../services';
import { formatCurrency, formatDate } from '../utils/helpers';
import type { DashboardStats } from '../types';
import { Users, Package, ShoppingCart, TrendingUp, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';

const KpiCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) => (
  <div className="kpi-card group relative overflow-hidden">
    <div className="absolute top-0 left-6 right-6 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="eyebrow text-[8px]">{label.split(' ')[0]}</span>
    </div>
    <p className="text-2xl font-display font-bold text-surface-900 tabular-nums transition-all group-hover:tracking-tight">{value}</p>
    <p className="text-xs text-surface-500 mt-1">{label}</p>
    {sub && <p className="text-[10px] font-mono mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color: color }}>{sub}</p>}
  </div>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    challanApi.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;

  const pendingCount = (stats?.draftChallans ?? 0);

  return (
    <div className="space-y-6 max-w-full">
      {/* greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-black text-white p-6 sm:p-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-lime-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="eyebrow text-[9px] text-lime-400 mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Live overview</p>
            <h1 className="text-2xl font-display font-bold tracking-tight">Welcome back 👋</h1>
            <p className="text-sm text-white/60 mt-1">Here's how your operations are doing today</p>
          </div>
          <Link to="/challans/new" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 text-black text-sm font-semibold transition-all hover:bg-lime-400 hover:-translate-y-0.5 hover:shadow-lime-glow active:scale-95">
            New Challan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Customers" value={stats?.totalCustomers ?? 0} color="#5A680A" sub={`${stats?.customersByStatus?.length ?? 0} statuses`} />
        <KpiCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} color="#A94F9E" sub={`${stats?.lowStockProducts ?? 0} low stock`} />
        <KpiCard icon={ShoppingCart} label="Draft Challans" value={stats?.draftChallans ?? 0} color="#0284C7" sub={`${stats?.confirmedChallans ?? 0} confirmed`} />
        <KpiCard icon={TrendingUp} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="#000000" sub="lifetime value" />
      </div>

      {stats && stats.lowStockProducts > 0 && (
        <div className="card p-5 group hover:-translate-y-0.5 cursor-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:animate-wiggle" style={{ background: `#DC262615`, border: `1px solid #DC262624` }}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-surface-900">Low Stock Alerts</h3>
              <p className="text-xs text-surface-500">{stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} below minimum stock level</p>
            </div>
            <Link to="/products" className="ml-auto text-xs text-surface-400 hover:text-primary font-medium flex items-center gap-1 transition-colors">Review <ArrowRight className="w-3 h-3" /></Link>
          </div>
        </div>
      )}

      <div className="card p-5 group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display font-bold text-surface-900 flex items-center gap-2">
            Recent Challans
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
          </h3>
          <Link to="/challans" className="text-xs text-surface-400 hover:text-lime-700 font-medium flex items-center gap-1 transition-colors group-hover:gap-2">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="space-y-2">
          {stats?.recentChallans?.slice(0, 5).map((ch) => (
            <Link key={ch.id} to={`/challans/${ch.id}`} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-lime-50/60 hover:pl-4 transition-all duration-300 group/row">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-black text-lime-400 flex items-center justify-center text-[9px] font-mono font-semibold">{ch.challanNumber.replace('CH-', '').slice(0, 3)}</span>
                <div>
                  <p className="text-sm font-medium text-surface-900 font-mono group-hover/row:text-black">{ch.challanNumber}</p>
                  <p className="text-xs text-surface-400">{ch.customer?.businessName ?? '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-medium text-surface-900">{ch.totalQuantity} qty</p>
                <span className={`badge text-[9px] badge-${ch.status.toLowerCase()}`}>{ch.status}</span>
              </div>
            </Link>
          ))}
          {(!stats?.recentChallans || stats.recentChallans.length === 0) && <p className="text-sm text-surface-500 text-center py-4">No challans yet</p>}
        </div>
      </div>
    </div>
  );
};