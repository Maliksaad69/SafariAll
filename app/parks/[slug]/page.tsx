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
    <div className="min-h-screen flex flex-col bg-[#e9e9e9] text-[#333] font-sans">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="bg-[#f4f4f4] border-b border-[#d5d5d5] py-2 text-[11px] text-[#666]">
        <div className="max-w-[1230px] mx-auto px-4 flex items-center gap-1">
          You are here: <Link href="/" className="text-[var(--brand-ink)] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/parks" className="text-[var(--brand-ink)] hover:underline">Countries & Parks</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#333]">{park.name} Travel Guide</span>
        </div>
      </div>

      <main className="flex-1 w-full mx-auto pb-10">
        
        {/* Hero Section */}
        <div className="bg-[#222] relative border-b border-[#d5d5d5]">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          
          <div className="relative max-w-[1230px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            {/* Left Nav Menu */}
            <div className="w-[240px] shrink-0">
              <div className="bg-white/95 rounded-sm overflow-hidden shadow-md">
                <div className="bg-[#333] text-white p-3 font-bold flex items-center gap-2">
                  <span>{park.name}</span>
                </div>
                <ul className="text-[12px]">
                  {sections.map((s: any, i: number) => (
                    <li key={s.key} className="border-b border-[#eee] last:border-0">
                      <a href={`#guide-${s.key}`} className={`block px-4 py-2 hover:bg-[#f9f9f9] ${i === 0 ? 'font-bold text-[var(--danger)] border-l-4 border-[var(--danger)] bg-[#f9f9f9]' : 'text-[#555]'}`}>
                        <ChevronRight className="w-3 h-3 inline mr-1 text-[#8a8a8a]" /> {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="p-3 bg-[#f4f4f4] border-t border-[#eee]">
                  <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} className="block w-full bg-[#8b6914] hover:bg-[#725510] text-white text-[13px] font-bold py-2 rounded-sm shadow-sm text-center">
                    Safari Tours<br/>to {park.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Hero Content */}
            <div className="flex-1 pt-4 text-white">
              <h1 className="text-[42px] font-bold mb-4" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {park.name} <span className="text-[28px] font-normal text-white">— Overview</span>
              </h1>
              <p className="text-[14px] leading-relaxed text-white max-w-3xl" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {park.description}
              </p>
              
              {/* Media Thumbnails */}
              <div className="mt-8 flex gap-2 h-[80px]">
                <div className="w-[140px] relative rounded-sm overflow-hidden border border-white/20">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                </div>
                <Link href="/contact-us" className="w-[140px] bg-black/60 hover:bg-black/75 border border-white/25 rounded-sm flex items-center justify-center text-[12px] font-bold text-white transition">
                  <Layout className="w-4 h-4 mr-1" /> Watch Video
                </Link>
                <Link href="/contact-us" className="w-[140px] bg-black/60 hover:bg-black/75 border border-white/25 rounded-sm flex items-center justify-center text-[12px] font-bold text-white transition">
                  <Camera className="w-4 h-4 mr-1" /> View Photos (50)
                </Link>
                <Link href="/contact-us" className="w-[140px] bg-black/60 hover:bg-black/75 border border-white/25 rounded-sm flex items-center justify-center text-[12px] font-bold text-white transition">
                  <Map className="w-4 h-4 mr-1" /> Open Map
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-[#d5d5d5] py-3 text-[12px]">
          <div className="max-w-[1230px] mx-auto px-4 flex flex-wrap lg:pl-[288px] gap-6">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#f4f4f4] text-[#888] flex items-center justify-center font-bold">$$</div>
              <div><strong className="text-[#333] block">Rates <span className="font-normal text-[#6b6b6b]">(USD)</span></strong><span className="text-[#666]">$229 to $659 pp/day</span></div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#f4f4f4] text-[#888] flex items-center justify-center font-bold"><Sun className="w-4 h-4"/></div>
              <div><strong className="text-[#333] block">Best Time To Go</strong><span className="text-[#666]">June to October; Jan to Feb</span></div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#f4f4f4] text-[#6b5130] flex items-center justify-center font-bold shrink-0"><TrendingUp className="h-3.5 w-3.5" /></div>
              <div><strong className="text-[#333] block">High Season</strong><span className="text-[#666]">July to March (North)</span></div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#f4f4f4] text-[#888] flex items-center justify-center font-bold"><MapPin className="w-4 h-4"/></div>
              <div><strong className="text-[#333] block">Size <span className="text-[var(--brand-ink)] hover:underline cursor-pointer">ⓘ</span></strong><span className="text-[#666]">947,303km²</span></div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-[1230px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (Main) */}
          <div className="flex-1 lg:pl-[256px]">
            <section className="bg-white border border-[#d5d5d5] rounded-sm p-8 shadow-sm">
              {sections.map((s: any, idx: number) => (
                <div key={s.key} id={`guide-${s.key}`} className={`${idx > 0 ? 'mt-10 pt-2' : ''} scroll-mt-16`}>
                  <h2 className="text-[20px] font-bold text-[#333] mb-3 pb-2 border-b border-[#eee]" style={{ fontFamily: 'Georgia, serif' }}>{s.title}</h2>
                  {s.body && <p className="text-[13px] text-[#444] leading-relaxed mb-3 whitespace-pre-line">{s.body}</p>}
                  {s.bulletItems?.length > 0 && (
                    <ul className="space-y-2 mb-3 text-[13px] text-[#444]">
                      {s.bulletItems.map((b: string, bi: number) => (
                        <li key={bi} className="flex gap-2"><ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${s.key === 'reviews' ? 'text-[var(--brand-ink)]' : 'text-[#35792c]'}`} /> {b}</li>
                      ))}
                    </ul>
                  )}
                  {idx < sections.length - 1 && (
                    <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&search=${encodeURIComponent(s.title)}`} className="text-[12px] text-[var(--brand-ink)] hover:underline font-bold flex items-center gap-1 mb-4">
                      <ChevronRight className="w-3 h-3" /> Find tours related to {s.title.toLowerCase()}
                    </Link>
                  )}
                </div>
              ))}

              {/* Want To Visit? */}
              <h2 className="text-[20px] font-bold text-[#333] mb-4 pb-2 border-b border-[#eee]" style={{ fontFamily: 'Georgia, serif' }}>Want To Visit {park.name}?</h2>
              <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} className="bg-[#f4b400] hover:bg-[#e0a800] text-white font-bold py-2.5 px-6 rounded-sm shadow-sm flex items-center gap-2 text-[14px] mb-4">
                7,503 {park.name} Safaris <ChevronRight className="w-4 h-4" />
              </Link>
              <ul className="space-y-1 text-[13px]">
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)] mt-1" /> <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} className="text-[var(--brand-ink)] hover:underline">{park.name} Safaris & Tours</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)] mt-1" /> <Link href={`/tours?search=${encodeURIComponent(park.name + ' chimp trekking')}`} className="text-[var(--brand-ink)] hover:underline">{park.name} Chimp Trekking Tours</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)] mt-1" /> <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&comfort=BUDGET`} className="text-[var(--brand-ink)] hover:underline">{park.name} Budget Safaris</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)] mt-1" /> <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}&comfort=LUXURY`} className="text-[var(--brand-ink)] hover:underline">{park.name} Glamping Safaris</Link></li>
                <li className="flex gap-1.5"><ChevronRight className="w-3 h-3 text-[var(--brand-ink)] mt-1" /> <Link href={`/operators?country=${encodeURIComponent(countryName(park.slug))}`} className="text-[var(--brand-ink)] hover:underline">Tour Operators for {park.name}</Link></li>
              </ul>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:w-[320px] shrink-0 space-y-6">
            
            {/* Reviews Summary */}
            <div className="bg-[#fbfbfb] border border-[#e1e1e1] rounded-sm p-5 shadow-sm text-[12px]">
              <h3 className="text-[16px] font-bold text-[#333] mb-4">{park.name} Safari Reviews</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-end border-b border-[#eee] pb-2 mb-2">
                  <strong className="text-[13px]">Expert Rating</strong>
                  <div className="flex gap-1 items-center">
                    <span className="text-[#ffc107] tracking-tight">★★★★★</span>
                    <strong className="text-[14px]">4.8</strong>
                    <span className="text-[#6b6b6b]">/5 - <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline">18 Reviews</Link></span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Wildlife</span><span className="text-[#ffc107]">★★★★★</span></div>
                  <div className="flex justify-between"><span>Scenery</span><span className="text-[#ffc107]">★★★★★</span></div>
                  <div className="flex justify-between"><span>Bush Vibe</span><span className="text-[#ffc107]">★★★★<span className="text-[#b5b5b5]">★</span></span></div>
                  <div className="flex justify-between"><span>Birding</span><span className="text-[#ffc107]">★★★★<span className="text-[#b5b5b5]">★</span></span></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end border-b border-[#eee] pb-2 mb-2">
                  <strong className="text-[13px]">User Rating</strong>
                  <div className="flex gap-1 items-center">
                    <span className="text-[#ffc107] tracking-tight">★★★★★</span>
                    <strong className="text-[14px]">4.8</strong>
                    <span className="text-[#6b6b6b]">/5 - <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline">2,156 Reviews</Link></span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Wildlife</span><span className="text-[#ffc107]">★★★★★</span></div>
                  <div className="flex justify-between"><span>Scenery</span><span className="text-[#ffc107]">★★★★★</span></div>
                  <div className="flex justify-between"><span>Bush Vibe</span><span className="text-[#ffc107]">★★★★★</span></div>
                  <div className="flex justify-between"><span>Birding</span><span className="text-[#ffc107]">★★★★<span className="text-[#b5b5b5]">★</span></span></div>
                </div>
              </div>
            </div>

            {/* Most Helpful Expert Review */}
            <div>
              <h4 className="text-[14px] font-bold text-[#333] mb-3">Most Helpful Expert Review</h4>
              <div className="flex gap-2 items-center mb-3">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full border border-[#ccc]" />
                <div>
                  <div className="text-[12px] font-bold text-[#333]">Tim Bewer - <span className="font-normal">🇺🇸 US</span></div>
                  <p className="text-[10px] text-[#6b6b6b] italic leading-tight mt-0.5">Tim is a travel writer who has covered 10 African countries for Lonely Planet\'s Africa, East Africa and West Africa guidebooks.</p>
                </div>
              </div>
              <div className="relative border border-[var(--gold)] p-3 text-[12px] rounded-sm bg-[#fffdf5]">
                <div className="absolute -top-[6px] left-6 w-3 h-3 bg-[#fffdf5] border-t border-l border-[var(--gold)] transform rotate-45"></div>
                <h4 className="font-bold text-[#333] text-[14px] leading-snug mb-1">"Crowded Favorites and Well-Kept Secrets"</h4>
                <div className="text-[var(--gold)] text-[11px] mb-2">★★★★★ <span className="text-[#333] font-bold">5</span><span className="text-[#777]"> /5</span></div>
                <p className="text-[#555] line-clamp-4 leading-relaxed mb-1">
                  {park.name} is home to Serengeti National Park and Ngorongoro Crater; and this fact alone makes a solid case for declaring it Africa\'s best safari country. But, of course, there\'s much more that just these two places. Most visitors stick...
                </p>
                <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline font-bold">Full Review</Link>
              </div>
              <Link href="/reviews" className="block mt-2 text-[12px] text-[var(--brand-ink)] hover:underline font-bold flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> All 18 Expert Reviews
              </Link>
            </div>

            {/* Latest User Review */}
            <div>
              <h4 className="text-[14px] font-bold text-[#333] mb-3 border-t border-[#eee] pt-4">Latest User Review</h4>
              <div className="flex gap-2 items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[#eee] border border-[#ccc] flex items-center justify-center shrink-0 text-[#999]">MS</div>
                <div>
                  <div className="text-[12px] font-bold text-[#333]">Martin Sasse - <span className="font-normal">🇩🇪 DE</span></div>
                  <div className="text-[10px] text-[#6b6b6b]"><strong>Reviewed:</strong> Sep 8, 2026</div>
                </div>
              </div>
              <div className="relative border border-[#e1e1e1] p-3 text-[12px] rounded-sm bg-[#fcfcfc]">
                <div className="absolute -top-[6px] left-6 w-3 h-3 bg-[#fcfcfc] border-t border-l border-[#e1e1e1] transform rotate-45"></div>
                <h4 className="font-bold text-[#333] text-[14px] leading-snug mb-1">"A good mixture between modern and tradition. Depends of course where you are"</h4>
                <div className="text-[#ffc107] text-[11px] mb-2">★★★★<span className="text-[#b5b5b5]">★</span> <span className="text-[#333] font-bold">4</span><span className="text-[#777]"> /5</span></div>
                <p className="text-[#555] line-clamp-4 leading-relaxed mb-1">
                  We travelled as a couple and made a mixture between tour operator for Serengeti tour and self organized. We had a rented car for 11 days, this was perfect, sometimes challenging, but we enjoyed the freedom. Trafic was not as bad as expected...
                </p>
                <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline font-bold">Full Review</Link>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Link href="/reviews" className="text-[12px] text-[var(--brand-ink)] hover:underline font-bold flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> All 2,156 User Reviews
                </Link>
                <Link href="/login" className="border border-[var(--brand-ink)] text-[var(--brand-ink)] font-bold px-3 py-1 rounded-sm text-[12px] hover:bg-[var(--brand-soft)] flex items-center">
                  Write a Review &gt;
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Safari Tours Grid (Bottom) */}
        <div className="bg-[#f4f4f4] py-10 border-t border-[#d5d5d5]">
          <div className="max-w-[1230px] mx-auto px-4">
            <h2 className="text-[24px] font-bold text-[#333] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Safari Tours to {park.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {relatedTours.map((t: any) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>

            <div className="text-center">
              <Link href={`/tours?country=${encodeURIComponent(countryName(park.slug))}`} className="bg-[#f4b400] hover:bg-[#e0a800] text-white font-bold py-3 px-12 rounded-sm shadow-sm inline-flex items-center justify-center gap-2 text-[16px]">
                All 7,503 {park.name} Safaris <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
