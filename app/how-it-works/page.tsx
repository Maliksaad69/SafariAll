import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Ticket } from 'lucide-react';

const steps = [
  {
    title: 'Search and compare',
    text: 'Start with your dream destination, travel style, and budget to compare safari tours across Africa.',
    icon: Compass,
  },
  {
    title: 'Shortlist trusted operators',
    text: 'Review verified local specialists with real customer feedback, pricing transparency, and trip experience.',
    icon: ShieldCheck,
  },
  {
    title: 'Book with confidence',
    text: 'Request a quote, check inclusions, and finalize your itinerary directly with the operator that matches your needs.',
    icon: Ticket,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">How It Works</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--brand-deep)] text-white shadow-xl p-8 sm:p-14">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/90 to-transparent" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-[var(--brand-light)]">
              <Compass className="h-3.5 w-3.5 text-[var(--brand-light)]" />
              <span>How It Works</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-4 leading-tight">
              Planning your safari should be simple and transparent
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/85 font-light">
              SafariRequest helps travelers compare trusted operators, inspect transparent packages, and request tailored quotes without high broker markups or confusing itineraries.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="surface-card rounded-2xl border border-black/5 p-7 shadow-sm hover:border-[var(--brand)]/30 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)] px-2.5 py-1 rounded-full bg-[var(--brand-soft)]">
                    Step {index + 1}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display text-[var(--brand-deep)] mb-2.5">
                  {step.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">
                  {step.text}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-12 surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">
              Why travelers choose SafariRequest
            </h2>
          </div>
          <ul className="space-y-3.5 text-sm text-[var(--ink)]/80 mb-8 max-w-2xl">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-2 shrink-0" />
              <span>Compare local operators, safari styles, and park options in one unbiased marketplace.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-2 shrink-0" />
              <span>Save time with clear breakdowns of accommodations, game drives, park fees, and flight logistics.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-2 shrink-0" />
              <span>Request custom quotes directly from local specialists who tailor schedules to your exact dates.</span>
            </li>
          </ul>
          <div className="pt-6 border-t border-black/5 flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-[var(--ink-muted)]">
              Have unique dates or group sizes? We can help.
            </span>
            <Link href="/quote/request" className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm">
              <span>Start Your Safari Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
