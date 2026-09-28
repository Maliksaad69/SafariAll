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

  const heroImg = getTourImage(tour.primaryCountry, tour.slug);
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
    <div className="min-h-screen flex flex-col bg-[#e9e9e9] text-[#333] font-sans">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="bg-[#f4f4f4] border-b border-[#d5d5d5] py-2 text-[11px] text-[#666]">
        <div className="max-w-[1230px] mx-auto px-4 flex items-center gap-1">
          You are here: <Link href="/" className="text-[#0070c0] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tours" className="text-[#0070c0] hover:underline">All Tours</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/tours?country=${tour.primaryCountry}`} className="text-[#0070c0] hover:underline">{tour.primaryCountry} Tours</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#333]">{tour.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-black relative h-[250px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('${heroImg}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <FavoriteHeartButton tourId={tour.id} />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-[1230px] mx-auto w-full">
          <h1 className="text-white text-[32px] md:text-[42px] font-bold leading-tight mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {tour.title}
          </h1>
          <div className="flex items-center gap-2 text-white text-[13px]">
            <span>Offered By: <Link href={`/operators/${tour.operator.slug}`} className="font-bold hover:underline">{tour.operator.companyName}</Link></span>
            <div className="flex text-[#ffc107] text-[12px]">★★★★★</div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Nav */}
      <div className="bg-white border-b border-[#d5d5d5] overflow-x-auto">
        <div className="max-w-[1230px] mx-auto px-4 flex">
          {[
            { label: 'Overview', target: 'tour-overview' },
            { label: 'Day by Day', target: 'tour-itinerary' },
            { label: 'Getting There', target: 'tour-getting-there' },
            { label: 'Offered By', target: 'tour-offered-by' },
          ].map((tab) => (
            <a
              key={tab.label}
              href={`#${tab.target}`}
              className="px-4 py-3 text-[14px] font-bold text-[#0070c0] hover:bg-[#f4f9fd] hover:text-[#005a94] whitespace-nowrap border-b-2 border-transparent transition-colors"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1230px] w-full mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Column (Content) */}
          <div className="flex-1 lg:w-2/3 space-y-6">
            
            {/* Overview Section */}
            <section id="tour-overview" className="bg-white border border-[#d5d5d5] rounded-sm p-6 shadow-sm scroll-mt-16">
              <p className="text-[13px] text-[#444] leading-relaxed mb-6">
                Experience thrilling game drives in Tanzania&apos;s world-renowned parks! Witness elephants, lions, giraffes, and more in their natural habitats. After your safari adventure, unwind on Zanzibar&apos;s white-sand beaches, soaking in the turquoise waters of the Indian Ocean or exploring historic Stone Town. This incredible journey offers the perfect balance of the wild adventure of wildlife viewing and tropical island relaxation!
              </p>

              {/* Map Placeholder */}
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#333] mb-3" style={{ fontFamily: 'Georgia, serif' }}>Route</h3>
                <div className="border border-[#e1e1e1] bg-[#f9f9f9] h-[250px] rounded-sm flex items-center justify-center text-[#999] relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map Route" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-white/50" />
                  <div className="absolute top-4 left-4 bg-white/90 p-3 text-[11px] border border-[#ccc] rounded-sm shadow-sm">
                    <strong className="text-[13px] text-[#333] mb-1 block">{tour.primaryCountry}</strong>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Start: {tour.destinations[0]?.destination.name || 'Arusha'}</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> End: {tour.destinations[tour.destinations.length - 1]?.destination.name || 'Zanzibar'}</div>
                  </div>
                </div>
              </div>

              {/* Tour Features */}
              <div className="mb-8 border-t border-[#eee] pt-6">
                <h3 className="text-[18px] font-bold text-[#333] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Tour Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#0070c0] flex items-center justify-center text-[#0070c0] shrink-0">B</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">{comfortLabel[tour.comfortLevel]} tour</h4>
                      <p className="text-[12px] text-[#666]">This {comfortLabel[tour.comfortLevel].toLowerCase()} tour includes camping and hotels.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#c0392b] flex items-center justify-center text-[#c0392b] shrink-0"><XCircle className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">Cannot be customized</h4>
                      <p className="text-[12px] text-[#666]">The accommodations and destinations of this tour cannot be changed.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#0070c0] flex items-center justify-center text-[#0070c0] shrink-0">S</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">Shared tour</h4>
                      <p className="text-[12px] text-[#666]">On this shared tour, you will join a group of other travelers. Max 7 people per vehicle.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#c0392b] flex items-center justify-center text-[#c0392b] shrink-0">1</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">Not for single travelers</h4>
                      <p className="text-[12px] text-[#666]">Single travelers cannot join this group tour and it requires a minimum of 6 people to run.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#0070c0] flex items-center justify-center text-[#0070c0] shrink-0">C</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">Can start any day</h4>
                      <p className="text-[12px] text-[#666]">If availability permits, this tour can start on any day.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#0070c0] flex items-center justify-center text-[#0070c0] shrink-0">18</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#333]">Minimum age of 18 years</h4>
                      <p className="text-[12px] text-[#666]">The minimum age for this tour is 18 years.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day by Day — itinerary with accommodation, meals & inclusions */}
              <div id="tour-itinerary" className="mb-2 border-t border-[#eee] pt-6 scroll-mt-16">
                <h3 className="text-[18px] font-bold text-[#333] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Day by Day</h3>
                <p className="text-[12px] text-[#666] mb-4">The full route, accommodation, meals and what is included on every day of this tour.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[680px]">
                    <thead>
                      <tr className="border-b border-[#ccc] bg-[#f9f9f9]">
                        <th className="py-2 text-[12px] font-bold text-[#333] w-12 pl-2">Day</th>
                        <th className="py-2 text-[12px] font-bold text-[#333]">Details</th>
                        <th className="py-2 text-[12px] font-bold text-[#333] w-[20%]">Accommodation</th>
                        <th className="py-2 text-[12px] font-bold text-[#333] w-[14%]">Meals</th>
                        <th className="py-2 text-[12px] font-bold text-[#333] w-[20%]">Included</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itineraryItems.map((day: any, idx: number) => {
                        const isFirst = idx === 0;
                        const isLast = idx === itineraryItems.length - 1;
                        const dailyIncluded: string[] = [];
                        if (isFirst && tour.startLocation) dailyIncluded.push(`Pickup at ${tour.startLocation}`);
                        if (day.included?.length) dailyIncluded.push(...day.included);
                        else dailyIncluded.push('Game drives & all park entry fees');
                        if (isLast && tour.endLocation) dailyIncluded.push(`Drop-off at ${tour.endLocation}`);
                        return (
                          <tr key={day.id} className="border-b border-[#eee] align-top">
                            <td className="py-3 text-[13px] font-bold text-[#333] pl-2">{day.dayNumber}</td>
                            <td className="py-3 text-[13px] pr-4">
                              <strong className="text-[#333] block">{day.title}</strong>
                              <span className="text-[12px] text-[#666]">{day.description}</span>
                            </td>
                            <td className="py-3 text-[13px] pr-4">
                              <strong className="text-[#0070c0] block">{day.accommodationName || 'No accommodation (day trip)'}</strong>
                            </td>
                            <td className="py-3 text-[13px] text-[#555] pr-4">{day.mealsIncluded || 'All meals included'}</td>
                            <td className="py-3 text-[13px] text-[#555] pr-2">
                              <ul className="space-y-1">
                                {dailyIncluded.map((item: string, i: number) => (
                                  <li key={i} className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[#0070c0] shrink-0 mt-1" /> {item}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#c0392b] mt-3">
                  <Info className="w-3 h-3" /> Additional accommodation before and at the end of the tour can be arranged for an extra cost
                </div>

                {/* Prices (moved from the Prices tab) */}
                <div className="mt-6 border-t border-[#eee] pt-5">
                  <h4 className="text-[15px] font-bold text-[#333] mb-3" style={{ fontFamily: 'Georgia, serif' }}>Prices 2026</h4>
                  <div className="flex flex-wrap gap-3 text-[13px]">
                    <div className="border border-[#e1e1e1] bg-[#f9f9f9] rounded-sm px-4 py-2">
                      <span className="text-[#666]">From </span>
                      <strong className="text-[#333]">US ${tour.minPriceUsd.toLocaleString()}</strong>
                      <span className="text-[#666]"> per person</span>
                    </div>
                    <div className="border border-[#e1e1e1] bg-[#f9f9f9] rounded-sm px-4 py-2">
                      <span className="text-[#666]">Up to </span>
                      <strong className="text-[#333]">US ${maxPrice.toLocaleString()}</strong>
                      <span className="text-[#666]"> per person</span>
                    </div>
                    <div className="border border-[#e1e1e1] bg-[#f9f9f9] rounded-sm px-4 py-2">
                      <span className="text-[#666]">Duration: </span>
                      <strong className="text-[#333]">{tour.durationDays} days / {tour.durationNights} nights</strong>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-[12px] text-[#555]">
                    {(tour.inclusions || []).map((inc: string, i: number) => (
                      <li key={`inc-${i}`} className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#35792c] shrink-0 mt-0.5" /> {inc}</li>
                    ))}
                    {(tour.exclusions || []).map((exc: string, i: number) => (
                      <li key={`exc-${i}`} className="flex gap-1.5"><XCircle className="w-3.5 h-3.5 text-[#c0392b] shrink-0 mt-0.5" /> {exc}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-[#666] mt-2">Prices are per person sharing and depend on travel dates and group size — request a quote for an exact rate.</p>
                </div>
              </div>
            </section>

            {/* Getting There */}
            <section id="tour-getting-there" className="bg-white border border-[#d5d5d5] rounded-sm p-6 shadow-sm scroll-mt-16">
              <h2 className="text-[20px] font-bold text-[#333] mb-4 pb-2 border-b border-[#eee]" style={{ fontFamily: 'Georgia, serif' }}>Getting There</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-[13px]">
                <div className="border border-[#e1e1e1] rounded-sm p-4">
                  <div className="flex items-center gap-2 text-[#0070c0] font-bold mb-1"><MapPin className="w-4 h-4" /> Start</div>
                  <p className="text-[#444]">{tour.startLocation || `${destNames} — your guide will confirm the exact pickup point`}</p>
                </div>
                <div className="border border-[#e1e1e1] rounded-sm p-4">
                  <div className="flex items-center gap-2 text-[#0070c0] font-bold mb-1"><MapPin className="w-4 h-4" /> End</div>
                  <p className="text-[#444]">{tour.endLocation || tour.startLocation || 'Return transfer to the airport is included'}</p>
                </div>
              </div>
              <ul className="space-y-2 text-[13px] text-[#444]">
                <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-[#0070c0] shrink-0 mt-0.5" /> {tour.primaryCountry === 'Kenya' ? 'Fly into Jomo Kenyatta International Airport (NBO) or Wilson Airport (WIL) in Nairobi' : `Fly into Kilimanjaro International Airport (JRO) or Arusha Airport (ARK)`} — a transfer from and back to the airport is included in this tour.</li>
                <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-[#0070c0] shrink-0 mt-0.5" /> This {tour.durationDays}-day safari visits {destNames}.</li>
                <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-[#0070c0] shrink-0 mt-0.5" /> Getting around: pop-up roof 4x4 vehicle, with short air transfers where distances demand it.</li>
                <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-[#0070c0] shrink-0 mt-0.5" /> Most international travelers need a tourist visa for {tour.primaryCountry} — check the latest entry requirements before booking flights.</li>
              </ul>
            </section>

            {/* Offered By */}
            <section id="tour-offered-by" className="bg-white border border-[#d5d5d5] rounded-sm p-6 shadow-sm scroll-mt-16">
              <h2 className="text-[20px] font-bold text-[#333] mb-4 pb-2 border-b border-[#eee]" style={{ fontFamily: 'Georgia, serif' }}>Offered By</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-14 border border-[#eee] bg-[#f9f9f9] flex items-center justify-center font-bold text-[20px] text-[#aaa] shrink-0">
                  {tour.operator.companyName.charAt(0)}
                </div>
                <div className="flex-1">
                  <strong className="text-[16px] text-[#333] block leading-tight">{tour.operator.companyName}</strong>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#ffc107] text-[13px]">★★★★★</span>
                    <span className="font-bold text-[#333] text-[13px]">{tour.operator.averageRating} <span className="font-normal text-[#6b6b6b]">/5</span></span>
                    <span className="text-[#666] text-[12px]">· {tour.operator.totalReviews} Reviews</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[12px] text-[#666]"><ShieldCheck className="w-3.5 h-3.5 text-[#35792c]" /> {tour.operator.isVerified ? 'Verified operator' : 'Tour operator'} · Offices in {tour.primaryCountry}</div>
                </div>
              </div>
              {tour.operator.overviewText && <p className="text-[13px] text-[#444] leading-relaxed mt-4">{tour.operator.overviewText}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/operators/${tour.operator.slug}`} className="border border-[#0070c0] text-[#0070c0] font-bold px-4 py-1.5 rounded-sm hover:bg-[#f0f8ff] transition text-[13px]">More About This Operator</Link>
                <Link href={`/quote/request?tourId=${tour.id}`} className="bg-[#f4b400] hover:bg-[#e0a800] text-white font-bold px-4 py-1.5 rounded-sm text-[13px] inline-flex items-center gap-1">Request a Quote <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-transparent pb-4">
              <h4 className="text-[13px] font-bold text-[#333] mb-2">Disclaimer</h4>
              <ul className="space-y-1 text-[11px] text-[#666]">
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> This tour is offered by <Link href={`/operators/${tour.operator.slug}`} className="text-[#0070c0] hover:underline">{tour.operator.companyName}</Link>, not SafariBookings.</li>
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> This operator reserves the right to change rates advertised on SafariBookings.</li>
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> Rates include a fixed budget for flights during this tour. If flights cost more, your quote will reflect this.</li>
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> This group tour requires a minimum of 6 people to run.</li>
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> The exact order, contents and rates of this tour are subject to availability.</li>
                <li className="flex gap-1"><ChevronRight className="w-3 h-3 text-[#8a8a8a] shrink-0 mt-0.5" /> If an accommodation is fully booked, the operator will suggest a comparable alternative.</li>
              </ul>
            </section>

            {/* Related Tours */}
            <section>
              <h3 className="text-[24px] font-bold text-[#333] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Related Tours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTours.map((rt) => (
                  <TourCard key={rt.id} tour={rt as any} />
                ))}
              </div>
            </section>

            {/* Experts Section */}
            <section className="bg-[#f5f1ea] border border-[#e4dbc9] p-6 flex flex-col md:flex-row gap-6 items-start rounded-sm">
              <div className="md:w-[200px] shrink-0">
                <h3 className="text-[16px] font-bold text-[#333] mb-2">SafariBookings Experts</h3>
                <p className="text-[11px] text-[#666]">Our <strong>24 award-winning experts</strong> contribute to our detailed travel guides and have written more than 1,000 expert reviews.</p>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-sm bg-[#ddd] shrink-0 relative">
                        <div className="absolute bottom-0 right-0 bg-[#f0c561] text-[8px] font-bold px-1 rounded-sm border border-white">Expert</div>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0070c0] hover:underline cursor-pointer">Expert Name</div>
                        <div className="text-[10px] text-[#666]">50 Reviews</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#555] line-clamp-3">Expert bio goes here detailing their extensive knowledge of African safaris and wildlife.</p>
                  </div>
                ))}
              </div>
            </section>
            
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:w-[320px] flex-shrink-0 space-y-4">

            {/* Price / Quote Box — interactive */}
            <BookingBox
              tourId={tour.id}
              tourTitle={tour.title}
              minPriceUsd={tour.minPriceUsd}
              maxPrice={maxPrice}
              dbTourId={tour.id}
            />

            {/* Operator Box */}
            <div className="bg-white border border-[#e1e1e1] rounded-sm p-4 shadow-sm text-[12px]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-10 border border-[#eee] bg-[#f9f9f9] flex items-center justify-center font-bold text-[#aaa] shrink-0">
                  {tour.operator.companyName.charAt(0)}
                </div>
                <div>
                  <div className="text-[#666] mb-0.5">Offered By:</div>
                  <strong className="text-[14px] text-[#333] block leading-tight mb-1">{tour.operator.companyName}</strong>
                  <div className="flex items-center gap-1">
                    <span className="text-[#ffc107] text-[12px]">★★★★★</span>
                    <span className="font-bold text-[#333]">{tour.operator.averageRating} <span className="font-normal text-[#6b6b6b]">/5</span></span>
                  </div>
                  <div className="text-[#666] text-[11px]">{tour.operator.totalReviews} Reviews</div>
                </div>
              </div>
              <table className="w-full text-[#555] mb-3">
                <tbody>
                  <tr><td className="py-1 align-top w-20">Offices:</td><td className="py-1 font-bold text-[#333]">{tour.primaryCountry}</td></tr>
                  <tr><td className="py-1 align-top">Founded In:</td><td className="py-1 font-bold text-[#333]">2010</td></tr>
                  <tr><td className="py-1 align-top">Employees:</td><td className="py-1 font-bold text-[#333]">1-15</td></tr>
                </tbody>
              </table>
              <Link href={`/operators/${tour.operator.slug}`} className="text-[#0070c0] hover:underline font-bold flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> More About This Operator
              </Link>
            </div>

            {/* Customer Reviews — real data with working pager */}
            <TourReviewsWidget
              operatorId={tour.operator?.id}
              operatorName={tour.operator?.companyName}
              fallbackReview={{
                title: `An unforgettable safari with ${tour.operator.companyName}`,
                body: `We had an amazing experience with ${tour.operator.companyName}. Our guide was extremely knowledgeable about the animals and the landscape — every game drive felt like a private discovery tour.`,
                rating: Math.round(tour.operator?.averageRating || 5),
              }}
            />

            {/* Related Links */}
            <div className="bg-white border border-[#e1e1e1] rounded-sm p-4 shadow-sm">
              <h3 className="text-[14px] font-bold text-[#333] mb-2">Related Links</h3>
              <ul className="text-[12px] space-y-1.5">
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[#0070c0] mt-0.5 shrink-0" /> <Link href={`/tours?country=${encodeURIComponent(tour.primaryCountry)}`} className="text-[#0070c0] hover:underline">{tour.primaryCountry} Safari & Beach Packages</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[#0070c0] mt-0.5 shrink-0" /> <Link href={`/tours?country=${encodeURIComponent(tour.primaryCountry)}&comfort=BUDGET`} className="text-[#0070c0] hover:underline">{tour.primaryCountry} Budget Safaris</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[#0070c0] mt-0.5 shrink-0" /> <Link href={`/tours?duration=${tour.durationDays <= 4 ? '1-4' : tour.durationDays <= 7 ? '5-7' : tour.durationDays <= 10 ? '8-10' : tour.durationDays <= 14 ? '11-14' : '15+'}`} className="text-[#0070c0] hover:underline">{tour.durationDays}-Day {tour.primaryCountry} Safaris</Link></li>
              </ul>
            </div>

            {/* Photos & Map Widgets */}
            <div className="grid grid-cols-1 gap-4">
              <div className="relative border border-[#e1e1e1] rounded-sm overflow-hidden group cursor-pointer">
                <img src={heroImg} alt="Photos" className="w-full h-[140px] object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 bg-white py-2 text-center text-[12px] font-bold text-[#0070c0] flex items-center justify-center gap-1 border-t border-[#e1e1e1]">
                  <Camera className="w-3 h-3" /> Open Photos (11)
                </div>
              </div>
              <div className="relative border border-[#e1e1e1] rounded-sm overflow-hidden group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" alt="Map" className="w-full h-[140px] object-cover group-hover:scale-105 transition-transform opacity-80" />
                <div className="absolute inset-x-0 bottom-0 bg-white py-2 text-center text-[12px] font-bold text-[#0070c0] flex items-center justify-center gap-1 border-t border-[#e1e1e1]">
                  <MapPin className="w-3 h-3" /> {tour.primaryCountry} Map
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
