import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { buildTourSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, CheckCircle, XCircle, ShieldCheck,
  Star, ChevronRight, ChevronLeft, Info, Camera, Users
} from 'lucide-react';
import TourCard from '@/components/TourCard';
import FavoriteHeartButton from '@/components/FavoriteHeartButton';
import BookingBox from '@/components/BookingBox';
import TourReviewsWidget from '@/components/TourReviewsWidget';
import { safariTours } from '@/lib/site-data';

export const dynamic = 'force-dynamic';

interface TourDetailPageProps {
  params: Promise<{ slug: string }>;
}

const comfortLabel: Record<string, string> = {
  BUDGET: 'Budget',
  MID_RANGE: 'Mid-range',
  LUXURY: 'Luxury',
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

  let tour: any = null;

  try {
    tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        operator: true,
        itineraries: { orderBy: { dayNumber: 'asc' } },
        destinations: { include: { destination: true } },
      },
    });
  } catch {
    tour = null;
  }

  // Fallback to mock data if not in DB
  if (!tour) {
    tour = safariTours.find(t => t.slug === slug) || null;
  }

  if (!tour) notFound();

  // Agency-uploaded package photos, stored as blobs in Postgres.
  // Falls back to a stock hero image when the package has no uploads yet.
  const tourMedia = await prisma.mediaAsset.findMany({
    where: { tourId: tour.id },
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, altText: true, filename: true },
  });
  const heroImg = tourMedia.length > 0 ? `/api/media/${tourMedia[0].id}` : getTourImage(tour.primaryCountry, tour.slug);
  const destNames = tour.destinations.map((d: any) => d.destination.name).join(', ');
  
  // Create an array of mock itineraries for visual display if the tour doesn't have them
  const itineraryItems = tour.itineraries?.length > 0 ? tour.itineraries : [
    { id: 'day-1', dayNumber: 1, title: 'Arrival & Briefing', description: 'Arrive and meet your guide.', accommodationName: 'Budget camping (Just outside)', mealsIncluded: 'Lunch & dinner', included: ['Airport pickup & safari briefing'] },
    { id: 'day-2', dayNumber: 2, title: 'Game Drive', description: 'Full day game drive.', accommodationName: 'Budget camping (Inside NP)', mealsIncluded: 'All meals included', included: ['Full-day game drive with expert guide'] },
    { id: 'day-3', dayNumber: 3, title: 'Departure', description: 'Morning game drive and transfer back.', accommodationName: 'End of tour (No accommodation)', mealsIncluded: 'Breakfast & lunch', included: ['Morning game drive'] },
  ];

  const maxPrice = tour.minPriceUsd + Math.floor(tour.minPriceUsd * 0.15);

  const relatedTours = safariTours.filter(t => t.id !== tour.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--ink-body)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-3 text-xs text-[var(--ink-secondary)]">
        <div className="max-w-[1230px] mx-auto px-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="text-[var(--brand-ink)] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-[var(--ink-muted)]" />
          <Link href="/tours" className="text-[var(--brand-ink)] hover:underline">All Tours</Link>
          <ChevronRight className="w-3 h-3 text-[var(--ink-muted)]" />
          <Link href={`/tours?country=${tour.primaryCountry}`} className="text-[var(--brand-ink)] hover:underline">{tour.primaryCountry} Tours</Link>
          <ChevronRight className="w-3 h-3 text-[var(--ink-muted)]" />
          <span className="text-[var(--ink)] font-semibold truncate max-w-md">{tour.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="surface-dark relative min-h-[300px] md:min-h-[360px] overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${heroImg}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark)] via-black/40 to-transparent" />
        <FavoriteHeartButton tourId={tour.id} />
        <div className="relative p-6 md:p-10 max-w-[1230px] mx-auto w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-brand bg-white/20 text-white border-white/30 backdrop-blur-md">
              {tour.primaryCountry}
            </span>
            <span className="badge badge-neutral bg-white/20 text-white border-white/30 backdrop-blur-md">
              {tour.durationDays} Days / {tour.durationNights} Nights
            </span>
            <span className="badge badge-success bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-md">
              {comfortLabel[tour.comfortLevel] || 'Safari'}
            </span>
          </div>

          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold font-display leading-tight mb-3 drop-shadow-md">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-white/90 text-xs sm:text-sm">
            <span>Offered By: <Link href={`/operators/${tour.operator.slug}`} className="font-bold underline hover:text-[var(--dark-gold)]">{tour.operator.companyName}</Link></span>
            <span className="text-white/40">·</span>
            <div className="flex items-center gap-1 text-[var(--dark-gold)]">
              {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              <span className="text-white font-bold ml-1">{tour.operator.averageRating}</span>
              <span className="text-white/70">({tour.operator.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Nav */}
      <div className="glass-nav sticky top-0 z-20">
        <div className="max-w-[1230px] mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { label: 'Overview', target: 'tour-overview' },
            { label: 'Day by Day', target: 'tour-itinerary' },
            { label: 'Getting There', target: 'tour-getting-there' },
            { label: 'Offered By', target: 'tour-offered-by' },
          ].map((tab) => (
            <a
              key={tab.label}
              href={`#${tab.target}`}
              className="px-5 py-3.5 text-xs sm:text-sm font-bold text-[var(--ink)] hover:text-[var(--brand-ink)] whitespace-nowrap border-b-2 border-transparent hover:border-[var(--brand)] transition-all"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1230px] w-full mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column (Content) */}
          <div className="flex-1 lg:w-2/3 space-y-8">
            
            {/* Overview Section */}
            <section id="tour-overview" className="surface-card rounded-2xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-sm scroll-mt-20">
              <h2 className="text-2xl font-bold font-display text-[var(--ink)] mb-4">Tour Overview</h2>
              <p className="text-sm text-[var(--ink-body)] leading-relaxed mb-6">
                Experience thrilling game drives in {tour.primaryCountry}&apos;s world-renowned parks! Witness elephants, lions, giraffes, and iconic wildlife in their natural habitats. Handcrafted by licensed local specialists, this itinerary balances exhilarating wildlife encounters with comfortable resting lodges and seamless ground logistics.
              </p>

              {/* Map Placeholder */}
              <div className="mb-8">
                <h3 className="text-base font-bold font-display text-[var(--ink)] mb-3">Itinerary Route</h3>
                <div className="border border-[var(--border)] rounded-2xl h-[240px] flex items-center justify-center relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map Route" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 left-4 surface-card p-3 rounded-xl text-xs border border-[var(--glass-border)] shadow-md">
                    <strong className="text-xs text-[var(--ink)] mb-1 block font-display">{tour.primaryCountry} Route</strong>
                    <div className="flex items-center gap-1.5 text-[var(--ink-body)]"><span className="w-2 h-2 rounded-full bg-[var(--brand)]"></span> Start: {tour.destinations[0]?.destination.name || 'Arusha'}</div>
                    <div className="flex items-center gap-1.5 text-[var(--ink-body)]"><span className="w-2 h-2 rounded-full bg-[var(--success)]"></span> End: {tour.destinations[tour.destinations.length - 1]?.destination.name || 'Zanzibar'}</div>
                  </div>
                </div>
              </div>

              {/* Tour Features */}
              <div className="border-t border-[var(--border-soft)] pt-6">
                <h3 className="text-base font-bold font-display text-[var(--ink)] mb-4">Tour Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0">B</div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">{comfortLabel[tour.comfortLevel]} Comfort</h4>
                      <p className="text-xs text-[var(--ink-secondary)]">Includes vetted lodges, camps, and park permits.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-sunk)] text-[var(--ink-muted)] flex items-center justify-center shrink-0"><Info className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">Tailored Options</h4>
                      <p className="text-xs text-[var(--ink-secondary)]">Accommodations can be customized upon request.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0">S</div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">{tour.tourType === 'PRIVATE' ? 'Private Safari' : 'Shared Group'}</h4>
                      <p className="text-xs text-[var(--ink-secondary)]">Guaranteed window seat in custom 4x4 safari cruiser.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0">C</div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">Flexible Departure</h4>
                      <p className="text-xs text-[var(--ink-secondary)]">Departure dates available year-round upon booking.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day by Day */}
              <div id="tour-itinerary" className="border-t border-[var(--border-soft)] pt-8 mt-8 scroll-mt-20">
                <h3 className="text-2xl font-bold font-display text-[var(--ink)] mb-2">Day by Day Itinerary</h3>
                <p className="text-xs text-[var(--ink-secondary)] mb-6">Complete route, daily game drives, accommodations, and included meals.</p>

                <div className="space-y-4">
                  {itineraryItems.map((day: any, idx: number) => {
                    const isFirst = idx === 0;
                    const isLast = idx === itineraryItems.length - 1;
                    const dailyIncluded: string[] = [];
                    if (isFirst && tour.startLocation) dailyIncluded.push(`Pickup at ${tour.startLocation}`);
                    if (day.included?.length) dailyIncluded.push(...day.included);
                    else dailyIncluded.push('Game drives & park entry fees');
                    if (isLast && tour.endLocation) dailyIncluded.push(`Drop-off at ${tour.endLocation}`);
                    return (
                      <div key={day.id} className="p-5 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-7 h-7 rounded-full bg-[var(--brand-deep)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {day.dayNumber}
                          </span>
                          <h4 className="text-base font-bold font-display text-[var(--ink)]">{day.title}</h4>
                        </div>
                        <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-3 pl-10">{day.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-10 text-[11px] pt-2 border-t border-[var(--border-soft)]">
                          <div>
                            <span className="text-[var(--ink-muted)] block font-medium">Accommodation:</span>
                            <span className="text-[var(--brand-ink)] font-bold">{day.accommodationName || 'Included lodge/camp'}</span>
                          </div>
                          <div>
                            <span className="text-[var(--ink-muted)] block font-medium">Meals:</span>
                            <span className="text-[var(--ink-body)] font-semibold">{day.mealsIncluded || 'All meals included'}</span>
                          </div>
                          <div>
                            <span className="text-[var(--ink-muted)] block font-medium">Daily Highlights:</span>
                            <span className="text-[var(--ink-body)]">{dailyIncluded.slice(0, 1).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="mt-8 p-6 rounded-2xl bg-[var(--surface-sunk)] border border-[var(--border)]">
                  <h4 className="text-base font-bold font-display text-[var(--ink)] mb-3">Package Rate Guide</h4>
                  <div className="flex flex-wrap gap-4 text-xs mb-4">
                    <div className="surface-card rounded-xl px-4 py-2 border border-[var(--border)]">
                      <span className="text-[var(--ink-muted)]">From: </span>
                      <strong className="text-base text-[var(--ink)] font-bold">${tour.minPriceUsd.toLocaleString()}</strong>
                      <span className="text-[var(--ink-muted)]"> pp</span>
                    </div>
                    <div className="surface-card rounded-xl px-4 py-2 border border-[var(--border)]">
                      <span className="text-[var(--ink-muted)]">High Season up to: </span>
                      <strong className="text-base text-[var(--ink)] font-bold">${maxPrice.toLocaleString()}</strong>
                      <span className="text-[var(--ink-muted)]"> pp</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[var(--ink)] block mb-2">Inclusions:</span>
                      <ul className="space-y-1 text-[var(--ink-body)]">
                        {(tour.inclusions || ['Park conservation fees', '4x4 safari vehicle', 'Professional English guide', 'All accommodations']).map((inc: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[var(--success)] shrink-0" /> {inc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--ink)] block mb-2">Exclusions:</span>
                      <ul className="space-y-1 text-[var(--ink-secondary)]">
                        {(tour.exclusions || ['International flights', 'Visa fees', 'Travel insurance', 'Personal tips & souvenirs']).map((exc: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-[var(--danger)] shrink-0" /> {exc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Getting There */}
            <section id="tour-getting-there" className="surface-card rounded-2xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-sm scroll-mt-20">
              <h2 className="text-2xl font-bold font-display text-[var(--ink)] mb-4">Arrival & Getting There</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
                <div className="p-4 rounded-xl bg-white/80 border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[var(--brand-ink)] font-bold mb-1"><MapPin className="w-4 h-4" /> Starting Location</div>
                  <p className="text-[var(--ink-body)]">{tour.startLocation || `${destNames} — airport transfer included`}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/80 border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[var(--brand-ink)] font-bold mb-1"><MapPin className="w-4 h-4" /> Ending Location</div>
                  <p className="text-[var(--ink-body)]">{tour.endLocation || tour.startLocation || 'Transfer back to airport included'}</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-[var(--ink-body)]">
                <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-[var(--brand-ink)] shrink-0 mt-0.5" /> International airport transfers are coordinated directly with your licensed local operator.</li>
                <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-[var(--brand-ink)] shrink-0 mt-0.5" /> Transportation is operated in specialized pop-up roof 4x4 safari vehicles with guaranteed window seating.</li>
              </ul>
            </section>

            {/* Offered By */}
            <section id="tour-offered-by" className="surface-card rounded-2xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-sm scroll-mt-20">
              <h2 className="text-2xl font-bold font-display text-[var(--ink)] mb-4">About the Tour Operator</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-deep)] text-white flex items-center justify-center font-bold text-xl shrink-0 font-display shadow-sm">
                  {tour.operator.companyName.charAt(0)}
                </div>
                <div className="flex-1">
                  <strong className="text-lg font-bold font-display text-[var(--ink)] block leading-tight">{tour.operator.companyName}</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[var(--gold)] text-xs">★★★★★</span>
                    <span className="font-bold text-xs text-[var(--ink)]">{tour.operator.averageRating} / 5</span>
                    <span className="text-xs text-[var(--ink-muted)]">({tour.operator.totalReviews} traveler reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-[var(--success)] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Local Operator · {tour.primaryCountry}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/operators/${tour.operator.slug}`} className="btn btn-secondary btn-sm">Operator Profile &rarr;</Link>
                <Link href={`/quote/request?tourId=${tour.id}`} className="btn btn-primary btn-sm">Request Direct Quote &rarr;</Link>
              </div>
            </section>

            {/* Related Tours */}
            <section className="pt-4">
              <h3 className="text-2xl font-bold font-display text-[var(--ink)] mb-6">Similar African Safari Tours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTours.map((rt) => (
                  <TourCard key={rt.id} tour={rt as any} />
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:w-[340px] flex-shrink-0 space-y-6">

            {/* Price / Quote Box — interactive */}
            <BookingBox
              tourId={tour.id}
              tourTitle={tour.title}
              minPriceUsd={tour.minPriceUsd}
              maxPrice={maxPrice}
              dbTourId={tour.id}
            />

            {/* Operator Box */}
            <div className="surface-card rounded-2xl p-5 border border-[var(--glass-border)] shadow-sm text-xs">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-bold text-base shrink-0 font-display">
                  {tour.operator.companyName.charAt(0)}
                </div>
                <div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Organized By:</div>
                  <strong className="text-sm font-bold text-[var(--ink)] block leading-tight">{tour.operator.companyName}</strong>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[var(--gold)] text-[11px]">★★★★★</span>
                    <span className="font-bold text-[var(--ink)] text-[11px]">{tour.operator.averageRating} / 5</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-[var(--border)] mb-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Country:</span>
                  <span className="font-bold text-[var(--ink)]">{tour.primaryCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Commission:</span>
                  <span className="font-bold text-[var(--success)]">0% (Direct quote)</span>
                </div>
              </div>
              <Link href={`/operators/${tour.operator.slug}`} className="text-xs text-[var(--brand-ink)] font-bold hover:underline inline-flex items-center gap-1">
                More About This Operator <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Customer Reviews widget */}
            <TourReviewsWidget
              operatorId={tour.operator?.id}
              operatorName={tour.operator?.companyName}
              fallbackReview={{
                title: `An unforgettable safari with ${tour.operator.companyName}`,
                body: `We had an amazing experience with ${tour.operator.companyName}. Our guide was extremely knowledgeable about the animals and the landscape — every game drive felt like a private discovery tour.`,
                rating: Math.round(tour.operator?.averageRating || 5),
              }}
            />

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
