import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CircleDollarSign, TrendingUp, PackageCheck, Users } from 'lucide-react';
import MaskedHeading from './MaskedHeading';
import { challanApi } from '../../services';
import { formatCurrency, formatNumber } from '../../utils/helpers';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [publicStats, setPublicStats] = useState<any>(null);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { challanApi.getPublicStats().then(setPublicStats).catch(() => {}); }, []);

  const revenueByDay: any[] = publicStats?.revenueByDay ?? [];
  const maxRevenue = Math.max(...revenueByDay.map((d: any) => d.revenue), 1);
  const heroBars: number[] = revenueByDay.map((d: any) => d.revenue === 0 ? 0 : Math.max(8, (d.revenue / maxRevenue) * 100));

  return (
    <section className="relative pt-28 pb-16 px-6 overflow-hidden bg-background">
      {/* soft radial brand glow, not gradient-text or purple */}
      <div className="absolute -top-32 right-0 w-[36rem] h-[36rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(169,79,158,0.10) 0%, transparent 60%)' }} />

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative">
          {/* Left: editorial copy */}
          <div className={visible ? 'opacity-100 translate-y-0 transition-all duration-700' : 'opacity-0 translate-y-4 transition-all duration-700'}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-xs font-mono tracking-wide text-pink-700 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse" />
              Mini ERP + CRM · v2.0
            </span>

            <MaskedHeading
              tag="h1"
              text="Run your operations with quiet confidence"
              src="/hero-texture.svg"
              fillScale={1.25}
              parallax={20}
              drift={10}
              brightness={1}
              saturation={1}
              reveal="rise"
              duration={1.1}
              stagger={0.09}
              trigger="view"
              align="left"
              weight={500}
              tracking={-0.03}
              lineHeight={1.08}
              textScale={0.115}
              className="mt-6 max-w-2xl"
            />

            <p className="text-stone-500 mt-5 max-w-md text-base sm:text-lg leading-relaxed">
              The focused workspace for wholesale businesses — customers, stock, challans and follow-ups, in one calm place.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button onClick={() => navigate('/login')} className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-500 text-lime-950 text-sm font-semibold hover:bg-lime-400 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                Sign in
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-8 text-xs text-stone-400 font-mono">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Live stock</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-600" /> 256-bit encryption</span>
            </div>
          </div>

          {/* Right: operational composition (no fake browser chrome) */}
          <div className={`relative transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative rounded-3xl border border-stone-200 bg-white shadow-card-hover overflow-hidden">
              {/* top strip */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-pink-600" />
                  <span className="text-xs font-semibold text-stone-700">operations.fundsroom / today</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-lime-900 bg-lime-50 border border-lime-200 px-2 py-1 rounded-md">
                  <span className="w-1 h-1 rounded-full bg-lime-600 animate-pulse" /> SYNCED
                </span>
              </div>

              <div className="p-5">
                {/* revenue line */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Total revenue</p>
                    <p className="text-3xl font-medium text-stone-900 tabular-nums tracking-tight">{publicStats ? formatCurrency(publicStats.totalRevenue) : '—'}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-lime-900 bg-lime-50 border border-lime-200 px-2.5 py-1 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" /> {publicStats?.confirmedChallans ?? '—'} confirmed
                  </span>
                </div>

                {/* bars */}
                <div className="flex items-end gap-1.5 h-24 mb-5">
                  {heroBars.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all duration-300 hover:scale-y-110" style={{ height: `${h}%`, background: h > 0 && revenueByDay[i]?.revenue === maxRevenue && maxRevenue > 1 ? '#AFC216' : h > 0 && i % 2 ? '#E9C0E9' : h > 0 ? '#E0E0E0' : '#F0F0F0' }} />
                  ))}
                </div>

                {/* recent challans */}
                <div className="space-y-1.5">
                  {(publicStats?.recentChallans ?? []).map((r: any) => (
                    <div key={r.challanNumber} className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-md bg-white border border-stone-200 flex items-center justify-center text-[9px] font-mono text-stone-500">{r.challanNumber.slice(-3)}</span>
                        <span className="text-xs font-medium text-stone-700">{r.businessName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-500 tabular-nums">{formatCurrency(r.amount)}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${r.status === 'CONFIRMED' ? 'bg-lime-100 text-lime-800' : 'bg-pink-100 text-pink-700'}`}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!publicStats || publicStats.recentChallans.length === 0) && (
                    <p className="text-center text-xs font-mono text-stone-400 py-4 border border-dashed border-stone-200 rounded-lg">No challans yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* floating chips */}
            <div className="absolute -left-4 top-16 hidden sm:flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 shadow-card-hover animate-fade-in-up">
              <span className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-pink-600" /></span>
              <div><p className="text-xs font-semibold text-stone-800">{publicStats ? `${formatNumber(publicStats.totalCustomers)} customers` : '…'}</p><p className="text-[10px] text-stone-400 font-mono">CRM sync live</p></div>
            </div>
            <div className="absolute -right-3 bottom-16 hidden sm:flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 shadow-card-hover animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <span className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center"><PackageCheck className="w-3.5 h-3.5 text-green-600" /></span>
              <div><p className="text-xs font-semibold text-stone-800">{publicStats ? `${formatNumber(publicStats.totalProducts)} products` : '…'}</p><p className="text-[10px] text-stone-400 font-mono">stock healthy</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};