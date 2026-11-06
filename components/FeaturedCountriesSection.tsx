'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Calendar,
  DollarSign,
  Compass,
  MapPin,
  Sparkles,
  ArrowUpRight,
  LayoutGrid,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export interface CountryHighlight {
  name: string;
  slug: string;
  rank: string;
  popularityRank?: number | null;
  featuredImageUrl?: string | null;
  rating?: number | null;
  reviewCount: number;
  description?: string | null;
  dailyRates?: string | null;
  bestTimeSummary?: string | null;
  highSeason?: string | null;
  toursCount?: number;
  parks?: { name: string; slug: string }[];
}

interface FeaturedCountriesSectionProps {
  countries: CountryHighlight[];
}

type CircuitFilter = 'all' | 'migration' | 'gorillas' | 'delta' | 'deserts';
type ViewMode = 'spotlight' | 'matrix';

// Curated destination metadata to give each country its evocative safari identity
const DESTINATION_META: Record<
  string,
  {
    tagline: string;
    circuits: CircuitFilter[];
    keyAnimals: string[];
    topParksFallback: { name: string; slug: string }[];
  }
> = {
  tanzania: {
    tagline: 'The Great Migration, Serengeti Plains & Ngorongoro Caldera',
    circuits: ['all', 'migration'],
    keyAnimals: ['Lion', 'Leopard', 'Wildebeest', 'Cheetah'],
    topParksFallback: [
      { name: 'Serengeti NP', slug: 'serengeti-national-park' },
      { name: 'Ngorongoro Crater', slug: 'ngorongoro-crater' },
      { name: 'Tarangire NP', slug: 'tarangire-national-park' },
      { name: 'Zanzibar Island', slug: 'zanzibar' },
    ],
  },
  botswana: {
    tagline: 'Pristine Okavango Delta Mokoro Channels & Giant Chobe Herds',
    circuits: ['all', 'delta'],
    keyAnimals: ['African Wild Dog', 'Elephant', 'Lion', 'Lechwe'],
    topParksFallback: [
      { name: 'Okavango Delta', slug: 'okavango-delta' },
      { name: 'Chobe NP', slug: 'chobe-national-park' },
      { name: 'Central Kalahari', slug: 'central-kalahari-game-reserve' },
    ],
  },
  kenya: {
    tagline: 'Iconic Masai Mara River Crossings & Amboseli Kilimanjaro Views',
    circuits: ['all', 'migration'],
    keyAnimals: ['Big Five', 'Cheetah', 'Elephant', 'Flamingo'],
    topParksFallback: [
      { name: 'Masai Mara', slug: 'masai-mara-national-reserve' },
      { name: 'Amboseli NP', slug: 'amboseli-national-park' },
      { name: 'Lake Nakuru NP', slug: 'lake-nakuru-national-park' },
    ],
  },
  'south-africa': {
    tagline: 'Legendary Kruger Big Five Concessions & Cape Coastline Luxury',
    circuits: ['all', 'migration'],
    keyAnimals: ['Big Five', 'Leopard', 'White Rhino', 'Cape Buffalo'],
    topParksFallback: [
      { name: 'Kruger National Park', slug: 'kruger-national-park' },
    ],
  },
  uganda: {
    tagline: 'Half the World’s Mountain Gorillas & Kazinga Channel Lions',
    circuits: ['all', 'gorillas'],
    keyAnimals: ['Mountain Gorilla', 'Chimpanzee', 'Tree-Climbing Lion'],
    topParksFallback: [
      { name: 'Bwindi Impenetrable', slug: 'bwindi-impenetrable-national-park' },
      { name: 'Queen Elizabeth NP', slug: 'queen-elizabeth-national-park' },
    ],
  },
  namibia: {
    tagline: 'Towering Sossusvlei Red Dunes & Etosha Salt Pan Wildlife',
    circuits: ['all', 'deserts'],
    keyAnimals: ['Desert Elephant', 'Black Rhino', 'Oryx', 'Cheetah'],
    topParksFallback: [
      { name: 'Etosha National Park', slug: 'etosha-national-park' },
    ],
  },
  zambia: {
    tagline: 'The Home of Walking Safaris & Lower Zambezi Canoe Trails',
    circuits: ['all', 'delta', 'deserts'],
    keyAnimals: ['Leopard', 'Hippo', 'Wild Dog', 'Tigerfish'],
    topParksFallback: [
      { name: 'Victoria Falls', slug: 'victoria-falls' },
    ],
  },
  zimbabwe: {
    tagline: 'Victoria Falls "Smoke That Thunders" & Untamed Hwange Plains',
    circuits: ['all', 'deserts'],
    keyAnimals: ['Elephant', 'Lion', 'Sable Antelope', 'African Wild Dog'],
    topParksFallback: [
      { name: 'Victoria Falls', slug: 'victoria-falls' },
    ],
  },
  rwanda: {
    tagline: 'Virunga Volcanic Rainforests & Intimate Gorilla Treks',
    circuits: ['all', 'gorillas'],
    keyAnimals: ['Mountain Gorilla', 'Golden Monkey', 'Colobus'],
    topParksFallback: [],
  },
};

const CIRCUIT_TABS: { id: CircuitFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All Destinations', icon: '🌍' },
  { id: 'migration', label: 'Great Migration & Big 5', icon: '🦁' },
  { id: 'gorillas', label: 'Mountain Gorilla Treks', icon: '🦍' },
  { id: 'delta', label: 'Delta & Waterways', icon: '🛶' },
  { id: 'deserts', label: 'Dunes & Victoria Falls', icon: '🏜️' },
];

export default function FeaturedCountriesSection({ countries }: FeaturedCountriesSectionProps) {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('spotlight');
  const [selectedSlug, setSelectedSlug] = useState<string>(countries[0]?.slug ?? 'tanzania');

  // Filter countries according to active circuit
  const filteredCountries = useMemo(() => {
    if (selectedCircuit === 'all') return countries;
    return countries.filter((c) => {
      const meta = DESTINATION_META[c.slug];
      return meta?.circuits.includes(selectedCircuit);
    });
  }, [countries, selectedCircuit]);

  // Keep selected country valid when filtering
  const activeCountry = useMemo(() => {
    const found = filteredCountries.find((c) => c.slug === selectedSlug);
    return found ?? filteredCountries[0] ?? countries[0];
  }, [filteredCountries, selectedSlug, countries]);

  const currentIndex = filteredCountries.findIndex((c) => c.slug === activeCountry?.slug);

  const nextDestination = useCallback(() => {
    if (filteredCountries.length <= 1) return;
    setSelectedSlug((prev) => {
      const idx = filteredCountries.findIndex((c) => c.slug === prev);
      const nextIdx = (idx + 1) % filteredCountries.length;
      return filteredCountries[nextIdx].slug;
    });
  }, [filteredCountries]);

  const prevDestination = useCallback(() => {
    if (filteredCountries.length <= 1) return;
    setSelectedSlug((prev) => {
      const idx = filteredCountries.findIndex((c) => c.slug === prev);
      const prevIdx = (idx - 1 + filteredCountries.length) % filteredCountries.length;
      return filteredCountries[prevIdx].slug;
    });
  }, [filteredCountries]);

  if (!countries || countries.length === 0) return null;

  const currentMeta = DESTINATION_META[activeCountry?.slug] ?? {
    tagline: activeCountry?.description ?? '',
    circuits: ['all'],
    keyAnimals: [],
    topParksFallback: [],
  };

  const topParks =
    activeCountry?.parks && activeCountry.parks.length > 0
      ? activeCountry.parks.slice(0, 4)
      : currentMeta.topParksFallback;

  return (
    <div className="space-y-6">
      {/* ── Section Title & Creative Control Bar ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-soft)] border border-[#8C9F91]/30 text-xs font-bold text-[var(--brand-ink)] mb-2">
            <Compass className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span>Curated Safari Circuits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-[var(--ink)] tracking-tight">
            Top-rated Safari Countries
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)] max-w-2xl">
            Explore Africa&apos;s leading safari destinations, seasonal migrations, travel rates, and verified tour packages.
          </p>
        </div>

        {/* View Mode Switcher + All Countries Link */}
        <div className="flex items-center gap-2.5 self-start md:self-end">
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[var(--border)] shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('spotlight')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'spotlight'
                  ? 'bg-[var(--brand-deep)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
              title="Interactive Spotlight View"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span className="hidden sm:inline">Spotlight</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-[var(--brand-deep)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
              title="Compare All Destinations Matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span className="hidden sm:inline">Compare All</span>
            </button>
          </div>

          <Link
            href="/top-safari-countries"
            className="btn btn-ghost btn-sm text-xs font-bold gap-1 min-h-[38px] border border-[var(--border-soft)] bg-white/70 hover:bg-white text-[var(--ink)]"
          >
            <span>Destination Guide</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand-ink)]" />
          </Link>
        </div>
      </div>

      {/* ── Experience Circuit Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
        {CIRCUIT_TABS.map((tab) => {
          const isActive = selectedCircuit === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCircuit(tab.id)}
              className={`flex shrink-0 snap-start items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[var(--brand-deep)] text-white shadow-sm ring-2 ring-[var(--brand)]'
                  : 'bg-white/80 hover:bg-white text-[var(--ink-secondary)] hover:text-[var(--ink)] border border-[var(--border-soft)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 1: INTERACTIVE SPOTLIGHT SHOWCASE
          ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'spotlight' && (
        <div className="space-y-4">
          {/* Main Stage: Cinematic Country Hero Canvas */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[var(--border)] bg-[#193A38] text-white">
            {/* Background Panorama with Atmospheric Gradients */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform scale-100"
              style={{
                backgroundImage: `url('${activeCountry.featuredImageUrl || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80'}')`,
              }}
            />
            {/* Rich multi-stage overlay for contrast: Forest Shadow deep tint into natural warmth */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#193A38]/95 via-[#193A38]/85 md:via-[#193A38]/70 to-black/35" />

            {/* Stage Content */}
            <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 min-h-[460px] sm:min-h-[490px] flex flex-col justify-between">
              {/* Top Meta Badges & Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand)] text-white text-xs font-extrabold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>{activeCountry.rank} Safari Destination</span>
                  </span>

                  {activeCountry.toursCount !== undefined && activeCountry.toursCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
                      <span>{activeCountry.toursCount} Verified Tour Packages</span>
                    </span>
                  )}
                </div>

                {/* Prev/Next Buttons & Count */}
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
                  <button
                    type="button"
                    onClick={prevDestination}
                    aria-label="Previous destination"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-bold text-white/90 px-1.5 min-w-[36px] text-center font-mono">
                    {currentIndex + 1} / {filteredCountries.length}
                  </span>

                  <button
                    type="button"
                    onClick={nextDestination}
                    aria-label="Next destination"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle: Country Headline, Ratings & Vibe */}
              <div className="my-6 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight drop-shadow-md">
                    {activeCountry.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DBB4] border border-[#DEDCCF] text-xs shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#193A38] text-[#193A38]" />
                    <span className="font-extrabold text-[#193A38]">
                      {(activeCountry.rating ?? 4.9).toFixed(1)}
                    </span>
                    <span className="text-[#344C49] font-bold">
                      ({activeCountry.reviewCount?.toLocaleString() ?? '1.2k'} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-bold text-white mb-3 flex items-center gap-2 drop-shadow">
                  <span>✦</span>
                  <span>{currentMeta.tagline}</span>
                </p>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none font-light">
                  {activeCountry.description}
                </p>

                {/* 3 Snapshot Fact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  {/* Daily Budget */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-white font-extrabold text-sm">
                      $
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-white/80 font-bold">Daily Rates</div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {activeCountry.dailyRates?.replace('per day', 'pp/day') || 'Varies by comfort'}
                      </div>
                    </div>
                  </div>

                  {/* Best Travel Window */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-white">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-white/80 font-bold">Best Season</div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {activeCountry.bestTimeSummary?.split('(')[0].trim() || 'June – October'}
                      </div>
                    </div>
                  </div>

                  {/* Child National Parks */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-white">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Featured Parks</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {topParks.length > 0 ? (
                          topParks.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/parks/${p.slug}`}
                              className="text-[10px] font-bold bg-white/20 hover:bg-[var(--brand)] px-2 py-0.5 rounded-md text-white transition-colors"
                            >
                              {p.name.replace('National Park', 'NP').replace('Game Reserve', 'GR')}
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-white/80 font-medium">Multiple reserves</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-white/15">
                <Link
                  href={`/tours?country=${encodeURIComponent(activeCountry.name)}`}
                  className="btn btn-primary min-h-[46px] text-sm font-bold shadow-md hover:shadow-lg justify-center gap-2 group"
                >
                  <span>Explore {activeCountry.name} Safaris</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href={`/parks/${activeCountry.slug}`}
                  className="btn min-h-[46px] text-sm font-bold justify-center bg-white/20 hover:bg-white text-white hover:text-[var(--brand-deep)] border border-white/30 backdrop-blur-md transition-all gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>{activeCountry.name} Parks &amp; Travel Guide</span>
                </Link>

                <Link
                  href={`/operators?country=${encodeURIComponent(activeCountry.name)}`}
                  className="btn btn-ghost-dark min-h-[46px] text-xs font-bold justify-center text-white/90 hover:text-white"
                >
                  <span>Verified Operators in {activeCountry.name}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Country Selector Reel */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--ink-secondary)]">
                Select Destination to Inspect ({filteredCountries.length})
              </span>
              <span className="text-xs font-medium text-[var(--ink-muted)] hidden sm:inline">
                Click any destination card below or use the arrows to inspect
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 sm:gap-2.5">
              {filteredCountries.map((country) => {
                const isSelected = country.slug === activeCountry.slug;
                return (
                  <button
                    key={country.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(country.slug);
                    }}
                    className={`group relative overflow-hidden rounded-xl p-2 text-left transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[var(--brand-deep)] text-white shadow-md ring-2 ring-[var(--brand)] -translate-y-0.5'
                        : 'bg-[var(--canvas-base)] hover:bg-white border border-[var(--border-soft)] text-[var(--ink)] hover:shadow-xs'
                    }`}
                  >
                    <div className="relative h-14 sm:h-16 w-full rounded-lg overflow-hidden mb-2">
                      <img
                        src={country.featuredImageUrl || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80'}
                        alt={country.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/60 text-white backdrop-blur-xs">
                        {country.rank}
                      </span>
                    </div>

                    <div className="min-w-0 w-full">
                      <div className="text-xs font-extrabold truncate">{country.name}</div>
                      <div
                        className={`text-[10px] font-medium truncate ${
                          isSelected ? 'text-white/90' : 'text-[var(--ink-secondary)]'
                        }`}
                      >
                        {country.dailyRates ? country.dailyRates.split(' ')[0] + '/day' : 'On request'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 2: COMPARE ALL DESTINATIONS MATRIX
          ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCountries.map((country) => {
            const meta = DESTINATION_META[country.slug];
            const parks =
              country.parks && country.parks.length > 0
                ? country.parks.slice(0, 3)
                : meta?.topParksFallback?.slice(0, 3) ?? [];

            return (
              <article
                key={country.slug}
                className="surface-card surface-card-hover rounded-2xl overflow-hidden border border-[var(--border)] shadow-xs flex flex-col justify-between bg-white transition-all duration-300 hover:shadow-md h-full"
              >
                <div>
                  {/* Card Visual Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={country.featuredImageUrl || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'}
                      alt={country.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--brand)] text-white text-[11px] font-extrabold shadow-sm">
                        {country.rank}
                      </span>
                      {country.toursCount !== undefined && country.toursCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                          {country.toursCount} Tours
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-xl font-extrabold font-display drop-shadow">
                        {country.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E4DBB4] border border-[#DEDCCF] text-[11px] shadow-sm">
                        <Star className="w-3 h-3 fill-[#193A38] text-[#193A38]" />
                        <span className="font-extrabold text-[#193A38]">{(country.rating ?? 4.9).toFixed(1)}</span>
                        <span className="text-[#344C49] font-bold">({country.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <p className="text-xs font-bold text-[var(--brand-ink)] line-clamp-1">
                      {meta?.tagline || country.description}
                    </p>

                    <p className="text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-2">
                      {country.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-soft)] text-xs">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-muted)]">Budget Range</div>
                        <div className="font-extrabold text-[var(--ink)] truncate">
                          {country.dailyRates?.replace('per day', 'pp/day') || 'On request'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-muted)]">Optimal Months</div>
                        <div className="font-extrabold text-[var(--ink)] truncate">
                          {country.bestTimeSummary?.split('(')[0].trim() || 'Year-round'}
                        </div>
                      </div>
                    </div>

                    {/* Parks Pills */}
                    {parks.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-muted)] mb-1">
                          Signature Parks
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {parks.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/parks/${p.slug}`}
                              className="text-[10px] font-semibold bg-[var(--canvas-base)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)] px-2 py-0.5 rounded border border-[var(--border-soft)] text-[var(--ink)] transition-colors"
                            >
                              {p.name.replace('National Park', 'NP').replace('Game Reserve', 'GR')}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/tours?country=${encodeURIComponent(country.name)}`}
                    className="btn btn-primary btn-sm text-xs font-bold justify-center"
                  >
                    <span>View Tours</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/parks/${country.slug}`}
                    className="btn btn-ghost btn-sm text-xs font-bold justify-center border border-[var(--border)] bg-[var(--canvas-base)] text-[var(--ink)] hover:bg-white"
                  >
                    <span>Park Guide</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
