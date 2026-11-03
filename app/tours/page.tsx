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
    <div className="min-h-screen flex flex-col font-sans text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-8">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-sm font-semibold text-[var(--ink-secondary)] mb-3.5 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="text-[var(--brand-deep)] font-bold hover:underline">Home</Link>
              <ChevronRight className="w-4 h-4 text-[var(--ink-secondary)]" />
              <span className="text-[var(--ink)] font-extrabold">{heroTitle}</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold font-display text-[var(--ink)] tracking-tight">
                  {heroTitle}
                </h1>
                <p className="mt-2.5 text-base sm:text-lg text-[var(--ink)] font-normal max-w-2xl leading-relaxed">
                  Compare verified African safari packages from local operators with zero middleman commissions.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto surface-card rounded-full px-4 py-2.5 text-sm font-bold text-[var(--ink)] shadow-sm border border-[var(--glass-border)]">
                <Star className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                4.9 / 5 — 180,175 reviews
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[310px] flex-shrink-0">
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
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className="text-sm font-bold text-[var(--ink)]">Active filters:</span>
                    {activeFilters.map((f) => (
                      <Link
                        key={f.key}
                        href={removeFilterHref(f.key)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-3.5 py-1.5 text-sm font-bold text-[var(--ink)] hover:border-[var(--brand)] hover:bg-white transition-all shadow-2xs"
                      >
                        {f.label}
                        <span aria-hidden="true" className="text-[var(--ink)] text-base font-extrabold leading-none">×</span>
                        <span className="sr-only">Remove filter</span>
                      </Link>
                    ))}
                    <Link href="/tours" className="text-sm font-extrabold text-[var(--brand-deep)] hover:underline ml-1">Clear all</Link>
                  </div>
                )}

                <div className="text-sm sm:text-base font-medium text-[var(--ink)]">
                  Showing <strong className="text-[var(--brand-deep)] font-extrabold">1-{orderedTours.length} of {orderedTours.length}</strong> safari tours. Direct local quotes guaranteed.
                </div>
              </div>

              {/* Tour grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {orderedTours.length > 0 ? orderedTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                )) : (
                  <div className="col-span-full surface-card rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--ink)]">
                    <p className="font-bold text-xl text-[var(--ink)] mb-2 font-display">No safari tours match your filters.</p>
                    <p className="text-base text-[var(--ink)] font-medium">Try removing a filter or <Link href="/tours" className="text-[var(--brand-deep)] font-extrabold hover:underline">resetting the search</Link>.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 text-sm sm:text-base font-bold" aria-hidden="true">
                <span className="px-4 py-2 text-[var(--ink-secondary)] cursor-not-allowed">&lt; Prev</span>
                <span className="px-4 py-2 font-extrabold text-white bg-[var(--brand-deep)] rounded-xl shadow-xs">1</span>
                <span className="px-4 py-2 text-[var(--ink-secondary)] cursor-not-allowed">Next &gt;</span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Related Searches Section */}
      <section className="border-t border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-10 font-sans">
        <div className="max-w-[1230px] mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--ink)] mb-5">Popular Safari Searches</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3.5 text-sm sm:text-[14.5px] font-semibold">
            <Link href="/tours" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Safari Tour Operators</Link>
            <Link href="/operators" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Top 10 Safari Operators</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> African Budget Safaris</Link>
            <Link href="/tours?search=gorilla" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Gorilla Trekking Tours</Link>
            <Link href="/tours?search=chimp" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Chimp Trekking Tours</Link>
            <Link href="/tours?search=overland" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> African Overland Tours</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Camping Safaris</Link>
            <Link href="/tours?comfort=LUXURY" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> African Luxury Safaris</Link>
            <Link href="/tours?search=honeymoon" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Honeymoon Safaris</Link>
            <Link href="/tours?search=photographic" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> African Photographic Safaris</Link>
            <Link href="/tours?tourType=PRIVATE" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Private Safaris</Link>
            <Link href="/tours?search=family" className="text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors flex items-center gap-2 py-0.5"><ChevronRight className="w-4 h-4 text-[var(--brand-deep)] shrink-0" /> Family Safaris</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 font-sans border-t border-[var(--border-soft)]">
        <div className="max-w-[1230px] mx-auto px-4">
          <div className="surface-card rounded-2xl p-6 md:p-10 border border-[var(--glass-border)] shadow-sm flex flex-col md:flex-row gap-10">
            <div className="md:w-[290px] shrink-0">
              <div className="flex items-start gap-4">
                <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 relative border border-[var(--glass-border)] shadow-sm">
                  <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80" alt="Harriet Akinyi" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-[var(--brand-deep)] text-[10px] font-bold px-2 py-0.5 text-white">Expert</div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--ink)]">Harriet Akinyi</h3>
                  <p className="text-sm text-[var(--ink)] leading-relaxed mt-1 font-normal">Zoologist with 20+ years in wildlife conservation communications across Africa.</p>
                  <Link href="/experts/expert-2" className="text-sm font-bold text-[var(--brand-deep)] hover:underline mt-2 inline-block">More about Harriet &rarr;</Link>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <Link href="/faq" className="block text-[var(--brand-deep)] hover:underline font-bold py-0.5">1. Why choose an African safari tour?</Link>
                <Link href="/faq" className="block font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors py-0.5">2. Best African countries for safari?</Link>
                <Link href="/faq" className="block font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors py-0.5">3. Best time of year to travel?</Link>
                <Link href="/faq" className="block font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors py-0.5">4. What wildlife can I expect?</Link>
                <Link href="/faq" className="block font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors py-0.5">5. Typical day on safari?</Link>
                <Link href="/faq" className="block font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors py-0.5">6. What will a safari cost?</Link>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--ink)] mb-3">Frequently Asked Safari Questions</h2>
              <div className="flex items-center gap-2 mb-6 text-sm text-[var(--ink-secondary)]">
                <span>Answered by</span>
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=30&q=80" alt="Harriet Akinyi" className="w-6 h-6 rounded-full object-cover" />
                <strong className="text-[var(--ink)] font-bold">Harriet Akinyi</strong>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center text-sm font-extrabold shrink-0">1</div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--ink)] mb-2">Why should I choose an African safari tour?</h3>
                    <div className="text-sm sm:text-base text-[var(--ink)] leading-relaxed space-y-2 font-normal">
                      <p>Going on safari is an unforgettable experience, offering a heady mix of adventure, thrilling wildlife sightings, cultural encounters and spectacular scenery.</p>
                      <p>It is a chance to retreat to a peaceful way of life, reconnecting with the daily rhythms of nature in Africa&apos;s wildest landscapes.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center text-sm font-extrabold shrink-0">2</div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--ink)] mb-2">Which are the best African countries for going on safari?</h3>
                    <div className="text-sm sm:text-base text-[var(--ink)] leading-relaxed space-y-2 font-normal">
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
      <section className="py-12 font-sans border-t border-[var(--border-soft)]">
        <div className="max-w-[1230px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--ink)]">Traveler Safari Reviews</h2>
              <p className="text-sm sm:text-base text-[var(--ink)] mt-1 font-medium">Real ratings from genuine travelers booked with our local operators.</p>
            </div>
            <div className="inline-flex items-center gap-2 surface-card px-4 py-2 rounded-full text-sm font-bold text-[var(--ink)] border border-[var(--glass-border)] shadow-xs">
              <Star className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
              <span>4.9 / 5</span>
              <span className="text-[var(--ink-secondary)] font-semibold">· 180,175 Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((review) => (
              <div key={review} className="surface-card rounded-2xl p-6 sm:p-7 border border-[var(--glass-border)] shadow-sm">
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-extrabold text-sm border border-[var(--brand)]/15">U</div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-[var(--ink)]">Uzair <span className="font-medium text-[var(--ink-secondary)]">· United Kingdom</span></div>
                    <div className="text-xs sm:text-[13px] font-semibold text-[var(--ink-secondary)]">Verified Traveler · September 2026</div>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] mb-2">&quot;The African dream experience&quot;</h3>
                <div className="text-[var(--gold)] text-sm mb-2.5 flex items-center gap-1.5">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                  <span className="text-[var(--ink)] font-bold text-sm ml-1">5.0</span>
                </div>
                <p className="text-sm sm:text-[14.5px] text-[var(--ink)] leading-relaxed mb-4 line-clamp-3">
                  Our experience with local safari guides was excellent. Everything from the game drives to the bush camp exceeded expectations. Would recommend to any traveler looking for an authentic adventure.
                </p>
                <Link href="/reviews" className="text-sm text-[var(--brand-deep)] hover:underline font-bold inline-flex items-center gap-1">Read full review &rarr;</Link>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-start">
            <Link href="/reviews" className="btn btn-secondary text-sm sm:text-base font-bold px-6 py-3">
              All 180,175 Safari Reviews <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
