'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MapPin, Calendar, Users, Star, SlidersHorizontal, RotateCcw, Search, Building2 } from 'lucide-react';

interface OperatorFilterSidebarProps {
  currentCountry?: string;
  currentRating?: string;
  currentOffice?: string;
  currentSearch?: string;
}

export default function OperatorFilterSidebar({
  currentCountry = '',
  currentRating = '',
  currentOffice = '',
  currentSearch = '',
}: OperatorFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [operatorQuery, setOperatorQuery] = useState(currentSearch);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    return params.toString();
  };

  const handleParamChange = (name: string, value: string) => {
    router.push(`/operators?${createQueryString(name, value)}`);
  };

  const resetAll = () => {
    setOperatorQuery('');
    router.push('/operators');
  };

  const applyOperatorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleParamChange('search', operatorQuery.trim());
  };

  const countryOptions = ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'Rwanda', 'Zimbabwe'];
  const hasActiveFilters = Boolean(currentCountry || currentRating || currentOffice || currentSearch);

  const selectClass =
    'w-full border border-[var(--border)] p-2.5 text-[13px] bg-white text-[var(--ink)] rounded-xl focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)] cursor-pointer font-medium shadow-2xs transition-all hover:border-amber-400';

  return (
    <aside className="w-full bg-white border border-[var(--border)] rounded-2xl p-5 font-sans text-[var(--ink)] shadow-sm sticky top-24">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gold-soft)] text-[var(--gold-ink)] font-bold shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[17px] font-extrabold text-[var(--ink)] font-display leading-tight">Filter Agencies</h2>
            <span className="text-[11px] font-semibold text-[var(--ink-secondary)]">Find local tour operators</span>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Search Operator Name */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <Search className="w-4 h-4 text-[var(--gold)]" /> Agency Name
          </label>
          <form onSubmit={applyOperatorSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search by name..."
              value={operatorQuery}
              onChange={(e) => setOperatorQuery(e.target.value)}
              className="w-full border border-[var(--border)] py-2.5 pl-3 pr-10 text-[13px] bg-white text-[var(--ink)] rounded-xl focus:outline-none focus:border-[var(--gold)] font-medium shadow-2xs"
            />
            <button
              type="submit"
              aria-label="Search agency"
              className="absolute right-2 text-[var(--gold)] hover:text-amber-700 p-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Destination Country */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <MapPin className="w-4 h-4 text-[var(--gold)]" /> Operating Country
          </div>
          <select
            value={currentCountry || ''}
            onChange={(event) => handleParamChange('country', event.target.value)}
            className={selectClass}
          >
            <option value="">All Destinations</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Head Office Location */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <Building2 className="w-4 h-4 text-[var(--gold)]" /> Office Location
          </div>
          <select
            value={currentOffice || ''}
            onChange={(event) => handleParamChange('office', event.target.value)}
            className={selectClass}
          >
            <option value="">Any Office Location</option>
            {['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'United States'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] my-5" />

      {/* Rating */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 text-[12px] font-extrabold text-[var(--ink-muted)] uppercase tracking-wider">
          Rating Threshold
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3].map((stars) => {
            const checked = Number(currentRating || 0) === stars;
            return (
              <label key={stars} className={`flex items-center justify-between cursor-pointer group rounded-xl px-3 py-2 text-[13px] transition-all border ${checked ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'border-transparent text-[var(--ink-body)] hover:bg-[var(--surface-raised)]'}`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="rating"
                    checked={checked}
                    onChange={() => handleParamChange('rating', checked ? '' : String(stars))}
                    className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                  />
                  <span className="flex text-[12px]" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-amber-500 text-amber-500' : 'fill-slate-200 text-slate-200'}`} />
                    ))}
                  </span>
                </div>
                <span className="text-[12px] font-semibold">{stars}.0+</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
