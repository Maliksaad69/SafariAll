import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import HeroBackgroundSlider, { HeroSlide } from '@/components/HeroBackgroundSlider';
import Link from 'next/link';
import {
  ChevronRight,
  MapPin,
  Clock,
  Sun,
  Layout,
  Camera,
  Map,
  TrendingUp,
  Compass,
  CheckCircle2,
  Calendar,
  DollarSign,
  Star,
} from 'lucide-react';
import { getCountrySeoUrl } from '@/lib/countries';

export interface ParkDetailViewProps {
  park: any;
  childParks?: any[];
  relatedTours?: any[];
  seoTitle?: string;
}

export default function ParkDetailView({
  park,
  childParks = [],
  relatedTours = [],
  seoTitle,
}: ParkDetailViewProps) {
  const isCountry = park.type === 'COUNTRY';
  const countryName = (park.country || park.name) as string;

  let sections: any[];
  sections = park.sections?.length
    ? park.sections
    : [{ key: 'overview', title: 'Overview', body: park.description || '', bulletItems: [] }];

  if (isCountry && childParks.length && !sections.some((s: any) => s.key === 'parks-reserves')) {
    sections = [
      ...sections,
      {
        key: 'parks-reserves',
        title: `${park.name} Parks & Reserves`,
        body: `Premier national parks and game reserves across ${park.name}.`,
        bulletItems: childParks.map((p) => p.name),
      },
    ];
  }

  const ratesDisplay = park.dailyRates || '$240 to $680 pp/day';
  const bestTimeDisplay = park.bestTimeSummary ? park.bestTimeSummary.split('(')[0].trim() : 'June to October; Jan to Feb';
  const highSeasonDisplay = park.highSeason ? park.highSeason.split('(')[0].trim() : 'July to October & December';
  const ratingValue = park.rating ? Number(park.rating).toFixed(1) : '4.9';

  const parkHeroSlides: HeroSlide[] = [
    {
      url: park.featuredImageUrl || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2560&q=85',
      location: `${park.name} · ${park.country || 'Africa'}`,
      badge: isCountry ? 'Top Safari Destination' : 'Premier National Park',
      title: isCountry ? `Explore Untamed ${park.name}` : `Discover ${park.name}`,
      titleHighlight: isCountry ? 'Safari Highlights' : 'Wildlife & Nature',
      subtitle: park.description ? park.description.slice(0, 140) + '...' : 'Plan your next unforgettable African safari adventure.',
    },
    {
      url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2560&q=85',
      location: `${park.name} · Big Game Plains`,
      badge: 'Unrivaled Wildlife Encounters',
      title: 'Walk Alongside Giant',
      titleHighlight: 'Wildlife Herds',
      subtitle: 'Experience untamed African biodiversity and majestic panoramas.',
    },
    {
      url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=2560&q=85',
      location: `${park.name} · Golden Hour`,
      badge: 'Golden Savanna Sunsets',
      title: 'Silhouetted Acacias On',
      titleHighlight: 'The African Horizon',
      subtitle: 'Experience golden light across expansive plains and game trails.',
    },
    {
      url: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=2560&q=85',
      location: `${park.country || park.name} · Safari Circuit`,
      badge: 'Expert Local Guidance',
      title: 'Track Big Cats With',
      titleHighlight: 'Top Tier Rangers',
      subtitle: 'Spot Africa’s apex predators with licensed guides and custom 4x4 vehicles.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[var(--border-soft)] py-3 text-sm text-[var(--ink-secondary)] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="text-[var(--brand-deep)] font-bold hover:underline">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--ink-secondary)]" />
          <Link href="/top-safari-countries" className="text-[var(--brand-deep)] font-bold hover:underline">
            Countries &amp; Parks
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--ink-secondary)]" />
          <span className="text-[var(--ink)] font-extrabold truncate max-w-[260px] sm:max-w-none">
            {seoTitle || `${park.name} Travel Guide`}
          </span>
        </div>
      </div>

      <main className="flex-1 w-full mx-auto pb-16">
        {/* Hero Section with Switching Animated Backgrounds (3s autoPlay) */}
        <HeroBackgroundSlider
          slides={parkHeroSlides}
          autoPlayInterval={3000}
          minHeightClass="min-h-[520px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[600px]"
          className="border-b border-[var(--dark-border)]"
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-bold text-[#E4DBB4] backdrop-blur-md mb-4 self-start">
              <MapPin className="w-4 h-4 text-[#E4DBB4]" />
              <span>{isCountry ? 'African Safari Country' : `${park.country} · ${park.type ? park.type.replace('_', ' ') : 'National Park'}`}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-4">
              {seoTitle ? (
                seoTitle
              ) : (
                <>
                  {park.name}{' '}
                  <span className="font-normal text-white/80 text-2xl sm:text-3xl block sm:inline">
                    — Travel &amp; Wildlife Guide
                  </span>
                </>
              )}
            </h1>

            {/* Generous hero description */}
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/95 max-w-5xl font-light mb-8 drop-shadow-sm">
              {park.description}
            </p>

            {/* Quick Media & Navigation Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/african-safari-tours?country=${encodeURIComponent(countryName)}`}
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md"
              >
                <span>Browse {park.name} Safaris ({relatedTours.length})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="#guide-overview"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-sm font-bold text-white backdrop-blur-md transition-all"
              >
                <Compass className="w-4 h-4 text-[#E4DBB4]" /> Quick Overview
              </Link>
              <Link
                href="#guide-reviews"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-sm font-bold text-white backdrop-blur-md transition-all"
              >
                <Camera className="w-4 h-4 text-[#E4DBB4]" /> Reviews &amp; Ratings
              </Link>
            </div>
          </div>
        </HeroBackgroundSlider>

        {/* High-Contrast Quick Stats Strip */}
        <div className="surface-card border-b border-[var(--border-soft)] py-5 text-xs bg-white/95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-extrabold text-sm shrink-0 border border-[var(--brand)]/15">
                $$
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)] block">
                  Daily Rates
                </span>
                <span className="font-extrabold text-[var(--ink)] text-sm sm:text-[15px] truncate block">
                  {ratesDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold shrink-0 border border-[var(--brand)]/15">
                <Sun className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)] block">
                  Best Time To Go
                </span>
                <span className="font-extrabold text-[var(--ink)] text-sm sm:text-[15px] truncate block">
                  {bestTimeDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold shrink-0 border border-[var(--brand)]/15">
                <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)] block">
                  High Season
                </span>
                <span className="font-extrabold text-[var(--ink)] text-sm sm:text-[15px] truncate block">
                  {highSeasonDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold shrink-0 border border-[var(--brand)]/15">
                <MapPin className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)] block">
                  Location
                </span>
                <span className="font-extrabold text-[var(--ink)] text-sm sm:text-[15px] truncate block">
                  {park.country || park.name} ({isCountry ? 'Country' : 'National Reserve'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Container ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── 1. Full-Width Overview & Guide Card ── */}
          <article id="guide-overview" className="surface-card rounded-3xl p-6 sm:p-10 lg:p-12 border border-[var(--border)] shadow-sm space-y-10 bg-white/95 w-full">
            {sections.map((s: any, idx: number) => (
              <section
                key={s.key}
                id={`guide-${s.key}`}
                className={`${idx > 0 ? 'pt-10 border-t border-[var(--border-soft)]' : ''} scroll-mt-36`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-soft)]">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">
                    {s.title}
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)] bg-[var(--surface-raised)] px-3 py-1 rounded-full border border-[var(--border)]">
                    {park.name} Travel Guide
                  </span>
                </div>

                {s.body && (
                  <p className="text-[16px] sm:text-[17px] text-[var(--ink)] font-normal leading-[1.8] mb-6 whitespace-pre-line max-w-none">
                    {s.body}
                  </p>
                )}

                {s.bulletItems?.length > 0 && (
                  <div className="mb-6 rounded-2xl bg-[var(--surface-raised)] p-5 sm:p-7 border border-[var(--border)]">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                      <span>Key Highlights &amp; Wildlife Concentrations</span>
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-sm sm:text-base">
                      {s.bulletItems.map((b: string, bi: number) => (
                        <li key={bi} className="flex gap-2.5 items-start">
                          <ChevronRight className="w-4 h-4 shrink-0 mt-1 text-[var(--brand)]" />
                          <span className="font-semibold text-[var(--ink)]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {idx < sections.length - 1 && (
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}&search=${encodeURIComponent(s.title)}`}
                    className="text-sm text-[var(--brand-deep)] hover:underline font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--brand)]" /> Find safari packages covering {s.title.toLowerCase()} &rarr;
                  </Link>
                )}
              </section>
            ))}

            {/* If country, show national parks grid */}
            {childParks.length > 0 && (
              <div className="pt-10 border-t border-[var(--border-soft)]">
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[var(--brand-deep)] mb-4">
                  National Parks &amp; Wildlife Reserves in {park.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {childParks.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/parks/${p.slug}`}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-white hover:border-[var(--brand)] transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--brand-deep)]">
                        {p.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--brand)] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Want To Visit / Planning Block */}
            <div className="pt-10 border-t border-[var(--border-soft)]">
              <div className="bg-gradient-to-br from-[var(--brand-soft)] via-[var(--brand-soft)]/50 to-white/60 border border-[var(--brand-soft)] rounded-2xl p-6 sm:p-10">
                <div className="max-w-3xl">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)] mb-3">
                    Planning a Safari to {park.name}?
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--ink)] mb-6 leading-relaxed font-normal">
                    Connect directly with verified local tour operators, compare day-by-day itineraries, and secure guaranteed departure slots with zero middleman markups.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3.5 mb-8">
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}`}
                    className="btn btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-sm"
                  >
                    <span>Browse All {park.name} Safaris</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/safari-operators?country=${encodeURIComponent(countryName)}`}
                    className="btn btn-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base"
                  >
                    <span>Verified Operators</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}&comfort=MID_RANGE`}
                    className="flex items-center gap-2 text-[var(--ink)] hover:text-[var(--brand-deep)] font-bold p-2 rounded-xl bg-white/70 border border-[var(--border-soft)] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--brand)] shrink-0" />
                    <span>Mid-Range Lodge Safaris</span>
                  </Link>
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}&comfort=LUXURY`}
                    className="flex items-center gap-2 text-[var(--ink)] hover:text-[var(--brand-deep)] font-bold p-2 rounded-xl bg-white/70 border border-[var(--border-soft)] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--brand)] shrink-0" />
                    <span>Luxury Tented Camps</span>
                  </Link>
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}&comfort=BUDGET`}
                    className="flex items-center gap-2 text-[var(--ink)] hover:text-[var(--brand-deep)] font-bold p-2 rounded-xl bg-white/70 border border-[var(--border-soft)] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--brand)] shrink-0" />
                    <span>Budget &amp; Small Group Tours</span>
                  </Link>
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}&tourType=PRIVATE`}
                    className="flex items-center gap-2 text-[var(--ink)] hover:text-[var(--brand-deep)] font-bold p-2 rounded-xl bg-white/70 border border-[var(--border-soft)] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--brand)] shrink-0" />
                    <span>Private Tailor-Made Expeditions</span>
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* ── 2. Dedicated Reviews & Ratings Section ── */}
          <section id="guide-reviews" className="mt-14 pt-12 border-t border-[var(--border-soft)] scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--brand-deep)] block mb-1">
                  Traveler Ratings &amp; Field Reports
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-[var(--brand-deep)]">
                  {park.name} Reviews &amp; Safari Ratings
                </h2>
                <p className="text-sm sm:text-base text-[var(--ink)] font-normal mt-1">
                  Independent traveler scores, expert criteria evaluations, and verified feedback from genuine visitors.
                </p>
              </div>
              <div className="inline-flex items-center gap-2.5 surface-card px-5 py-2.5 rounded-full text-sm font-bold text-[var(--ink)] border border-[var(--glass-border)] shadow-xs shrink-0 self-start sm:self-auto">
                <span className="text-amber-500 font-bold text-base">★★★★★</span>
                <span className="text-base font-extrabold">{ratingValue} / 5</span>
                <span className="text-[var(--ink-secondary)] font-semibold">· {park.reviewCount || 47} Reviews</span>
              </div>
            </div>

            {/* 3-Column Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Ratings Breakdown */}
              <div className="surface-card rounded-2xl p-6 sm:p-7 border border-[var(--border)] shadow-sm bg-white/95 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] mb-4 pb-2 border-b border-[var(--border-soft)]">
                    Score Breakdown
                  </h3>

                  <div className="mb-5 pb-4 border-b border-[var(--border-soft)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-extrabold text-[var(--ink)] text-sm">Expert Rating</span>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-amber-500 font-bold text-sm">★★★★★</span>
                        <strong className="text-sm font-extrabold text-[var(--ink)]">{ratingValue}</strong>
                        <span className="text-[var(--ink-secondary)] font-semibold text-xs">/ 5</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-[var(--ink)] text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--ink)]">Wildlife Density</span>
                        <span className="text-amber-500 font-bold">★★★★★</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--ink)]">Scenery &amp; Bush Vibe</span>
                        <span className="text-amber-500 font-bold">★★★★★</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--ink)]">Photographic Angles</span>
                        <span className="text-amber-500 font-bold">★★★★<span className="opacity-30">★</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--ink)]">Birding Diversity</span>
                        <span className="text-amber-500 font-bold">★★★★<span className="opacity-30">★</span></span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-extrabold text-[var(--ink)] text-sm">Traveler Feedback</span>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-amber-500 font-bold text-sm">★★★★★</span>
                        <strong className="text-sm font-extrabold text-[var(--ink)]">4.8</strong>
                        <span className="text-[var(--ink-secondary)] font-semibold text-xs">/ 5</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-soft)]">
                  <div className="text-xs text-[var(--ink-secondary)] font-semibold">
                    Based on verified client safari feedback.
                  </div>
                </div>
              </div>

              {/* Card 2: Field Highlights */}
              <div className="surface-card rounded-2xl p-6 sm:p-7 border border-[var(--border)] shadow-sm bg-white/95 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] mb-4 pb-2 border-b border-[var(--border-soft)]">
                    Wildlife Highlights
                  </h3>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--ink)] block">Predator Concentrations</strong>
                        <span className="text-xs text-[var(--ink-secondary)]">Outstanding density of apex carnivores and daily tracking opportunities.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--ink)] block">Authentic African Wilderness</strong>
                        <span className="text-xs text-[var(--ink-secondary)]">Unspoiled ecosystem protected under strict conservation management.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--ink)] block">Expert Local Rangers</strong>
                        <span className="text-xs text-[var(--ink-secondary)]">Decades of indigenous tracking knowledge and ethical bush craft.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-soft)]">
                  <Link
                    href={`/african-safari-tours?country=${encodeURIComponent(countryName)}`}
                    className="text-xs font-bold text-[var(--brand-deep)] hover:underline inline-flex items-center gap-1"
                  >
                    Explore all {park.name} safari packages &rarr;
                  </Link>
                </div>
              </div>

              {/* Card 3: Recent Traveler Review Card */}
              <div className="surface-card rounded-2xl p-6 sm:p-7 border border-[var(--border)] shadow-sm bg-white/95 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-soft)]">
                    <h3 className="text-lg font-bold font-display text-[var(--brand-deep)]">
                      Verified Traveler Feedback
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-deep)] bg-[var(--brand-soft)] px-2.5 py-0.5 rounded-full">
                      September 2026
                    </span>
                  </div>

                  <div className="flex gap-3.5 items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-soft)] border-2 border-[var(--brand)]/30 flex items-center justify-center shrink-0 font-extrabold text-sm text-[var(--brand-deep)] shadow-xs">
                      SJ
                    </div>
                    <div>
                      <div className="font-extrabold text-[var(--ink)] text-base">
                        Sarah Jenkins <span className="font-medium text-[var(--ink-secondary)] text-sm">· 🇬🇧 UK</span>
                      </div>
                      <div className="text-xs text-[var(--ink-secondary)] font-semibold mt-0.5">Verified Traveler · 7-Day Circuit</div>
                    </div>
                  </div>

                  <div className="bg-[var(--surface-raised)] border border-[var(--border)] p-4 rounded-xl text-sm relative mb-4">
                    <h4 className="font-bold text-[var(--ink)] text-sm sm:text-base mb-2">
                      &ldquo;Exceeded all our wildlife expectations!&rdquo;
                    </h4>
                    <div className="text-amber-500 text-sm mb-2.5">
                      ★★★★★ <span className="text-[var(--ink)] font-bold">5.0</span>
                    </div>
                    <p className="text-[var(--ink)] font-normal leading-relaxed text-sm">
                      Our guide navigated the park with incredible precision. We observed lions on a fresh kill, vast elephant breeding herds, and enjoyed spotless luxury camps.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-soft)]">
                  <Link href="/safari-reviews" className="text-sm font-bold text-[var(--brand-deep)] hover:underline inline-flex items-center gap-1">
                    All {park.reviewCount || 47} Reviews <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link href="/custom-safari-quote" className="btn btn-secondary text-xs sm:text-sm px-4 py-2 rounded-xl font-bold">
                    Inquire Now
                  </Link>
                </div>
              </div>

            </div>
          </section>

          {/* ── 3. Safari Tours Grid (Bottom) ── */}
          <section id="guide-tours" className="mt-16 pt-12 border-t border-[var(--border-soft)] scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--brand-deep)] block mb-1">
                  Available Departures
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">
                  Safari Tours to {park.name}
                </h2>
                <p className="text-sm sm:text-base text-[var(--ink)] font-normal mt-1">
                  Handcrafted tour packages with guaranteed departure slots and direct local pricing.
                </p>
              </div>
              <Link
                href={`/african-safari-tours?country=${encodeURIComponent(countryName)}`}
                className="btn btn-secondary text-sm px-5 py-2.5 rounded-xl font-bold shrink-0 self-start sm:self-auto"
              >
                View all tours &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {relatedTours.map((t: any) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href={`/african-safari-tours?country=${encodeURIComponent(countryName)}`}
                className="btn btn-primary inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-bold text-base shadow-md"
              >
                <span>Browse All {park.name} Safaris</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
