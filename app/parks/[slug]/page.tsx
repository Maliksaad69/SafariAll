import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { safariTours } from '@/lib/site-data';
import { 
  ChevronRight, 
  MapPin, Clock, Sun, Layout, Camera, Map, TrendingUp 
} from 'lucide-react';

const countryName = (slug: string) =>
  slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-+/g, ' ');

export const dynamic = 'force-dynamic';

interface ParkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ParkDetailPage({ params }: ParkDetailPageProps) {
  const { slug } = await params;

  let park: any = null;
  let sections: any[] = [];

  try {
    park = await prisma.destination.findUnique({
      where: { slug },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        tours: {
          include: {
            tour: {
              include: {
                operator: true,
                destinations: {
                  include: { destination: true },
                },
              },
            },
          },
        },
      },
    });
  } catch {
    park = null;
  }

  // Fallback data if no DB or not found
  if (!park) {
    park = {
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
      slug,
      country: slug === 'kenya' ? 'Kenya' : 'Tanzania',
      type: 'COUNTRY',
      description: 'Tanzania, with its three safari circuits, is one of Africa’s top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the \'Spice Island\' of Zanzibar is only a short flight away.',
      wildlifePresent: ['Lion', 'Elephant', 'Cheetah', 'Giraffe', 'Leopard'],
      tours: safariTours.slice(0, 3).map(t => ({ tour: t })),
      sections: [],
    };
  }

  // DB sections; fall back to a single Overview built from the description
  sections = park.sections?.length
    ? park.sections
    : [{ key: 'overview', title: 'Overview', body: park.description || '', bulletItems: [] }];

  const relatedTours = park.tours.map((t: any) => t.tour).slice(0, 3);
  const isCountry = park.type === 'COUNTRY' || !park.type;
  
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[var(--ink-muted)] opacity-60" />
          <Link href="/parks" className="hover:text-[var(--brand)] transition-colors">Countries &amp; Parks</Link>
          <ChevronRight className="w-3 h-3 text-[var(--ink-muted)] opacity-60" />
          <span className="text-[var(--ink)] font-medium">{park.name} Travel Guide</span>
        </div>
      </div>

      <main className="flex-1 w-full mx-auto pb-16">
        
        {/* Hero Section */}
        <div className="relative bg-[var(--brand-deep)] text-white overflow-hidden border-b border-black/5">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/90 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex flex-col md:flex-row gap-8 items-start">
            {/* Left Nav Menu */}
            <div className="w-full md:w-[250px] shrink-0">
              <div className="surface-card rounded-2xl overflow-hidden border border-white/10 shadow-lg backdrop-blur-md">
                <div className="bg-[var(--brand-deep)] text-white p-3.5 font-bold flex items-center justify-between border-b border-white/10">
                  <span className="font-display tracking-tight text-sm">{park.name} Guide</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10">Index</span>
                </div>
                <ul className="text-xs divide-y divide-black/5">
                  {sections.map((s: any, i: number) => (
                    <li key={s.key}>
                      <a 
                        href={`#guide-${s.key}`} 
                        className={`block px-4 py-2.5 transition-colors flex items-center gap-2 ${
                          i === 0 
                            ? 'font-bold text-[var(--brand-deep)] bg-[var(--brand-soft)] border-l-3 border-[var(--brand)]' 
                            : 'text-[var(--ink-muted)] hover:text-[var(--brand-deep)] hover:bg-[var(--sand)]'
                        }`}
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 text-[var(--brand)]" />
                        <span className="truncate">{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="p-3 bg-[var(--sand)] border-t border-black/5">
                  <Link 
                    href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} 
                    className="btn btn-primary w-full text-center py-2.5 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Safari Tours to {park.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Hero Content */}
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md mb-4 text-[var(--brand-light)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-light)]" />
                <span>Destination Guide</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-4">
                {park.name} <span className="font-normal text-white/70 text-2xl sm:text-3xl block sm:inline">— Overview</span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-white/85 max-w-3xl font-light">
                {park.description}
              </p>
              
              {/* Media Thumbnails */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                <div className="w-28 h-16 relative rounded-xl overflow-hidden border border-white/20 shadow-sm shrink-0">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" alt={park.name} className="w-full h-full object-cover" />
                </div>
                <Link href="/contact-us" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition-all shadow-sm">
                  <Layout className="w-4 h-4 text-[var(--brand-light)]" /> Watch Video
                </Link>
                <Link href="/contact-us" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition-all shadow-sm">
                  <Camera className="w-4 h-4 text-[var(--brand-light)]" /> Photos (50+)
                </Link>
                <Link href="/contact-us" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition-all shadow-sm">
                  <Map className="w-4 h-4 text-[var(--brand-light)]" /> Interactive Map
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="surface-card border-y border-black/5 py-4 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap lg:pl-[280px] gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold text-xs shrink-0">$$</div>
              <div>
                <strong className="text-[var(--ink)] block font-semibold">Rates <span className="font-normal text-[var(--ink-muted)]">(USD)</span></strong>
                <span className="text-[var(--ink-muted)]">$229 to $659 pp/day</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold shrink-0"><Sun className="w-4 h-4"/></div>
              <div>
                <strong className="text-[var(--ink)] block font-semibold">Best Time To Go</strong>
                <span className="text-[var(--ink-muted)]">June to October; Jan to Feb</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold shrink-0"><TrendingUp className="h-4 w-4" /></div>
              <div>
                <strong className="text-[var(--ink)] block font-semibold">High Season</strong>
                <span className="text-[var(--ink-muted)]">July to March (North)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold shrink-0"><MapPin className="w-4 h-4"/></div>
              <div>
                <strong className="text-[var(--ink)] block font-semibold">Size</strong>
                <span className="text-[var(--ink-muted)]">947,303 km²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column (Main) */}
          <div className="flex-1 w-full lg:pl-[250px]">
            <section className="surface-card rounded-3xl p-6 sm:p-10 border border-black/5 shadow-sm space-y-10">
              {sections.map((s: any, idx: number) => (
                <div key={s.key} id={`guide-${s.key}`} className={`${idx > 0 ? 'pt-6 border-t border-black/5' : ''} scroll-mt-24`}>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--brand-deep)] mb-3 pb-2 border-b border-black/5">
                    {s.title}
                  </h2>
                  {s.body && <p className="text-sm text-[var(--ink)]/80 leading-relaxed mb-4 whitespace-pre-line">{s.body}</p>}
                  {s.bulletItems?.length > 0 && (
                    <ul className="space-y-2 mb-4 text-sm text-[var(--ink)]/80">
                      {s.bulletItems.map((b: string, bi: number) => (
                        <li key={bi} className="flex gap-2.5 items-start">
                          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-[var(--brand)]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {idx < sections.length - 1 && (
                    <Link 
                      href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&search=${encodeURIComponent(s.title)}`} 
                      className="text-xs text-[var(--brand)] hover:text-[var(--brand-deep)] font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> Find tours related to {s.title.toLowerCase()}
                    </Link>
                  )}
                </div>
              ))}

              {/* Want To Visit? */}
              <div className="pt-8 border-t border-black/5">
                <div className="bg-[var(--brand-soft)]/50 border border-[var(--brand-pale)] rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--brand-deep)] mb-2">
                    Want To Visit {park.name}?
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--ink-muted)] mb-5">
                    Explore tailor-made itineraries, group departures, and top operators servicing {park.name}.
                  </p>
                  
                  <Link 
                    href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} 
                    className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-sm mb-6"
                  >
                    <span>Browse All {park.name} Safaris</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--brand)] font-medium p-1 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span>{park.name} Safaris &amp; Tours</span>
                    </Link>
                    <Link href={`/tours?search=${encodeURIComponent(park.name + ' chimp trekking')}`} className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--brand)] font-medium p-1 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span>{park.name} Chimp Trekking Tours</span>
                    </Link>
                    <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&comfort=BUDGET`} className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--brand)] font-medium p-1 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span>{park.name} Budget Safaris</span>
                    </Link>
                    <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&comfort=LUXURY`} className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--brand)] font-medium p-1 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span>{park.name} Luxury Glamping</span>
                    </Link>
                    <Link href={`/operators?country=${encodeURIComponent(countryName(park.slug))}`} className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--brand)] font-medium p-1 transition-colors sm:col-span-2">
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span>Tour Operators for {park.name}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            
            {/* Reviews Summary */}
            <div className="surface-card rounded-2xl p-6 border border-black/5 shadow-sm text-xs">
              <h3 className="text-base font-bold font-display text-[var(--brand-deep)] mb-4">{park.name} Safari Reviews</h3>
              
              <div className="mb-5 pb-4 border-b border-black/5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-semibold text-[var(--ink)]">Expert Rating</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-amber-500 font-bold">★★★★★</span>
                    <strong className="text-sm font-bold text-[var(--ink)]">4.8</strong>
                    <span className="text-[var(--ink-muted)]">/ 5</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[var(--ink-muted)]">
                  <div className="flex justify-between"><span>Wildlife</span><span className="text-amber-500">★★★★★</span></div>
                  <div className="flex justify-between"><span>Scenery</span><span className="text-amber-500">★★★★★</span></div>
                  <div className="flex justify-between"><span>Bush Vibe</span><span className="text-amber-500">★★★★<span className="opacity-30">★</span></span></div>
                  <div className="flex justify-between"><span>Birding</span><span className="text-amber-500">★★★★<span className="opacity-30">★</span></span></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-semibold text-[var(--ink)]">User Rating</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-amber-500 font-bold">★★★★★</span>
                    <strong className="text-sm font-bold text-[var(--ink)]">4.8</strong>
                    <span className="text-[var(--ink-muted)]">/ 5</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[var(--ink-muted)]">
                  <div className="flex justify-between"><span>Wildlife</span><span className="text-amber-500">★★★★★</span></div>
                  <div className="flex justify-between"><span>Scenery</span><span className="text-amber-500">★★★★★</span></div>
                  <div className="flex justify-between"><span>Bush Vibe</span><span className="text-amber-500">★★★★★</span></div>
                  <div className="flex justify-between"><span>Birding</span><span className="text-amber-500">★★★★<span className="opacity-30">★</span></span></div>
                </div>
              </div>
            </div>

            {/* Most Helpful Expert Review */}
            <div className="surface-card rounded-2xl p-5 border border-black/5 shadow-sm text-xs">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--ink-muted)] mb-3">Most Helpful Expert Review</h4>
              <div className="flex gap-3 items-center mb-3">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="Tim Bewer" className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0" />
                <div>
                  <div className="font-bold text-[var(--ink)]">Tim Bewer <span className="font-normal text-[var(--ink-muted)]">· 🇺🇸 US</span></div>
                  <p className="text-[11px] text-[var(--ink-muted)] leading-tight mt-0.5">Author for Lonely Planet East Africa</p>
                </div>
              </div>
              <div className="bg-[var(--brand-soft)]/60 border border-[var(--brand-pale)] p-3.5 rounded-xl text-xs relative">
                <h5 className="font-bold text-[var(--brand-deep)] text-xs mb-1">"Crowded Favorites and Well-Kept Secrets"</h5>
                <div className="text-amber-500 text-[11px] mb-2">★★★★★ <span className="text-[var(--ink)] font-bold">5.0</span></div>
                <p className="text-[var(--ink)]/80 line-clamp-3 leading-relaxed mb-2 text-[11px]">
                  {park.name} is home to extraordinary wildlife circuits; this fact alone makes a solid case for declaring it Africa&apos;s premier safari destination...
                </p>
                <Link href="/reviews" className="text-[var(--brand)] hover:text-[var(--brand-deep)] font-semibold inline-flex items-center gap-1">
                  Read full review <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Latest User Review */}
            <div className="surface-card rounded-2xl p-5 border border-black/5 shadow-sm text-xs">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--ink-muted)] mb-3">Latest Traveler Review</h4>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sand)] border border-black/10 flex items-center justify-center shrink-0 font-bold text-xs text-[var(--brand-deep)]">MS</div>
                <div>
                  <div className="font-bold text-[var(--ink)]">Martin Sasse <span className="font-normal text-[var(--ink-muted)]">· 🇩🇪 DE</span></div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Reviewed: Sep 2026</div>
                </div>
              </div>
              <div className="bg-[var(--sand)] border border-black/5 p-3.5 rounded-xl text-xs relative mb-3">
                <h5 className="font-bold text-[var(--ink)] text-xs mb-1">"A good mixture between modern and tradition"</h5>
                <div className="text-amber-500 text-[11px] mb-2">★★★★<span className="opacity-30">★</span> <span className="text-[var(--ink)] font-bold">4.0</span></div>
                <p className="text-[var(--ink)]/80 line-clamp-3 leading-relaxed mb-2 text-[11px]">
                  We travelled as a couple and made a mixture between tour operators and self-guided segments. The wildlife sightings exceeded our expectations...
                </p>
                <Link href="/reviews" className="text-[var(--brand)] hover:text-[var(--brand-deep)] font-semibold inline-flex items-center gap-1">
                  Read full review <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Link href="/reviews" className="text-xs text-[var(--brand)] hover:text-[var(--brand-deep)] font-semibold inline-flex items-center gap-1">
                  All Reviews <ChevronRight className="w-3 h-3" />
                </Link>
                <Link href="/login" className="btn btn-secondary text-xs px-3 py-1.5 rounded-lg">
                  Write Review
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Safari Tours Grid (Bottom) */}
        <div className="border-t border-black/5 py-16 bg-black/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--brand)] block mb-1">Available Departures</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">Safari Tours to {park.name}</h2>
              </div>
              <Link 
                href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} 
                className="btn btn-secondary text-xs px-4 py-2 rounded-xl shrink-0"
              >
                View all tours
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {relatedTours.map((t: any) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>

            <div className="text-center">
              <Link 
                href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} 
                className="btn btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm shadow-md"
              >
                <span>Browse All {park.name} Safaris</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
