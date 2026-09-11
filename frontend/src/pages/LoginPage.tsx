import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { challanApi } from '../services';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { Logo } from '../components/Logo';
import { LogIn, ArrowRight, ShieldCheck, Headphones, Calculator, CheckCircle2, TrendingUp, PackageCheck, CircleDollarSign } from 'lucide-react';

const quickAccounts = [
  { name: 'Admin', email: 'admin@fundsroom.com', password: 'password123', icon: ShieldCheck, tagline: 'Full access', color: '#A94F9E', bg: '#FAE5F5', border: '#F4CFEF' },
  { name: 'Sales', email: 'sales@fundsroom.com', password: 'password123', icon: ArrowRight, tagline: 'Orders & CRM', color: '#5A680A', bg: '#F5FBC5', border: '#EDF6A0' },
  { name: 'Warehouse', email: 'warehouse@fundsroom.com', password: 'password123', icon: Headphones, tagline: 'Stock & packing', color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD' },
  { name: 'Accounts', email: 'accounts@fundsroom.com', password: 'password123', icon: Calculator, tagline: 'Billing', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [publicStats, setPublicStats] = useState<any>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    challanApi.getPublicStats().then(setPublicStats).catch(() => {});
  }, []);

  // Build bars from real revenueByDay (scale so tallest = 100%)
  const revenueByDay: any[] = publicStats?.revenueByDay ?? [];
  const maxRevenue = Math.max(...revenueByDay.map((d: any) => d.revenue), 1);
  const bars: number[] = revenueByDay.map((d: any) => d.revenue === 0 ? 0 : Math.max(8, (d.revenue / maxRevenue) * 100));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch { setError('Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleQuickLogin = async (e: string, p: string) => {
    setError('');
    setLoading(true);
    try { await login(e, p); navigate('/dashboard'); }
    catch { setError('Quick login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Left panel — black plate with lime/pink */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-black text-white">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(210,232,35,0.22) 0%, transparent 62%)' }} />
        <div className="absolute -bottom-32 -left-24 w-[26rem] h-[26rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(233,192,233,0.18) 0%, transparent 62%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight text-white">FundsRoom</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-medium tracking-tight leading-tight text-white">
            Your whole operation, on <span className="serif-accent" style={{ color: '#E9C0E9' }}>one ledger</span>
          </h2>
          <div className="h-px w-16 bg-lime-500 my-7" />

          {/* Graphical live-ops board */}
          <div className="bg-white rounded-2xl border border-lime-400/20 shadow-2xl overflow-hidden mb-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-lime-700" />
                <span className="text-[11px] font-semibold text-stone-700">operations.fundsroom / today</span>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-lime-900 bg-lime-50 border border-lime-200 px-2 py-1 rounded-md">
                <span className="w-1 h-1 rounded-full bg-lime-600 animate-pulse" /> SYNCED
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400">Total revenue</p>
                  <p className="text-2xl font-medium text-stone-900 tabular-nums tracking-tight">{publicStats ? formatCurrency(publicStats.totalRevenue) : '—'}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> +12.4%
                </span>
              </div>
              <div className="flex items-end gap-1 h-16 mb-3">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t transition-all hover:scale-y-105" style={{ height: `${h}%`, background: h > 0 && revenueByDay[i]?.revenue === maxRevenue && maxRevenue > 1 ? '#AFC216' : h > 0 && i % 2 ? '#E9C0E9' : h > 0 ? '#E0E0E0' : '#2A2A2A' }} />
                ))}
              </div>
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="flex items-center gap-2"><PackageCheck className="w-3.5 h-3.5 text-lime-700" /><span className="text-[11px] font-medium text-stone-700">{publicStats ? `${publicStats.totalProducts} products in stock` : 'Loading stock…'}</span></span>
                <span className="text-[10px] font-mono text-lime-900 bg-lime-50 border border-lime-200 px-1.5 py-0.5 rounded">LIVE</span>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {[
              ['Live stock counts, everywhere at once', 'Every IN and OUT logged automagically as challans move through the funnel.'],
              ['Challans, drafted to confirmed in minutes', 'Multi-step wizard with stock validation so you can never oversell.'],
              ['Follow-ups that never slip', 'CRM reminders keep your pipeline warm without keeping notes in your head.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3 group">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-lime-400 mt-0.5 transition-transform group-hover:scale-110" />
                <div><p className="text-sm font-semibold text-white">{t}</p><p className="text-sm text-white/60 mt-0.5">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { v: publicStats ? formatNumber(publicStats.totalCustomers) : '—', l: 'Customers' },
            { v: publicStats ? formatNumber(publicStats.totalProducts) : '—', l: 'Products' },
            { v: publicStats ? formatNumber(publicStats.confirmedChallans) : '—', l: 'Confirmed' },
          ].map((s) => (
            <div key={s.l} className="text-center py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lime-400/30 transition-all hover:-translate-y-1">
              <p className="text-2xl font-medium text-lime-400 tabular-nums">{s.v}</p>
              <p className="text-[10px] font-mono text-white/50 mt-1 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Logo size="md" className="mx-auto mb-3" />
            <span className="font-semibold text-lg text-stone-900 block">FundsRoom</span>
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-100 border border-lime-300 text-[11px] font-mono text-lime-900 uppercase tracking-wider font-semibold mb-4">Console access</span>
            <h1 className="text-3xl font-medium text-stone-900 tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-stone-500">Sign in to your operations dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 mb-7 space-y-4 shadow-card hover:shadow-card-hover transition-shadow">
            <div>
              <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Email</label>
              <input type="email" className="input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Password</label>
              <input type="password" className="input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-lime-500 text-lime-950 text-sm font-semibold transition-all hover:bg-lime-400 hover:-translate-y-0.5 hover:shadow-lime-glow active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {loading ? <span className="animate-pulse">Signing in…</span> : <><LogIn className="w-4 h-4" /> Sign in</>}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-4"><div className="h-px flex-1 bg-stone-200" /><span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">Test login credentials · all roles</span><div className="h-px flex-1 bg-stone-200" /></div>

          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {quickAccounts.map((acc) => (
              <button key={acc.name} onClick={() => handleQuickLogin(acc.email, acc.password)} disabled={loading} className="group bg-white border border-stone-200 rounded-xl p-3 text-left hover:-translate-y-1 hover:border-stone-300 hover:shadow-card-hover transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ background: acc.bg, border: `1px solid ${acc.border}`, color: acc.color }}>
                    <acc.icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0"><p className="text-sm font-semibold text-stone-800 truncate">{acc.name}</p><p className="text-[10px] text-stone-400 truncate">{acc.tagline}</p></div>
                </div>
                <p className="text-[10px] font-mono text-stone-500 truncate">{acc.email}</p>
                <p className="text-[10px] font-mono text-stone-400 truncate">Pass · {acc.password}</p>
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/')} className="w-full text-sm text-stone-500 hover:text-stone-900 hover:underline underline-offset-4 transition-colors py-2">← Back to home</button>
        </div>
      </div>
    </div>
  );
};