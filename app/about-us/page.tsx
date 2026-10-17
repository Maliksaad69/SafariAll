import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck, Users, BadgeCheck } from 'lucide-react';

export default function AboutUsPage() {
  const pillars = [
    {
      title: 'Direct operator access',
      text: 'We connect travelers straight to verified African safari operators — no hidden middlemen, no inflated markups.',
      icon: Users,
    },
    {
      title: 'Verified local specialists',
      text: 'Every operator in our network is checked for licensing, reputation, and experience across East, Southern, and Central Africa.',
      icon: ShieldCheck,
    },
    {
      title: 'Tailor-made safari planning',
      text: 'From luxury lodges to budget camping, we make it easy to compare, choose, and request a quote that fits your travel style.',
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">About Us</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--brand-deep)] text-white shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/90 to-transparent" />
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-[var(--brand-light)]">
              <Compass className="h-3.5 w-3.5 text-[var(--brand-light)]" />
              <span>About SafariRequest</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-5 leading-tight">
              A smarter way to compare African safari holidays
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/85 font-light mb-8 max-w-2xl">
              SafariRequest connects travelers directly to verified safari operators, destinations, and custom itineraries across East, Southern, and Central Africa — transparently, with no hidden markups.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/tours" className="btn btn-primary px-6 py-3 rounded-xl text-sm font-semibold shadow-sm">
                Explore Safaris
              </Link>
              <Link href="/operators" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-md transition-all">
                Meet Operators
              </Link>
            </div>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="surface-card rounded-2xl border border-black/5 p-7 shadow-sm hover:border-[var(--brand)]/30 hover:shadow-md transition-all">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold font-display text-[var(--brand-deep)] mb-2.5">
                {title}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">
                {text}
              </p>
            </article>
          ))}
        </section>

        {/* Value Proposition */}
        <section className="mt-12 surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)] mb-6">
            Why travelers trust SafariRequest
          </h2>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-[var(--ink)]/80 leading-relaxed">
            <p>
              Travelers use our marketplace to compare luxury tented camps, private lodges, mobile expeditions, and conservation-led safaris without needing to manually inquire across dozens of fragmented websites.
            </p>
            <p>
              Whether you are planning a classic Serengeti Great Migration safari, an Okavango Delta mokoro excursion in Botswana, or gorilla trekking in Rwanda, SafariRequest lets you filter by price, comfort style, duration, and seasonality before requesting tailored quotes.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-[var(--ink-muted)]">
              Ready to begin planning your safari adventure?
            </div>
            <Link href="/quote/request" className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm">
              <span>Request a Custom Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
