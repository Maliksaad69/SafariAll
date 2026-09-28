'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { MapPin, Calendar, Users, Info, SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';

interface FilterSidebarProps {
  currentCountry?: string;
  currentComfort?: string;
  currentDuration?: string;
  currentSort?: string;
  currentSearch?: string;
  currentMonth?: string;
  currentTravelers?: string;
  comfortCounts?: Record<string, number>;
  countryCounts?: Record<string, number>;
  durationCounts?: Record<string, number>;
}

export const safariCountries = ['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Rwanda', 'Zimbabwe'];

export const durationOptions = [
  { value: '1-4', label: '1 - 4 days' },
  { value: '5-7', label: '5 - 7 days' },
  { value: '8-10', label: '8 - 10 days' },
  { value: '11-14', label: '11 - 14 days' },
  { value: '15+', label: '15+ days' },
];

export default function FilterSidebar({
  currentCountry = '',
  currentComfort = '',
  currentDuration = '',
  currentSort = '',
  currentSearch = '',
  currentMonth = '',
  currentTravelers = '',
  comfortCounts,
  countryCounts,
  durationCounts,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(updates)) {
        if (value) params.set(name, value);
        else params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleParamChange = (name: string, value: string) => {
    router.push(`/tours?${createQueryString({ [name]: value })}`);
  };

  const monthOptions = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return formatter.format(d);
    });
  }, []);

  const selectedTravelers = Number(currentTravelers || '2');

  const resetAll = () => {
    router.push('/tours');
  };

  const hasActiveFilters = Boolean(
    currentCountry || currentComfort || currentDuration || currentMonth || currentSearch || currentTravelers
  );

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
            <h2 className="text-[17px] font-extrabold text-[var(--ink)] font-display leading-tight">Filter Safaris</h2>
            <span className="text-[11px] font-semibold text-[var(--ink-secondary)]">Refine your itinerary</span>
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
        {/* Where To */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <MapPin className="w-4 h-4 text-[var(--gold)]" /> Destination Country
          </div>
          <select
            value={currentCountry || ''}
            onChange={(e) => handleParamChange('country', e.target.value)}
            className={selectClass}
          >
            <option value="">All Destinations</option>
            {safariCountries.map((country) => {
              const count = countryCounts?.[country];
              return (
                <option key={country} value={country}>
                  {country}
                  {typeof count === 'number' ? ` (${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <Calendar className="w-4 h-4 text-[var(--gold)]" /> Departure Month
          </div>
          <select
            value={currentMonth || ''}
            onChange={(e) => handleParamChange('month', e.target.value)}
            className={selectClass}
          >
            <option value="">Any month</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Travelers */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-[var(--ink)]">
            <Users className="w-4 h-4 text-[var(--gold)]" /> Guests
          </div>
          <select
            value={selectedTravelers || ''}
            onChange={(e) => handleParamChange('travelers', e.target.value === '2' ? '' : e.target.value)}
            className={selectClass}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Traveler' : 'Travelers'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] my-5" />

      {/* Tour Length */}
      <div>
        <div className="flex justify-between items-center mb-3 text-[12px] font-extrabold text-[var(--ink-muted)] uppercase tracking-wider">
          Duration
        </div>
        <div className="space-y-1.5">
          {durationOptions.map((option) => {
            const count = durationCounts?.[option.value];
            const checked = currentDuration === option.value;
            return (
              <label key={option.value} className={`flex items-center justify-between cursor-pointer group rounded-xl px-3 py-2 text-[13px] transition-all border ${checked ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'border-transparent text-[var(--ink-body)] hover:bg-[var(--surface-raised)]'}`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="duration"
                    checked={checked}
                    onChange={() => handleParamChange('duration', checked ? '' : option.value)}
                    className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                  />
                  <span>{option.label}</span>
                </div>
                {typeof count === 'number' && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${checked ? 'bg-amber-200/60 text-amber-900' : 'bg-stone-100 text-stone-500'}`}>
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] my-5" />

      {/* Comfort Level */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 text-[12px] font-extrabold text-[var(--ink-muted)] uppercase tracking-wider">
          Comfort Level
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'Luxury+', val: 'LUXURY_PLUS' },
            { label: 'Luxury', val: 'LUXURY' },
            { label: 'Mid-range', val: 'MID_RANGE' },
            { label: 'Budget', val: 'BUDGET' },
          ].map((opt) => {
            const count = comfortCounts?.[opt.val];
            const checked = currentComfort === opt.val;
            return (
              <label key={opt.val} className={`flex items-center justify-between cursor-pointer group rounded-xl px-3 py-2 text-[13px] transition-all border ${checked ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'border-transparent text-[var(--ink-body)] hover:bg-[var(--surface-raised)]'}`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleParamChange('comfort', checked ? '' : opt.val)}
                    className="w-4 h-4 accent-[var(--gold)] rounded-md cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </div>
                {typeof count === 'number' && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${checked ? 'bg-amber-200/60 text-amber-900' : 'bg-stone-100 text-stone-500'}`}>
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] my-5" />

      {/* Private or Shared */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 text-[12px] font-extrabold text-[var(--ink-muted)] uppercase tracking-wider">
          Tour Type
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'Private Tour', val: 'PRIVATE' },
            { label: 'Shared Group', val: 'SHARED_GROUP' },
          ].map((typeItem) => {
            const checked = searchParams.get('tourType') === typeItem.val;
            return (
              <label key={typeItem.val} className={`flex items-center gap-2.5 cursor-pointer group rounded-xl px-3 py-2 text-[13px] transition-all border ${checked ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'border-transparent text-[var(--ink-body)] hover:bg-[var(--surface-raised)]'}`}>
                <input
                  type="radio"
                  name="tourType"
                  checked={checked}
                  onChange={() => handleParamChange('tourType', checked ? '' : typeItem.val)}
                  className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                />
                <span>{typeItem.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
