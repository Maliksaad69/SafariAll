'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MapPin, Calendar, Users, Star } from 'lucide-react';

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
    router.push('/operators');
  };

  const applyOperatorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleParamChange('search', operatorQuery.trim());
  };

  const countryOptions = ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'Rwanda', 'Zimbabwe'];
  const officeOptions = ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'United States'];

  const selectClass =
    'form-control text-[13px] py-2 px-3 bg-white/80 border-[var(--border)] rounded-xl text-[var(--ink)] focus:border-[var(--brand)] cursor-pointer';

  return (
    <aside className="surface-card w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-sm font-sans text-[var(--ink-body)]">
      {/* Header section */}
      <div className="bg-white/60 backdrop-blur-md border-b border-[var(--border-soft)] p-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold font-display text-[var(--ink)]">Filter Operators</h2>
        <button
          type="button"
          onClick={resetAll}
          className="text-[12px] font-semibold text-[var(--brand-ink)] hover:underline cursor-pointer"
        >
          Reset all
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Where To */}
        <div>
          <label className="form-label flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Destination
          </label>
          <select
            value={currentCountry || ''}
            onChange={(event) => handleParamChange('country', event.target.value)}
            className={selectClass}
          >
            <option value="">Any destination</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="form-label flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Start Date
          </label>
          <select
            value=""
            onChange={(e) => handleParamChange('month', e.target.value)}
            className={selectClass}
          >
            <option value="">Any departure date</option>
            {['This month', 'Next month', 'Next 3 months', 'Next 6 months'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Travelers */}
        <div>
          <label className="form-label flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Travelers
          </label>
          <select
            value={searchParams.get('travelers') || ''}
            onChange={(e) => handleParamChange('travelers', e.target.value)}
            className={selectClass}
          >
            <option value="">Any group size</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Adult' : 'Adults'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Rating */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5">
          Rating
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <input
                type="radio"
                name="rating"
                checked={Number(currentRating || 0) === stars}
                onChange={() => handleParamChange('rating', Number(currentRating || 0) === stars ? '' : String(stars))}
                className="w-4 h-4 accent-[var(--brand)] cursor-pointer"
              />
              <span className="flex text-[12px]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#e2ddd4] text-[#e2ddd4]'}`} />
                ))}
              </span>
              <span className="text-[13px] text-[var(--ink-secondary)] group-hover:text-[var(--ink)]">& up</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Filter by Operator */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5">
          Search by Name
        </div>
        <form onSubmit={applyOperatorSearch} className="flex gap-2">
          <input
            type="text"
            value={operatorQuery}
            onChange={(e) => setOperatorQuery(e.target.value)}
            placeholder="Operator name..."
            aria-label="Filter by operator name"
            className="form-control text-[13px] py-1.5 px-3 bg-white/80 border-[var(--border)] rounded-xl text-[var(--ink)] flex-1 min-w-0"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm px-3"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Office In */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5">
          Office Location
        </div>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
          {officeOptions.map((label) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <input
                type="radio"
                name="office"
                checked={currentOffice === label}
                onChange={() => handleParamChange('office', currentOffice === label ? '' : label)}
                className="w-4 h-4 accent-[var(--brand)] cursor-pointer"
              />
              <span className={`text-[13px] ${currentOffice === label ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-body)] group-hover:text-[var(--ink)]'}`}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
