import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/FilterSidebar';
import TourCard from '@/components/TourCard';
import { safariTours } from '@/lib/site-data';
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

  // All filters except month/travelers (those are preferences, not tour attributes)
  const filteredTours = tours.filter((t) => matchesBase(t));

  // Real facet counts: how many tours would match if only this facet were applied
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
    <div className="min-h-screen flex flex-col bg-[#f5f1ea] text-[#333] font-sans">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-10">
        <div className="bg-[#efe7db] border-b border-[#e4dbc9] py-8">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-[#6b5130] uppercase tracking-[0.12em] font-semibold mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
              <span>You are here:</span>
              <Link href="/" className="text-[#0070c0] hover:underline normal-case">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#2d1a12] normal-case">{heroTitle}</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-[38px] md:text-[52px] leading-none text-[#1d1a18] tracking-[-0.05em]" style={{ fontFamily: 'Georgia, serif' }}>
                  {heroTitle}
                </h1>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto bg-white/80 border border-[#e0d4bb] rounded-full px-4 py-2 text-[13px] font-bold text-[#2d1a12] shadow-sm">
                <Star className="w-4 h-4 fill-[#f4b400] text-[#f4b400]" />
                4.9 / 5 — 180,175 reviews
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar */}
            <div className="lg:w-[300px] flex-shrink-0">
              <div>
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
              <div className="mb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <h2 className="text-[28px] font-bold text-[#333]" style={{ fontFamily: 'Georgia, serif' }}>
                    {heroTitle}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-[#f9f9f9] border border-[#e8e8e8] px-3 py-1 rounded text-[13px] font-bold text-[#333] self-start">
                    <Star className="w-3.5 h-3.5 fill-[#ffc107] text-[#ffc107]" />
                    <span>4.9</span>
                    <span className="text-[#8a8a8a] font-normal">- 180,175 Safari Reviews</span>
                  </div>
                </div>

                <p className="text-[13px] text-[#444] leading-relaxed mb-4">
                  Does an African safari feature on your bucket list? It should! Africa has so much to offer, from spectacular scenery, friendly people and cultural treasures to blissful beaches. But above all else, it is the wildlife and safari lifestyle that will draw you back, again and again. Once you go on your first safari, Africa gets into your blood. You develop a deep longing to return to this magical continent, and to start planning your next African safari holiday.
                </p>

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[12px] font-bold text-[#555]">Active filters:</span>
                    {activeFilters.map((f) => (
                      <Link
                        key={f.key}
                        href={removeFilterHref(f.key)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#d5d5d5] bg-white px-3 py-1 text-[12px] font-semibold text-[#333] hover:border-[#999] hover:bg-[#f7f7f7]"
                      >
                        {f.label}
                        <span aria-hidden="true" className="text-[#6b6b6b] text-[14px] leading-none">×</span>
                        <span className="sr-only">Remove filter</span>
                      </Link>
                    ))}
                    <Link href="/tours" className="text-[12px] font-bold text-[#0070c0] hover:underline">Clear all</Link>
                  </div>
                )}

                <div className="text-[13px] text-[#666]">
                  <strong className="text-[#333]">1-{orderedTours.length} of {orderedTours.length}</strong> tours match your search. Rankings are based on performance, relevance and payment. <Link href="/how-it-works" className="text-[#0070c0] hover:underline">Learn more</Link>
                </div>
              </div>

              {/* Tour grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {orderedTours.length > 0 ? orderedTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                )) : (
                  <div className="col-span-full rounded border border-dashed border-[#c9c9c9] bg-white p-8 text-center text-[#555]">
                    <p className="font-bold text-[#333] mb-1">No tours match the currently selected filters.</p>
                    <p className="text-[13px]">Try removing a filter or <Link href="/tours" className="text-[#0070c0] hover:underline">resetting the search</Link>.</p>
                  </div>
                )}
              </div>

              {/* Pagination (single page of results) */}
              <div className="flex justify-center items-center gap-2 text-[14px]" aria-hidden="true">
                <span className="px-3 py-1.5 text-[#b5b5b5]">&lt; Prev</span>
                <span className="px-3 py-1.5 font-bold text-[#333] border border-[#ccc] bg-white rounded-sm">1</span>
                <span className="px-3 py-1.5 text-[#b5b5b5]">Next &gt;</span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Related Searches Section */}
      <section className="bg-[#efefef] border-t border-[#d8d3cd] py-8 font-sans">
        <div className="max-w-[1230px] mx-auto px-4">
          <h2 className="text-[16px] font-bold text-[#333] mb-4">Related Searches</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-[13px]">
            <Link href="/tours" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Safari Tour Operators</Link>
            <Link href="/operators" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Top 10 Safari Operators</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> African Budget Safaris</Link>
            <Link href="/tours?search=gorilla" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Gorilla Trekking Tours</Link>
            <Link href="/tours?search=chimp" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Chimp Trekking Tours</Link>
            <Link href="/tours?search=overland" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> African Overland Tours</Link>
            <Link href="/tours?comfort=BUDGET" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Camping Safaris</Link>
            <Link href="/tours?comfort=LUXURY" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> African Luxury Safaris</Link>
            <Link href="/tours?search=honeymoon" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Honeymoon Safaris</Link>
            <Link href="/tours?search=photographic" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> African Photographic Safaris</Link>
            <Link href="/tours?tourType=PRIVATE" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Private Safaris</Link>
            <Link href="/tours?search=family" className="text-[#0070c0] hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3 text-[#aaa]" /> Family Safaris</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white border-t border-[#d8d3cd] py-10 font-sans">
        <div className="max-w-[960px] mx-auto px-4 flex flex-col md:flex-row gap-10">
          <div className="md:w-[250px] shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-[60px] h-[60px] rounded-sm overflow-hidden shrink-0 relative">
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80" alt="Harriet Akinyi" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-[#f0c561] text-[9px] font-bold px-1 text-[#333]">Expert</div>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#333]">Harriet Akinyi</h3>
                <p className="text-[11px] text-[#555] leading-tight mt-1">Harriet is a zoologist with more than 20 years&apos; experience working in conservation communications. She has travelled extensively throughout central, eastern and southern Africa...</p>
                <Link href="/experts/expert-2" className="text-[11px] text-[#0070c0] hover:underline mt-1 inline-block">&gt; More about Harriet</Link>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-[13px]">
              <Link href="/faq" className="block text-[#0070c0] hover:underline font-bold">1. Why should I choose an African safari tour?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">2. Which are the best African countries for going on safari?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">3. What time of year is best for going on a safari?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">4. What wildlife can I expect to see?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">5. What does a typical day look like on safari?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">6. How much will this safari cost?</Link>
              <Link href="/faq" className="block text-[#0070c0] hover:underline">7. What should I consider when choosing an African safari tour?</Link>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[26px] font-bold text-[#333] mb-2" style={{ fontFamily: 'Georgia, serif' }}>7 Questions About African Safari Tours</h2>
            <div className="flex items-center gap-2 mb-8 text-[13px] text-[#555]">
              <span>Answered by</span>
              <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=30&q=80" alt="Harriet Akinyi" className="w-5 h-5 rounded-full" />
              <strong className="text-[#333]">Harriet Akinyi</strong>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#ddd] flex items-center justify-center text-[15px] font-bold text-[#555] shrink-0">1</div>
                <div className="min-w-0">
                  <h3 className="text-[18px] font-bold text-[#333] mb-3">Why should I choose an African safari tour?</h3>
                  <div className="text-[14px] text-[#444] leading-relaxed space-y-4">
                    <p>&quot;There are so many reasons to choose an African safari. Going on safari is an unforgettable experience, offering a heady mix of adventure, thrilling wildlife sightings, cultural encounters and spectacular scenery.</p>
                    <p>It is a chance to escape the fast pace of the modern world. You&apos;ll retreat to a simpler, more peaceful way of life, reconnecting with the daily rhythms of nature...&quot;</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#ddd] flex items-center justify-center text-[15px] font-bold text-[#555] shrink-0">2</div>
                <div className="min-w-0">
                  <h3 className="text-[18px] font-bold text-[#333] mb-3">Which are the best African countries for going on safari?</h3>
                  <div className="text-[14px] text-[#444] leading-relaxed space-y-4">
                    <p>&quot;All the classic safari countries make wonderful destinations for African safari tours. These countries are Kenya, Tanzania, Zimbabwe, Botswana, Zambia and South Africa...&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safari Reviews Section */}
      <section className="bg-[#f5f1ea] border-t border-[#d8d3cd] py-10 font-sans">
        <div className="max-w-[1230px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <h2 className="text-[26px] font-bold text-[#333]" style={{ fontFamily: 'Georgia, serif' }}>Safari Reviews</h2>
            <div className="flex items-center gap-1.5 bg-white border border-[#e0d4bb] px-3 py-1 rounded text-[13px] font-bold text-[#333]">
              <Star className="w-3.5 h-3.5 fill-[#ffc107] text-[#ffc107]" />
              <span>4.9 / 5</span>
              <span className="text-[#8a8a8a] font-normal">- 180,175 Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((review) => (
              <div key={review} className="bg-white border border-[#e1e1e1] rounded-sm p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#eee] flex items-center justify-center text-[#8a8a8a] font-bold">U</div>
                    <div>
                      <div className="text-[13px] font-bold text-[#333]">Uzair <span className="font-normal text-[#555]">· United Kingdom</span></div>
                      <div className="text-[11px] text-[#8a8a8a]">Reviewed: Sep 20, 2026</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-[#333] mb-1">&quot;The African dream experience&quot;</h3>
                <div className="text-[#f0c561] text-[12px] mb-2">★★★★★ <span className="text-[#333] font-bold">5</span><span className="text-[#8a8a8a] font-normal"> / 5</span></div>
                <p className="text-[13px] text-[#4a4a4a] leading-relaxed mb-2 line-clamp-3">
                  Our experience with Samora explorers especially Iddy/Asia/Reginald has been excellent and would recommend to others. Firstly, our booking had to be postponed...
                </p>
                <Link href="/reviews" className="text-[13px] text-[#0070c0] hover:underline font-bold">Full Review</Link>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/reviews" className="inline-flex items-center gap-1 bg-white border border-[#0070c0] text-[#0070c0] font-bold text-[14px] px-6 py-2 rounded hover:bg-[#f0f8ff] transition-colors">
              All 180,175 Safari Reviews <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
