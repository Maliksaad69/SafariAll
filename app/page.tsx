import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import prisma from '@/lib/prisma';
import {
  Search,
  MapPin,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Award,
  Star,
  DollarSign,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

export default async function HomePage() {
  const tours = await prisma.tour.findMany({
    take: 6,
    include: {
      operator: true,
      destinations: {
        include: { destination: true },
      },
    },
  });

  const destinations = [
    {
      name: 'Serengeti',
      country: 'Tanzania',
      img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=85',
      tag: 'Great Migration & Big Cats',
      slug: 'serengeti-national-park',
      tours: '1,240+',
    },
    {
      name: 'Masai Mara',
      country: 'Kenya',
      img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=85',
      tag: 'River Crossings & Culture',
      slug: 'masai-mara-national-reserve',
      tours: '980+',
    },
    {
      name: 'Ngorongoro Crater',
      country: 'Tanzania',
      img: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=900&q=85',
      tag: 'Black Rhino & Caldera',
      slug: 'ngorongoro-crater',
      tours: '620+',
    },
    {
      name: 'Bwindi Forest',
      country: 'Uganda',
      img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=900&q=85',
      tag: 'Mountain Gorilla Trekking',
      slug: 'bwindi-impenetrable-forest',
      tours: '340+',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Safari Packages', icon: Search },
    { value: '2,400+', label: 'Verified Operators', icon: ShieldCheck },
    { value: '186+', label: 'National Parks', icon: MapPin },
    { value: '4.9★', label: 'Traveler Rating', icon: Star },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Describe Your Safari',
      desc: 'Tell us your destination, dates, budget, and comfort preference.',
    },
    {
      step: '02',
      title: 'Receive Direct Quotes',
      desc: 'Verified local operators send you bespoke itineraries and pricing.',
    },
    {
      step: '03',
      title: 'Book with Confidence',
      desc: 'Compare, choose, and book — zero commission, direct contact.',
    },
  ];

  const trustBadges = [
    '100% Verified Operators',
    'Zero Commission Markup',
    'Real Traveler Reviews',
    'Secure Direct Booking',
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--ivory)' }}>
      <Navbar />

      <main className="flex-1">

        {/* ════════════════════════════════════════
            HERO — Full-bleed safari photograph
            Glass panel overlaid on the image
            ════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">

          {/* Background Photograph */}
          <div
            className="absolute inset-0 bg-cover bg-center animate-hero-bg"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=90')`,
            }}
          />

          {/* Gradient scrim — warm bottom fade into ivory */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(28,17,8,0.28) 0%, rgba(28,17,8,0.22) 50%, rgba(250,247,240,0.95) 100%)',
            }}
          />

          {/* Right-side subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '180px 180px',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Text Content */}
              <div className="space-y-6">
                {/* Label */}
                <div className="animate-fade-up">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.35)',
                      color: '#FAF7F0',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A235] inline-block animate-pulse" />
                    Africa's Premier Safari Marketplace
                  </span>
                </div>

                {/* Heading */}
                <h1
                  className="text-white animate-fade-up-delay-1 leading-[1.1]"
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontWeight: 600,
                    fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
                    textShadow: '0 2px 16px rgba(28,17,8,0.35)',
                  }}
                >
                  Find Your Perfect{' '}
                  <span style={{ color: '#D4A235' }}>
                    African Safari
                  </span>
                </h1>

                {/* Subtitle */}
                <p
                  className="text-lg leading-relaxed animate-fade-up-delay-2"
                  style={{
                    color: 'rgba(250,247,240,0.88)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    maxWidth: '42ch',
                    textShadow: '0 1px 6px rgba(28,17,8,0.3)',
                  }}
                >
                  Compare thousands of curated safari packages. Request direct quotes from
                  licensed local operators — no commission, no middlemen.
                </p>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 animate-fade-up-delay-3">
                  {trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(250,247,240,0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#FAF7F0',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: '#D4A235' }} />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Glass Search Widget */}
              <div className="animate-fade-up-delay-2">
                <div
                  className="rounded-3xl p-7 sm:p-9"
                  style={{
                    background: 'rgba(250,247,240,0.82)',
                    backdropFilter: 'blur(32px) saturate(2)',
                    WebkitBackdropFilter: 'blur(32px) saturate(2)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 24px 64px rgba(28,17,8,0.2), 0 2px 0 rgba(255,255,255,0.8) inset',
                  }}
                >
                  <div className="mb-6">
                    <h2
                      className="text-2xl font-semibold mb-1"
                      style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                    >
                      Search Safari Packages
                    </h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                      Tailored itineraries from verified operators
                    </p>
                    <SearchAutocomplete />
                  </div>

                  <form action="/tours" method="GET" className="space-y-4">

                    {/* Destination */}
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
                      >
                        Destination
                      </label>
                      <div className="relative">
                        <MapPin
                          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: 'var(--gold)' }}
                        />
                        <select name="country" className="form-input pl-10">
                          <option value="">Anywhere in Africa</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Botswana">Botswana</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                          <option value="Rwanda">Rwanda</option>
                        </select>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
                      >
                        Duration
                      </label>
                      <div className="relative">
                        <Calendar
                          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: 'var(--gold)' }}
                        />
                        <select name="duration" className="form-input pl-10">
                          <option value="">Any Duration</option>
                          <option value="1-3">1–3 Days · Express</option>
                          <option value="4-7">4–7 Days · Classic</option>
                          <option value="8-14">8–14 Days · Grand</option>
                          <option value="15+">15+ Days · Expedition</option>
                        </select>
                      </div>
                    </div>

                    {/* Comfort */}
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
                      >
                        Safari Style
                      </label>
                      <div className="relative">
                        <Award
                          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: 'var(--gold)' }}
                        />
                        <select name="comfort" className="form-input pl-10">
                          <option value="">Any Comfort Level</option>
                          <option value="BUDGET">Budget Camping</option>
                          <option value="MID_RANGE">Mid-Range Lodge</option>
                          <option value="LUXURY">Luxury Tented Camp</option>
                          <option value="FLY_IN">Fly-in Safari</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-2">
                      <Search className="w-4 h-4" />
                      Search Safaris
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* ── Stats Bar ── */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up-delay-3">
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={{
                    background: 'rgba(250,247,240,0.72)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 4px 20px rgba(28,17,8,0.08)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(184,129,26,0.12)', border: '1px solid rgba(184,129,26,0.2)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <div
                      className="text-xl font-bold leading-none"
                      style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                    >
                      {value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            DESTINATIONS — Cards on ivory
            ════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--ivory)' }}>
          <div className="max-w-7xl mx-auto">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <div className="section-rule" />
                <span className="section-label">Top Destinations</span>
                <h2
                  className="mt-2"
                  style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                >
                  Iconic African Wilderness
                </h2>
                <p className="mt-2 text-base max-w-xl" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                  From the Great Migration to mountain gorillas — explore Africa's most extraordinary natural sanctuaries.
                </p>
              </div>
              <Link
                href="/parks"
                className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 transition-colors hover:opacity-80"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
              >
                View All Parks <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {destinations.map((dest, i) => (
                <Link
                  key={i}
                  href={`/parks/${dest.slug}`}
                  className="group relative h-[420px] sm:h-[460px] rounded-2xl overflow-hidden block"
                  style={{
                    boxShadow: '0 4px 24px rgba(28,17,8,0.1)',
                  }}
                >
                  {/* Photograph */}
                  <div
                    className="absolute inset-0 bg-cover bg-center safari-img-hover"
                    style={{ backgroundImage: `url('${dest.img}')` }}
                  />

                  {/* Gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(28,17,8,0.82) 0%, rgba(28,17,8,0.4) 45%, rgba(28,17,8,0.05) 100%)',
                    }}
                  />

                  {/* Country Badge — top */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        background: 'rgba(250,247,240,0.18)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#FAF7F0',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {dest.country}
                    </span>
                  </div>

                  {/* Content — bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <h3
                      className="text-2xl font-semibold text-white mb-1 group-hover:text-[#D4A235] transition-colors duration-300"
                      style={{ fontFamily: 'var(--font-display), serif' }}
                    >
                      {dest.name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'rgba(250,247,240,0.72)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                      {dest.tag}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: '#D4A235', fontFamily: 'var(--font-body)' }}
                      >
                        {dest.tours} tours
                      </span>
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                        style={{
                          background: 'rgba(212,162,53,0.2)',
                          border: '1px solid rgba(212,162,53,0.35)',
                        }}
                      >
                        <ArrowRight className="w-4 h-4 text-[#D4A235]" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            HOW IT WORKS — Parchment background
            ════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--parchment)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <div className="section-rule mx-auto" />
              <span className="section-label">How It Works</span>
              <h2
                className="mt-2"
                style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
              >
                Your Safari, Simplified
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-base" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                We connect you directly with Africa's best local operators — no agency markup, no hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {howItWorks.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="glass-card rounded-2xl p-8 relative overflow-hidden"
                >
                  {/* Step number — decorative */}
                  <span
                    className="absolute -top-4 -right-4 text-[6rem] font-bold leading-none select-none pointer-events-none"
                    style={{
                      fontFamily: 'var(--font-display), serif',
                      color: 'rgba(184,129,26,0.07)',
                    }}
                  >
                    {step}
                  </span>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(184,129,26,0.15), rgba(212,162,53,0.08))',
                      border: '1.5px solid rgba(184,129,26,0.2)',
                    }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ fontFamily: 'var(--font-display), serif', color: 'var(--gold)' }}
                    >
                      {step}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/quote" className="btn-primary inline-flex">
                Request Your Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURED TOURS — Cards on ivory
            ════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--ivory)' }}>
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <div className="section-rule" />
                <span className="section-label">Handcrafted Safari Packages</span>
                <h2
                  className="mt-2"
                  style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                >
                  Featured Safari Holidays
                </h2>
              </div>
              <Link
                href="/tours"
                className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 transition-colors hover:opacity-80"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
              >
                View All 10,000+ Safaris <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            OPERATOR CTA — Full-bleed safari image
            ════════════════════════════════════════ */}
        <section className="relative py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=85')`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(27,67,50,0.85) 0%, rgba(28,17,8,0.75) 100%)',
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="section-label" style={{ color: '#D4A235' }}>For Tour Operators</span>
            <h2
              className="mt-3 mb-5 text-white"
              style={{
                fontFamily: 'var(--font-display), serif',
                fontWeight: 600,
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                textShadow: '0 2px 16px rgba(28,17,8,0.4)',
              }}
            >
              Join Africa's Largest Safari Network
            </h2>
            <p
              className="text-lg mb-10 mx-auto"
              style={{
                color: 'rgba(250,247,240,0.82)',
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                maxWidth: '48ch',
              }}
            >
              Are you a licensed African safari company? Connect with thousands of travelers who request direct quotes daily. No commission. No middlemen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register?role=OPERATOR" className="btn-primary">
                Register Your Agency
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/operators" className="btn-ghost-white">
                Browse Operators
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
