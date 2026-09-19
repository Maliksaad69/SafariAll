import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/FilterSidebar';
import TourCard from '@/components/TourCard';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Search, ChevronRight, X } from 'lucide-react';

interface ToursPageProps {
  searchParams: Promise<{
    country?: string;
    comfort?: string;
    duration?: string;
    sort?: string;
  }>;
}

const comfortLabels: Record<string, string> = {
  BUDGET: 'Budget', MID_RANGE: 'Mid-Range', LUXURY: 'Luxury', FLY_IN: 'Fly-in',
};

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams;
  const { country, comfort, duration, sort } = params;

  const whereFilter: any = { isPublished: true };
  if (country) whereFilter.primaryCountry = country;
  if (comfort) whereFilter.comfortLevel = comfort;
  if (duration === '1-3') whereFilter.durationDays = { gte: 1, lte: 3 };
  else if (duration === '4-7') whereFilter.durationDays = { gte: 4, lte: 7 };
  else if (duration === '8-14') whereFilter.durationDays = { gte: 8, lte: 14 };

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { minPriceUsd: 'asc' };
  else if (sort === 'price-desc') orderBy = { minPriceUsd: 'desc' };
  else if (sort === 'duration') orderBy = { durationDays: 'asc' };

  const tours = await prisma.tour.findMany({
    where: whereFilter,
    orderBy,
    include: {
      operator: true,
      destinations: { include: { destination: true } },
    },
  });

  const activeFilters = [
    country && { key: 'country', label: `Country: ${country}` },
    comfort && { key: 'comfort', label: `Style: ${comfortLabels[comfort] ?? comfort}` },
    duration && { key: 'duration', label: `Duration: ${duration} days` },
  ].filter(Boolean) as { key: string; label: string }[];

  const heroTitle = country
    ? `${country} Safari Holidays`
    : 'Find African Safari Packages';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--ivory)' }}>
      <Navbar />

      {/* ── Page Hero Banner ── */}
      <section className="relative py-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=85')`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(28,17,8,0.6) 0%, rgba(250,247,240,0.95) 100%)',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-4" style={{ color: 'rgba(250,247,240,0.7)', fontFamily: 'var(--font-body)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Safari Packages</span>
            {country && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">{country}</span>
              </>
            )}
          </nav>

          <div className="section-rule" />
          <span className="section-label" style={{ color: '#D4A235' }}>Safari Search</span>
          <h1
            className="mt-2 text-white"
            style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              textShadow: '0 2px 12px rgba(28,17,8,0.4)',
            }}
          >
            {heroTitle}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{
              color: 'rgba(250,247,240,0.78)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
            }}
          >
            Compare itineraries offered directly by verified local operators. Zero commission markup.
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <main
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10"
        style={{ backgroundColor: 'var(--ivory)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <FilterSidebar
                currentCountry={country}
                currentComfort={comfort}
                currentDuration={duration}
                currentSort={sort}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">

            {/* Results bar */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
              style={{
                background: '#fff',
                border: '1px solid rgba(228,219,202,0.7)',
                boxShadow: '0 1px 6px rgba(28,17,8,0.04)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                Showing{' '}
                <span
                  className="font-semibold"
                  style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108', fontSize: '1.1rem' }}
                >
                  {tours.length}
                </span>{' '}
                safari {tours.length === 1 ? 'package' : 'packages'}
              </p>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeFilters.map((f) => (
                    <Link
                      key={f.key}
                      href={`/tours?${new URLSearchParams(
                        Object.fromEntries(
                          Object.entries({ country, comfort, duration, sort })
                            .filter(([k, v]) => v && k !== f.key) as [string, string][]
                        )
                      ).toString()}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: 'rgba(184,129,26,0.1)',
                        color: '#8B6914',
                        border: '1px solid rgba(184,129,26,0.22)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {f.label}
                      <X className="w-3 h-3" />
                    </Link>
                  ))}
                  <Link
                    href="/tours"
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
                  >
                    Clear all
                  </Link>
                </div>
              )}
            </div>

            {/* Tour grid or empty state */}
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div
                className="rounded-2xl p-14 text-center space-y-4"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(228,219,202,0.7)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: 'rgba(184,129,26,0.1)', border: '1px solid rgba(184,129,26,0.2)' }}
                >
                  <Search className="w-7 h-7" style={{ color: '#B8811A' }} />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ fontFamily: 'var(--font-display), serif', color: '#1C1108' }}
                >
                  No Safaris Found
                </h3>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                  No packages match your filters. Try clearing some criteria or exploring a different destination.
                </p>
                <Link href="/tours" className="btn-primary inline-flex">
                  Clear All Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
