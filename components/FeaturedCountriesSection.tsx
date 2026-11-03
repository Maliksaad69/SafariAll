'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Calendar } from 'lucide-react';

export interface CountryHighlight {
  name: string;
  slug: string;
  rank: string;
  featuredImageUrl?: string | null;
  rating?: number | null;
  reviewCount: number;
  description?: string | null;
  dailyRates?: string | null;
  bestTimeSummary?: string | null;
}

interface FeaturedCountriesSectionProps {
  countries: CountryHighlight[];
}

export default function FeaturedCountriesSection({ countries }: FeaturedCountriesSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!countries || countries.length === 0) return null;

  const featured = countries[selectedIndex] ?? countries[0];

  return (
    <div className="surface-card overflow-hidden">
      {/* Mobile / Tablet interactive pill bar switcher */}
      <div className="block lg:hidden border-b border-[var(--border-soft)] bg-white/60 p-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {countries.map((country, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={country.name}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[var(--brand)] text-white shadow-md'
                    : 'border border-[var(--border)] bg-white/80 text-[var(--ink)] hover:bg-white'
                }`}
              >
                <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--brand-ink)]'}`}>
                  {country.rank}
                </span>
                <span>{country.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar List */}
        <div className="hidden lg:block w-[280px] shrink-0 border-r border-[var(--border-soft)] bg-white/40">
          {countries.map((country, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={country.name}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex w-full items-center px-5 py-3.5 text-left text-[14px] transition-colors ${
                  isSelected
                    ? 'bg-white/80 font-bold text-[var(--ink)] shadow-xs'
                    : 'text-[var(--ink-secondary)] hover:bg-white/50 hover:text-[var(--ink)]'
                }`}
              >
                <span
                  className={`mr-3 inline-block w-8 text-[12px] font-bold ${
                    isSelected ? 'text-[var(--brand-ink)]' : 'text-[var(--ink-muted)]'
                  }`}
                >
                  {country.rank}
                </span>
                <span className="flex-1 truncate">{country.name}</span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isSelected ? 'text-[var(--brand-ink)] opacity-100 translate-x-0.5' : 'opacity-40'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Featured Country Display Panel */}
        <div className="relative flex-1 bg-[var(--dark)]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url('${featured.featuredImageUrl ?? ''}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/85 via-black/55 to-black/25" />

          <div className="relative z-10 flex min-h-[380px] sm:min-h-[420px] flex-col justify-center px-5 py-8 text-white sm:px-8 md:px-10 md:py-10">
            <div className="mb-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h3 className="text-[26px] sm:text-[32px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {featured.name}
              </h3>
              <div className="flex items-center gap-0.5 text-[var(--dark-gold)]" aria-label={`Rated ${featured.rating ?? 0} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-white/95">
                {(featured.rating ?? 0).toFixed(1)}/5 · {featured.reviewCount?.toLocaleString() ?? 0} Reviews
              </span>
            </div>

            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--dark-gold)]">
              {featured.rank} of {countries.length} Major Safari Countries
            </p>

            <p className="max-w-[580px] text-[13px] sm:text-[14px] leading-relaxed text-white/95 line-clamp-3 sm:line-clamp-none">
              {featured.description}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 text-[13px]">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 font-bold text-white backdrop-blur-sm">
                  $
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white">Rates (USD)</div>
                  <div className="text-white/90 truncate">{featured.dailyRates?.replace('per day', 'pp/day') || 'Varies by season'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur-sm">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white">Best Time to Go</div>
                  <div className="text-white/90 truncate">{featured.bestTimeSummary?.split('(')[0].trim() || 'Year-round'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <Link
                href={`/tours?country=${encodeURIComponent(featured.name)}`}
                className="btn btn-primary btn-sm min-h-[42px] justify-center text-[13px] sm:text-[14px]"
              >
                <span>{featured.name} Safaris</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/parks/${featured.slug}`}
                className="btn btn-ghost-dark btn-sm min-h-[42px] justify-center text-[13px] sm:text-[14px]"
              >
                <span>Parks &amp; Highlights</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/operators?country=${encodeURIComponent(featured.name)}`}
                className="btn btn-ghost-dark btn-sm min-h-[42px] justify-center text-[13px] sm:text-[14px]"
              >
                <span>{featured.name} Operators</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
