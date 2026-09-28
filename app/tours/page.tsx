import Navbar from '@/components/Navbar';
import SortSelect from '@/components/SortSelect';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/FilterSidebar';
import TourCard from '@/components/TourCard';
import { safariTours } from '@/lib/site-data';
import Link from 'next/link';
import { ChevronRight, Star, SlidersHorizontal, Search, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ToursPageProps {
  searchParams: Promise<{
    country?: string;
    comfort?: string;
    duration?: string;
    sort?: string;
    search?: string;
    tourType?: string;
    month?: string;
    travelers?: string;
    startDate?: string;
  }>;
}

function durationBucket(days: number): string {
  if (days <= 4) return '1-4';
  if (days <= 7) return '5-7';
  if (days <= 10) return '8-10';
  if (days <= 14) return '11-14';
  return '15+';
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams;
  const { country, comfort, duration, sort, search, tourType, month, travelers } = params;

  const tours = safariTours;

  const matchesBase = (tour: (typeof tours)[number], opts: { ignore?: string } = {}) => {
    const q = (search || '').trim().toLowerCase();
    const matchesSearch = !q || [
      tour.title,
      tour.primaryCountry,
      tour.operator.companyName,
      ...(tour.destinations?.map((d) => d.destination.name) ?? []),
    ].some((value) => value?.toLowerCase().includes(q));
    const matchesCountry = opts.ignore === 'country' || !country || tour.primaryCountry.toLowerCase() === country.toLowerCase();
    const matchesComfort = opts.ignore === 'comfort' || !comfort || tour.comfortLevel === comfort;
    const matchesDuration = opts.ignore === 'duration' || !duration || durationBucket(Number(tour.durationDays || 0)) === duration;
    const matchesType = opts.ignore === 'tourType' || !tourType || tour.tourType === tourType;
    return matchesSearch && matchesCountry && matchesComfort && matchesDuration && matchesType;
  };

  const filteredTours = tours.filter((t) => matchesBase(t));

  const countryCounts: Record<string, number> = {};
  const comfortCounts: Record<string, number> = {};
  const durationCounts: Record<string, number> = {};
  for (const c of ['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Rwanda', 'Zimbabwe']) {
    countryCounts[c] = tours.filter((t) => matchesBase(t, { ignore: 'country' }) && t.primaryCountry.toLowerCase() === c.toLowerCase()).length;
  }
  for (const c of ['LUXURY_PLUS', 'LUXURY', 'MID_RANGE', 'BUDGET']) {
    comfortCounts[c] = tours.filter((t) => matchesBase(t, { ignore: 'comfort' }) && t.comfortLevel === c).length;
  }
  for (const d of ['1-4', '5-7', '8-10', '11-14', '15+']) {
    durationCounts[d] = tours.filter((t) => matchesBase(t, { ignore: 'duration' }) && durationBucket(Number(t.durationDays || 0)) === d).length;
  }

  const orderedTours = [...filteredTours].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return a.minPriceUsd - b.minPriceUsd;
      case 'price_desc': return b.minPriceUsd - a.minPriceUsd;
      case 'rating_desc': return (b.operator?.averageRating ?? 0) - (a.operator?.averageRating ?? 0);
      case 'duration_asc': return (a.durationDays ?? 0) - (b.durationDays ?? 0);
      default: return 0;
    }
  });

  const heroTitle = search
    ? `Search results for “${search}”`
    : country
      ? `${country} Safari Packages`
      : 'African Safari Tours & Itineraries';

  const activeFilters = [
    country && { label: `Country: ${country}`, key: 'country' },
    comfort && { label: `Comfort: ${comfort === 'MID_RANGE' ? 'Mid-range' : comfort === 'BUDGET' ? 'Budget' : 'Luxury'}`, key: 'comfort' },
    duration && { label: `Duration: ${duration} days`, key: 'duration' },
    tourType && { label: tourType === 'PRIVATE' ? 'Private tour' : 'Shared group', key: 'tourType' },
    month && { label: `Departure: ${month}`, key: 'month' },
    travelers && { label: `${travelers} travelers`, key: 'travelers' },
    search && { label: `Keyword: ${search}`, key: 'search' },
  ].filter(Boolean) as { label: string; key: string }[];

  const removeFilterHref = (key: string) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== key && v) sp.set(k, v);
    }
    const qs = sp.toString();
    return qs ? `/tours?${qs}` : '/tours';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)] font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-16">
        {/* ── Modern Hero Banner ── */}
        <div className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white py-12 border-b border-amber-900/20 shadow-md">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-amber-200/80 uppercase tracking-widest font-bold mb-4 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500/70" />
              <span className="text-amber-400 font-extrabold">{heroTitle}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Handcrafted African Safaris
                </div>
                <h1 className="text-[32px] md:text-[44px] font-extrabold leading-tight font-display tracking-tight text-white">
                  {heroTitle}
                </h1>
                <p className="mt-2 text-[14.5px] text-stone-300 leading-relaxed max-w-2xl">
                  Compare prices, day-by-day itineraries, and verified traveler reviews for luxury and mid-range safaris across Tanzania, Kenya, South Africa, Uganda, and Botswana.
                </p>
              </div>

              <div className="inline-flex flex-col items-start gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs font-bold self-start md:self-center shadow-lg">
                <div className="flex items-center gap-1.5 text-amber-400 text-sm font-extrabold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5 Average Rating</span>
                </div>
                <span className="text-stone-300 font-medium">Based on 180,175 verified safari traveler reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="max-w-[1230px] mx-auto px-4 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[290px] flex-shrink-0">
              <FilterSidebar
                currentCountry={country}
                currentComfort={comfort}
                currentDuration={duration}
                currentSort={sort}
                currentSearch={search}
                currentMonth={month}
                currentTravelers={travelers}
                comfortCounts={comfortCounts}
                countryCounts={countryCounts}
                durationCounts={durationCounts}
              />
            </div>

            {/* Main Results Container */}
            <div className="flex-1 min-w-0">

              {/* Top Control Bar (Summary & Active Filters) */}
              <div className="bg-white border border-[var(--border)] rounded-2xl p-4 mb-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Search Results</span>
                    <h2 className="text-[20px] font-extrabold text-[var(--ink)] font-display">
                      Showing {orderedTours.length} {orderedTours.length === 1 ? 'Safari Package' : 'Safari Packages'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--ink-secondary)] hidden sm:inline">Sort:</span>
                    <SortSelect currentSort={sort} />
                  </div>
                </div>

                {/* Active Filter Pills Strip */}
                {activeFilters.length > 0 && (
                  <div className="mt-3.5 pt-3.5 border-t border-[var(--border-soft)] flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-extrabold text-[var(--ink-muted)] uppercase tracking-wider">Active:</span>
                    {activeFilters.map((f) => (
                      <Link
                        key={f.key}
                        href={removeFilterHref(f.key)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1 text-[12px] font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs group"
                      >
                        {f.label}
                        <X className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-900" />
                      </Link>
                    ))}
                    <Link
                      href="/tours"
                      className="text-[12px] font-bold text-[var(--gold)] hover:underline ml-1"
                    >
                      Clear all
                    </Link>
                  </div>
                )}
              </div>

              {/* Tour Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {orderedTours.length > 0 ? (
                  orderedTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-[var(--border-strong)] bg-white p-12 text-center text-[var(--ink-secondary)] shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-[var(--gold)] flex items-center justify-center mx-auto mb-3">
                      <SlidersHorizontal className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-[var(--ink)] text-xl font-display mb-1">No safaris found matching your criteria</h3>
                    <p className="text-sm text-[var(--ink-secondary)] mb-4 max-w-md mx-auto">
                      Try removing some of your selected filters or broadening your search parameters.
                    </p>
                    <Link
                      href="/tours"
                      className="btn btn-primary btn-md inline-flex items-center gap-2"
                    >
                      Reset All Filters
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Related Category Quick Links ── */}
        <section className="bg-white border-t border-[var(--border)] py-12 mt-12">
          <div className="max-w-[1230px] mx-auto px-4">
            <h3 className="text-[20px] font-extrabold text-[var(--ink)] font-display mb-6">Popular Safari Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13.5px]">
              <Link href="/tours?country=Tanzania" className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-page)] hover:bg-[var(--gold-soft)] font-bold text-[var(--ink)] hover:text-[var(--gold-ink)] transition-colors flex items-center justify-between">
                <span>Tanzania Safaris</span>
                <ChevronRight className="w-4 h-4 text-[var(--gold)]" />
              </Link>
              <Link href="/tours?country=Kenya" className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-page)] hover:bg-[var(--gold-soft)] font-bold text-[var(--ink)] hover:text-[var(--gold-ink)] transition-colors flex items-center justify-between">
                <span>Kenya Safaris</span>
                <ChevronRight className="w-4 h-4 text-[var(--gold)]" />
              </Link>
              <Link href="/tours?country=Uganda" className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-page)] hover:bg-[var(--gold-soft)] font-bold text-[var(--ink)] hover:text-[var(--gold-ink)] transition-colors flex items-center justify-between">
                <span>Gorilla Trekking</span>
                <ChevronRight className="w-4 h-4 text-[var(--gold)]" />
              </Link>
              <Link href="/tours?comfort=LUXURY" className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-page)] hover:bg-[var(--gold-soft)] font-bold text-[var(--ink)] hover:text-[var(--gold-ink)] transition-colors flex items-center justify-between">
                <span>Luxury Fly-in Safaris</span>
                <ChevronRight className="w-4 h-4 text-[var(--gold)]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
