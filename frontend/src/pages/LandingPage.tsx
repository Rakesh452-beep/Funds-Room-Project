import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/landing/HeroSection';
import { Logo } from '../components/Logo';
import { ArrowRight, ChevronDown, Users, Package, Truck, TrendingUp, ShieldCheck } from 'lucide-react';

const faqs = [
  { q: 'How does the 14-day free trial work?', a: 'Start using the platform immediately with full access to all features. No credit card required. At the end of your trial, choose a plan that fits your needs.' },
  { q: 'Can I switch plans at any time?', a: 'Absolutely. Upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.' },
  { q: 'What integrations do you support?', a: 'We support WhatsApp Business, Gmail, Tally ERP, and popular accounting tools. More integrations coming soon.' },
  { q: 'How secure is my data?', a: 'Your data is encrypted at rest and in transit. We use industry-standard security practices and run daily backups.' },
  { q: 'Do you offer dedicated support?', a: 'Yes, Enterprise customers get a dedicated account manager and 24/7 priority support via phone, email, and chat.' },
];

const steps = [
  { num: '01', title: 'Schedule kickoff', desc: 'Align on scope, structure, and timeline. Whether it\'s a quick setup or a full migration, we\'ll take it from there.' },
  { num: '02', title: 'Real-time collaboration', desc: 'Work alongside our team with full visibility. Every step follows best practices and thorough QA.' },
  { num: '03', title: 'Launch and scale', desc: 'Go live with confidence. Our system continuously learns and improves, helping your team scale effortlessly.' },
];

const features = [
  { title: 'Customer CRM', desc: 'Track leads, manage relationships, and schedule follow-ups with a complete customer view.', icon: Users },
  { title: 'Product Catalog', desc: 'Manage your complete product inventory with categories, SKUs, and stock tracking.', icon: Package },
  { title: 'Sales & Challans', desc: 'Create multi-step sales orders with real-time stock validation and confirmation flow.', icon: Truck },
  { title: 'Live Analytics', desc: 'Monitor metrics, track KPIs, and get instant visibility across your business operations.', icon: TrendingUp },
];

const growWords = ['Control', 'Rhythm', 'Confidence'];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [word, setWord] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); const t = setInterval(() => setWord((w) => (w + 1) % growWords.length), 2200); return () => clearInterval(t); }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 w-[min(64rem,calc(100%-1.5rem))] z-50 rounded-full bg-stone-100/80 backdrop-blur-xl border border-stone-200 shadow-nav">
        <div className="h-14 flex items-center justify-between px-3 sm:px-5">
          <div className="flex items-center gap-2.5 pl-1">
            <Logo size="sm" />
            <span className="text-[15px] font-semibold text-stone-900 tracking-tight">FundsRoom</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-full transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 decoration-pink-400 transition-colors">Sign in</button>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />

        {/* ─── Rotating word manifesto ─── */}
        <section className="px-6 py-24 bg-lime-500 text-lime-950">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-lime-950 mb-6">The operating system for wholesale</p>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight leading-tight text-lime-950">
              Every challan, every rupee, every follow-up in one place — with{' '}
              <span key={word} className="serif-accent text-lime-950 inline-block animate-fade-in-up" style={{ color: '#1A2E05' }}>{growWords[word]}</span>
            </h2>
            <p className="text-lime-950 mt-6 max-w-xl text-sm sm:text-base">Built for businesses that move goods. Replace spreadsheets, WhatsApp orders and stuck stock counts with a single calm workspace.</p>
          </div>
        </section>

        {/* ─── Feature rack (no icon tiles, editorial list) ─── */}
        <section id="features" className="py-24 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 items-start">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow mb-3">Capabilities</p>
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 leading-tight">
                  Everything an operations team needs. <span className="serif-accent" style={{ color: '#C2410C' }}>Nothing it doesn't.</span>
                </h2>
                <p className="text-stone-500 mt-4 text-sm sm:text-base max-w-sm">Four tightly-integrated modules that share one source of truth — your stock and your customers.</p>
                <div className="mt-8">
                  <button onClick={() => navigate('/login')} className="btn-lime">Explore the dashboard</button>
                </div>
              </div>
              <div className="flex flex-col divide-y divide-stone-200 border-y border-stone-200">
                {features.map((f) => (
                  <div key={f.title} className="py-6 flex items-start gap-5 group">
                    <span className="w-10 h-10 shrink-0 mt-0.5 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-pink-800 group-hover:text-pink-700 group-hover:border-pink-200 group-hover:bg-pink-50 group-hover:scale-110 transition-all">
                      <f.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{f.title}</h3>
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats band ─── */}
        <section className="px-6 py-16 border-y border-stone-200 bg-stone-50">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { v: '2,598', l: 'Orders processed', d: '+24% this month' },
              { v: '99.9%', l: 'Uptime', d: 'Verified SLA' },
              { v: '500+', l: 'Active businesses', d: 'Across 12 states' },
              { v: '4.9/5', l: 'User rating', d: 'From 48k+ reviews' },
            ].map((s) => (
              <div key={s.l} className="border-l-2 border-pink-600 pl-4 group hover:translate-x-1.5 transition-transform duration-300">
                <p className="text-3xl sm:text-4xl font-medium text-stone-900 tabular-nums tracking-tight group-hover:text-pink-700 transition-colors">{s.v}</p>
                <p className="text-sm text-stone-600 mt-1">{s.l}</p>
                <p className="text-xs text-stone-400 mt-0.5 font-mono">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <p className="eyebrow mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 mb-14">How it works</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s) => (
                <div key={s.num} className="relative group hover:bg-lime-50 rounded-2xl p-4 -m-4 transition-colors duration-300">
                  <span className="text-5xl font-medium text-stone-200 serif-accent block mb-4 group-hover:text-lime-600 transition-colors">{s.num}</span>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-lime-950 transition-colors">{s.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-24 px-6 bg-stone-50 border-t border-stone-200">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <p className="eyebrow mb-3">Support</p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 mb-2">Everything you need to know</h2>
              <p className="text-sm text-stone-500">Can't find the answer? Reach out to our support team.</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors">
                    <span className="text-sm font-medium text-stone-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <div className="px-5 pb-5"><p className="text-sm text-stone-500 leading-relaxed">{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 px-6 bg-lime-500">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-lime-950 mb-6">
              Start running your business <span className="serif-accent" style={{ color: '#1A2E05' }}>beautifully</span> today
            </p>
            <p className="text-lime-950 mb-9 max-w-md mx-auto text-sm sm:text-base">Join hundreds of wholesale businesses already using FundsRoom to streamline their operations.</p>
            <button onClick={() => navigate('/login')} className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-lime-950 text-lime-200 text-sm font-medium hover:bg-lime-900 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              Get started free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="bg-lime-500 border-t border-lime-600 py-14 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Logo size="sm" />
                <span className="font-semibold text-lime-950">FundsRoom</span>
              </div>
              <p className="text-sm text-lime-950 max-w-[200px]">The complete ERP + CRM for wholesale businesses.</p>
            </div>
            {[
              { title: 'Platform', links: ['Customers', 'Products', 'Challans', 'Invoicing'] },
              { title: 'Company', links: ['About', 'Help', 'Terms'] },
              { title: 'Social', links: ['X (Twitter)', 'LinkedIn', 'GitHub'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-medium text-lime-950 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => <li key={l}><a href="#" className="text-sm text-lime-950 hover:text-lime-900 underline-offset-4 hover:underline transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-5xl mx-auto h-px bg-lime-600 mb-6" />
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-lime-950">© 2026 FundsRoom. All rights reserved.</p>
            <p className="text-xs text-lime-950 font-mono flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> SOC 2 · 256-bit encryption</p>
          </div>
        </footer>
      </main>
    </div>
  );
};