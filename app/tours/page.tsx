import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/FilterSidebar';
import TourCard from '@/components/TourCard';
import { getTourCards } from '@/lib/catalog';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';

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

  const tours = await getTourCards();

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

  // All filters except month/travelers (those are preferences, not tour attributes)
  const filteredTours = tours.filter((t) => matchesBase(t));

  // Real facet counts: how many tours would match if only this facet were applied
  const countryCounts: Record<string, number> = {};
  const comfortCounts: Record<string, number> = {};
  const durationCounts: Record<string, number> = {};
  for (const c of Array.from(new Set(tours.map((t) => t.primaryCountry))).sort()) {
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
      ? `${country} Safari Tours & Holidays`
      : 'African Safari Tours & Holidays';

  const activeFilters = [
    country && { label: `Country: ${country}`, key: 'country' },
    comfort && { label: `Comfort: ${comfort === 'MID_RANGE' ? 'Mid-range' : comfort === 'BUDGET' ? 'Budget' : 'Luxury'}`, key: 'comfort' },
    duration && { label: `Duration: ${duration} days`, key: 'duration' },
    tourType && { label: tourType === 'PRIVATE' ? 'Private tour' : 'Shared tour', key: 'tourType' },
    month && { label: `Departure: ${month}`, key: 'month' },
    travelers && { label: `${travelers} travelers`, key: 'travelers' },
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
    <div className="min-h-screen flex flex-col font-sans text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-8">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-[var(--ink-secondary)] uppercase tracking-[0.12em] font-semibold mb-3 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="text-[var(--brand-ink)] hover:underline normal-case">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span className="text-[var(--ink)] normal-case">{heroTitle}</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold font-display text-[var(--ink)] tracking-tight">
                  {heroTitle}
                </h1>
                <p className="mt-2 text-sm text-[var(--ink-secondary)] max-w-2xl">
                  Compare verified African safari packages from local operators with zero middleman commissions.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto surface-card rounded-full px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-sm border border-[var(--glass-border)]">
                <Star className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                4.9 / 5 — 180,175 reviews
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[300px] flex-shrink-0">
              <div className="sticky top-20">
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
            </div>

            {/* Main Results */}
            <div className="flex-1 min-w-0">

              {/* Header Info */}
              <div className="mb-6">
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[12px] font-bold text-[var(--ink-secondary)]">Active filters:</span>
                    {activeFilters.map((f) => (
                      <Link
                        key={f.key}
                        href={removeFilterHref(f.key)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-[12px] font-semibold text-[var(--ink)] hover:border-[var(--brand)] hover:bg-white transition-all shadow-xs"
                      >
                        {f.label}
                        <span aria-hidden="true" className="text-[var(--ink-muted)] text-[14px] leading-none">×</span>
                        <span className="sr-only">Remove filter</span>
                      </Link>
                    ))}
                    <Link href="/tours" className="text-[12px] font-bold text-[var(--brand-ink)] hover:underline ml-1">Clear all</Link>
                  </div>
                )}

                <div className="text-[13px] text-[var(--ink-secondary)]">
                  Showing <strong className="text-[var(--ink)]">1-{orderedTours.length} of {orderedTours.length}</strong> safari tours. Direct local quotes guaranteed.
                </div>
              </div>

              {/* Tour grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {orderedTours.length > 0 ? orderedTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                )) : (
                  <div className="col-span-full surface-card rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--ink-body)]">
                    <p className="font-bold text-lg text-[var(--ink)] mb-2 font-display">No safari tours match your filters.</p>
                    <p className="text-sm text-[var(--ink-secondary)]">Try removing a filter or <Link href="/tours" className="text-[var(--brand-ink)] font-semibold hover:underline">resetting the search</Link>.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 text-sm" aria-hidden="true">
                <span className="px-3.5 py-1.5 text-[var(--ink-muted)] cursor-not-allowed">&lt; Prev</span>
                <span className="px-3.5 py-1.5 font-bold text-white bg-[var(--brand-deep)] rounded-xl shadow-xs">1</span>
                <span className="px-3.5 py-1.5 text-[var(--ink-muted)] cursor-not-allowed">Next &gt;</span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Related Searches Section */}
      <section className="border-t border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-10 font-sans">
        <div className="max-w-[1230px] mx-auto px-4">
          <h2 className="text-lg font-bold font-display text-[var(--ink)] mb-4">Popular Safari Searches</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-[13px]">
            <Link href="/tours" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Safari Tour Operators</Link>
            <Link href="/operators" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Top 10 Safari Operators</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> African Budget Safaris</Link>
            <Link href="/tours?search=gorilla" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Gorilla Trekking Tours</Link>
            <Link href="/tours?search=chimp" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Chimp Trekking Tours</Link>
            <Link href="/tours?search=overland" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> African Overland Tours</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Camping Safaris</Link>
            <Link href="/tours?comfort=LUXURY" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> African Luxury Safaris</Link>
            <Link href="/tours?search=honeymoon" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Honeymoon Safaris</Link>
            <Link href="/tours?search=photographic" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> African Photographic Safaris</Link>
            <Link href="/tours?tourType=PRIVATE" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Private Safaris</Link>
            <Link href="/tours?search=family" className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)]" /> Family Safaris</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 font-sans border-t border-[var(--border-soft)]">
        <div className="max-w-[1230px] mx-auto px-4">
          <div className="surface-card rounded-2xl p-6 md:p-10 border border-[var(--glass-border)] shadow-sm flex flex-col md:flex-row gap-10">
            <div className="md:w-[280px] shrink-0">
              <div className="flex items-start gap-4">
                <div className="w-[64px] h-[64px] rounded-2xl overflow-hidden shrink-0 relative border border-[var(--glass-border)] shadow-sm">
                  <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80" alt="Harriet Akinyi" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-[var(--brand-deep)] text-[9px] font-bold px-1.5 py-0.5 text-white">Expert</div>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-[var(--ink)]">Harriet Akinyi</h3>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mt-1">Zoologist with 20+ years in wildlife conservation communications across Africa.</p>
                  <Link href="/experts/expert-2" className="text-xs font-semibold text-[var(--brand-ink)] hover:underline mt-1.5 inline-block">More about Harriet &rarr;</Link>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 text-xs">
                <Link href="/faq" className="block text-[var(--brand-ink)] hover:underline font-bold">1. Why choose an African safari tour?</Link>
                <Link href="/faq" className="block text-[var(--ink-body)] hover:text-[var(--brand-ink)]">2. Best African countries for safari?</Link>
                <Link href="/faq" className="block text-[var(--ink-body)] hover:text-[var(--brand-ink)]">3. Best time of year to travel?</Link>
                <Link href="/faq" className="block text-[var(--ink-body)] hover:text-[var(--brand-ink)]">4. What wildlife can I expect?</Link>
                <Link href="/faq" className="block text-[var(--ink-body)] hover:text-[var(--brand-ink)]">5. Typical day on safari?</Link>
                <Link href="/faq" className="block text-[var(--ink-body)] hover:text-[var(--brand-ink)]">6. What will a safari cost?</Link>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold font-display text-[var(--ink)] mb-2">Frequently Asked Safari Questions</h2>
              <div className="flex items-center gap-2 mb-6 text-xs text-[var(--ink-secondary)]">
                <span>Answered by</span>
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=30&q=80" alt="Harriet Akinyi" className="w-5 h-5 rounded-full object-cover" />
                <strong className="text-[var(--ink)]">Harriet Akinyi</strong>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold font-display text-[var(--ink)] mb-2">Why should I choose an African safari tour?</h3>
                    <div className="text-sm text-[var(--ink-body)] leading-relaxed space-y-2">
                      <p>Going on safari is an unforgettable experience, offering a heady mix of adventure, thrilling wildlife sightings, cultural encounters and spectacular scenery.</p>
                      <p>It is a chance to retreat to a peaceful way of life, reconnecting with the daily rhythms of nature in Africa&apos;s wildest landscapes.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold font-display text-[var(--ink)] mb-2">Which are the best African countries for going on safari?</h3>
                    <div className="text-sm text-[var(--ink-body)] leading-relaxed space-y-2">
                      <p>All the classic safari countries make wonderful destinations: Tanzania and Kenya for the Great Migration and big cats; Botswana for pristine waterways; Uganda and Rwanda for mountain gorillas; and South Africa for accessible Big Five viewing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safari Reviews Section */}
      <section className="py-10 font-sans border-t border-[var(--border-soft)]">
        <div className="max-w-[1230px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-[var(--ink)]">Traveler Safari Reviews</h2>
              <p className="text-xs text-[var(--ink-secondary)] mt-1">Real ratings from genuine travelers booked with our local operators.</p>
            </div>
            <div className="inline-flex items-center gap-1.5 surface-card px-3.5 py-1.5 rounded-full text-xs font-bold text-[var(--ink)] border border-[var(--glass-border)] shadow-xs">
              <Star className="w-3.5 h-3.5 fill-[var(--gold)] text-[var(--gold)]" />
              <span>4.9 / 5</span>
              <span className="text-[var(--ink-muted)] font-normal">· 180,175 Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((review) => (
              <div key={review} className="surface-card rounded-2xl p-6 border border-[var(--glass-border)] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs">U</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">Uzair <span className="font-normal text-[var(--ink-secondary)]">· United Kingdom</span></div>
                    <div className="text-[11px] text-[var(--ink-muted)]">Verified Traveler · September 2026</div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[var(--ink)] mb-1.5">&quot;The African dream experience&quot;</h3>
                <div className="text-[var(--gold)] text-xs mb-2">★★★★★ <span className="text-[var(--ink)] font-bold">5.0</span></div>
                <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-3 line-clamp-3">
                  Our experience with local safari guides was excellent. Everything from the game drives to the bush camp exceeded expectations. Would recommend to any traveler looking for an authentic adventure.
                </p>
                <Link href="/reviews" className="text-xs text-[var(--brand-ink)] hover:underline font-bold">Read full review &rarr;</Link>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-start">
            <Link href="/reviews" className="btn btn-secondary btn-sm">
              All 180,175 Safari Reviews <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
