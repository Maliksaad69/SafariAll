import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, CheckCircle, XCircle, ShieldCheck,
  Star, Users, Award, Clock, ArrowRight, ChevronRight,
  Send, ChevronDown,
} from 'lucide-react';

interface TourDetailPageProps {
  params: Promise<{ slug: string }>;
}

const comfortLabel: Record<string, string> = {
  BUDGET: 'Budget Camping',
  MID_RANGE: 'Mid-Range Lodge',
  LUXURY: 'Luxury Tented Camp',
  FLY_IN: 'Fly-in Safari',
};

function getTourImage(country: string, slug: string): string {
  if (slug.includes('serengeti') || country === 'Tanzania')
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85';
  if (slug.includes('mara') || country === 'Kenya')
    return 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=85';
  if (country === 'Uganda')
    return 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1400&q=85';
  return 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1400&q=85';
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;

  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      operator: true,
      itineraries: { orderBy: { dayNumber: 'asc' } },
      destinations: { include: { destination: true } },
    },
  });

  if (!tour) notFound();

  const heroImg = getTourImage(tour.primaryCountry, tour.slug);
  const destNames = tour.destinations.map((d) => d.destination.name).join(', ');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--ivory)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImg}')` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(28,17,8,0.25) 0%, rgba(28,17,8,0.72) 100%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: 'rgba(250,247,240,0.65)', fontFamily: 'var(--font-body)' }}>
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/tours" className="hover:text-white">Safari Packages</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white truncate max-w-xs">{tour.title}</span>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge-pill-white">{tour.durationDays} Days / {tour.durationNights} Nights</span>
            <span className="badge-pill-white">{tour.primaryCountry}</span>
            <span className="badge-pill-gold">{comfortLabel[tour.comfortLevel] ?? tour.comfortLevel}</span>
          </div>

          <h1
            className="text-white max-w-3xl leading-tight"
            style={{
              fontFamily: 'var(--font-display), serif',
              fontWeight: 600,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              textShadow: '0 2px 16px rgba(28,17,8,0.5)',
            }}
          >
            {tour.title}
          </h1>
          <p className="mt-2 text-sm flex items-center gap-2" style={{ color: 'rgba(250,247,240,0.75)', fontFamily: 'var(--font-body)' }}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4A235' }} />
            {destNames}
          </p>
        </div>
      </section>

      {/* ── Main Content + Sticky Sidebar ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Operator row */}
            <div
              className="flex items-center justify-between gap-4 p-5 rounded-2xl"
              style={{ background: '#fff', border: '1px solid rgba(228,219,202,0.7)', boxShadow: '0 1px 8px rgba(28,17,8,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #B8811A, #D4A235)', fontFamily: 'var(--font-display), serif' }}
                >
                  {tour.operator.companyName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: '#1C1108', fontFamily: 'var(--font-body)' }}>
                      {tour.operator.companyName}
                    </span>
                    {tour.operator.isVerified && (
                      <ShieldCheck className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#D4A235] text-[#D4A235]" />
                    <span className="text-xs font-semibold" style={{ color: '#8B6914', fontFamily: 'var(--font-body)' }}>
                      {tour.operator.averageRating}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                      ({tour.operator.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/operators/${tour.operator.slug}`}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
                style={{ color: '#B8811A', fontFamily: 'var(--font-body)' }}
              >
                View Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tour Highlights */}
            <ContentCard title="Tour Overview">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: 'Duration', value: `${tour.durationDays} Days` },
                  { icon: MapPin, label: 'Destination', value: tour.primaryCountry },
                  { icon: Award, label: 'Style', value: comfortLabel[tour.comfortLevel] ?? tour.comfortLevel },
                  { icon: Users, label: 'Type', value: tour.tourType.replace('_', ' ') },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(184,129,26,0.06)', border: '1px solid rgba(184,129,26,0.12)' }}>
                    <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: '#B8811A' }} />
                    <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>{label}</div>
                    <div className="text-sm font-semibold" style={{ color: '#1C1108', fontFamily: 'var(--font-body)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </ContentCard>

            {/* Inclusions & Exclusions */}
            {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
              <ContentCard title="What's Included">
                <div className="grid sm:grid-cols-2 gap-6">
                  {tour.inclusions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#2D6A4F', fontFamily: 'var(--font-body)' }}>Included</p>
                      <ul className="space-y-2">
                        {tour.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2D6A4F' }} />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.exclusions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#c0392b', fontFamily: 'var(--font-body)' }}>Not Included</p>
                      <ul className="space-y-2">
                        {tour.exclusions.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c0392b' }} />
                            {exc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ContentCard>
            )}

            {/* Day-by-Day Itinerary */}
            {tour.itineraries.length > 0 && (
              <ContentCard title="Day-by-Day Itinerary">
                <div className="space-y-0">
                  {tour.itineraries.map((day, idx) => (
                    <div
                      key={day.id}
                      className="flex gap-4 pb-6 relative"
                    >
                      {/* Timeline line */}
                      {idx < tour.itineraries.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-px" style={{ background: 'rgba(228,219,202,0.8)' }} />
                      )}
                      {/* Day circle */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10"
                        style={{
                          background: 'linear-gradient(135deg, #B8811A, #D4A235)',
                          color: '#fff',
                          fontFamily: 'var(--font-body)',
                          boxShadow: '0 2px 8px rgba(184,129,26,0.25)',
                        }}
                      >
                        {day.dayNumber}
                      </div>
                      <div className="flex-1 pt-1.5">
                        <h4
                          className="font-semibold mb-1"
                          style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108', fontSize: '1rem' }}
                        >
                          Day {day.dayNumber}: {day.title}
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                          {day.description}
                        </p>
                        {day.accommodationName && (
                          <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#B8811A', fontFamily: 'var(--font-body)' }}>
                            <Award className="w-3 h-3" /> {day.accommodationName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>
            )}

          </div>

          {/* Right: Sticky Quote Widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">

              {/* Price & Quote Card */}
              <div
                className="rounded-2xl p-6 space-y-5"
                style={{
                  background: 'rgba(250,247,240,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(228,219,202,0.8)',
                  boxShadow: '0 8px 32px rgba(28,17,8,0.1)',
                }}
              >
                <div>
                  <span
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
                  >
                    Starting From
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-4xl font-bold"
                      style={{ fontFamily: 'var(--font-display), serif', color: '#B8811A' }}
                    >
                      ${tour.minPriceUsd.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                      / person
                    </span>
                  </div>
                  {tour.maxPriceUsd && (
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                      Up to ${tour.maxPriceUsd.toLocaleString()} depending on group & dates
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(228,219,202,0.7)' }} />

                <Link
                  href={`/quote/request?tourId=${tour.id}`}
                  className="btn-primary w-full text-center"
                >
                  <Send className="w-4 h-4" />
                  Request Free Quote
                </Link>

                <p className="text-center text-xs" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                  No payment required · Direct operator contact · Response within 24h
                </p>
              </div>

              {/* Operator Trust Card */}
              <div
                className="rounded-2xl p-5 space-y-4"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(228,219,202,0.7)',
                  boxShadow: '0 1px 8px rgba(28,17,8,0.04)',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                  Your Operator
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #B8811A, #D4A235)', fontFamily: 'var(--font-display), serif' }}
                  >
                    {tour.operator.companyName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1C1108', fontFamily: 'var(--font-body)' }}>
                      {tour.operator.companyName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {tour.operator.isVerified && (
                        <span className="badge-green">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(184,129,26,0.07)' }}>
                    <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display), serif', color: '#B8811A' }}>
                      {tour.operator.averageRating}★
                    </div>
                    <div className="text-xs" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>Average Rating</div>
                  </div>
                  <div className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(184,129,26,0.07)' }}>
                    <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display), serif', color: '#B8811A' }}>
                      {tour.operator.totalReviews}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>Reviews</div>
                  </div>
                </div>
                <Link
                  href={`/operators/${tour.operator.slug}`}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-colors hover:bg-[rgba(184,129,26,0.06)]"
                  style={{ color: '#B8811A', border: '1px solid rgba(184,129,26,0.22)', fontFamily: 'var(--font-body)' }}
                >
                  View Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Sub-components ── */
function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: '#fff',
        border: '1px solid rgba(228,219,202,0.7)',
        boxShadow: '0 1px 8px rgba(28,17,8,0.04)',
      }}
    >
      <h2
        className="mb-5 pb-4"
        style={{
          fontFamily: 'var(--font-display), serif',
          color: '#1C1108',
          fontSize: '1.4rem',
          fontWeight: 600,
          borderBottom: '1px solid rgba(228,219,202,0.7)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
