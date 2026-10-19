'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { MapPin, Calendar, Users, Info } from 'lucide-react';

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
  { value: '1-4', label: '1-4 days' },
  { value: '5-7', label: '5-7 days' },
  { value: '8-10', label: '8-10 days' },
  { value: '11-14', label: '11-14 days' },
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

  // Which month options exist, based on today's date
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

  const selectClass =
    'form-control text-[13px] py-2 px-3 bg-white/80 border-[var(--border)] rounded-xl text-[var(--ink)] focus:border-[var(--brand)] cursor-pointer';

  return (
    <aside className="surface-card w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-sm font-sans text-[var(--ink-body)]">
      {/* Header section */}
      <div className="bg-white/60 backdrop-blur-md border-b border-[var(--border-soft)] p-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold font-display text-[var(--ink)]">Filter Safaris</h2>
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
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Country
          </label>
          <select
            value={currentCountry || ''}
            onChange={(e) => handleParamChange('country', e.target.value)}
            className={selectClass}
          >
            <option value="">Any country</option>
            {(countryCounts ? Object.keys(countryCounts) : safariCountries).map((country) => {
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
          <label className="form-label flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Start Date
          </label>
          <select
            value={currentMonth || ''}
            onChange={(e) => handleParamChange('month', e.target.value)}
            className={selectClass}
          >
            <option value="">Any departure date</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Travelers */}
        <div>
          <label className="form-label flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--brand-ink)]" /> Travelers
          </label>
          <select
            value={selectedTravelers || ''}
            onChange={(e) => handleParamChange('travelers', e.target.value === '2' ? '' : e.target.value)}
            className={selectClass}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Adult' : 'Adults'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Tour Length */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5">
          Tour Length
        </div>
        <div className="space-y-2">
          {durationOptions.map((option) => {
            const count = durationCounts?.[option.value];
            const checked = currentDuration === option.value;
            return (
              <label key={option.value} className="flex items-center justify-between gap-2 cursor-pointer group py-0.5">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="duration"
                    checked={checked}
                    onChange={() => handleParamChange('duration', checked ? '' : option.value)}
                    className="w-4 h-4 accent-[var(--brand)] cursor-pointer"
                  />
                  <span className={`text-[13px] transition-colors ${checked ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-body)] group-hover:text-[var(--ink)]'}`}>
                    {option.label}
                  </span>
                </span>
                {typeof count === 'number' && (
                  <span className="text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--surface-sunk)] px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Comfort Level */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5 flex items-center gap-1.5">
          Comfort Level <Info className="w-3 h-3 text-[var(--ink-muted)]" />
        </div>
        <div className="space-y-2">
          {[
            { label: 'Luxury+', val: 'LUXURY_PLUS' },
            { label: 'Luxury', val: 'LUXURY' },
            { label: 'Mid-range', val: 'MID_RANGE' },
            { label: 'Budget', val: 'BUDGET' },
          ].map((opt) => {
            const count = comfortCounts?.[opt.val];
            const checked = currentComfort === opt.val;
            return (
              <label key={opt.val} className="flex items-center justify-between gap-2 cursor-pointer group py-0.5">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleParamChange('comfort', checked ? '' : opt.val)}
                    className="w-4 h-4 rounded accent-[var(--brand)] cursor-pointer"
                  />
                  <span className={`text-[13px] transition-colors ${checked ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-body)] group-hover:text-[var(--ink)]'}`}>
                    {opt.label}
                  </span>
                </span>
                {typeof count === 'number' && (
                  <span className="text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--surface-sunk)] px-2 py-0.5 rounded-full">
                    {count.toLocaleString()}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      {/* Private or Shared Tour */}
      <div className="px-4 py-3.5">
        <div className="form-label mb-2.5 flex items-center gap-1.5">
          Tour Format <Info className="w-3 h-3 text-[var(--ink-muted)]" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group py-0.5">
            <input
              type="radio"
              name="tourType"
              checked={searchParams.get('tourType') === 'PRIVATE'}
              onChange={() => handleParamChange('tourType', 'PRIVATE')}
              className="w-4 h-4 accent-[var(--brand)] cursor-pointer"
            />
            <span className={`text-[13px] ${searchParams.get('tourType') === 'PRIVATE' ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-body)] group-hover:text-[var(--ink)]'}`}>Private tour</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group py-0.5">
            <input
              type="radio"
              name="tourType"
              checked={searchParams.get('tourType') === 'SHARED_GROUP'}
              onChange={() => handleParamChange('tourType', 'SHARED_GROUP')}
              className="w-4 h-4 accent-[var(--brand)] cursor-pointer"
            />
            <span className={`text-[13px] ${searchParams.get('tourType') === 'SHARED_GROUP' ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-body)] group-hover:text-[var(--ink)]'}`}>Shared group tour</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]"></div>

      <div className="p-4">
        <label className="form-label mb-1.5">Sort Results</label>
        <select
          value={currentSort || 'recommended'}
          onChange={(e) => handleParamChange('sort', e.target.value === 'recommended' ? '' : e.target.value)}
          className={selectClass}
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Top Rated</option>
          <option value="duration_asc">Shortest First</option>
        </select>
      </div>
    </aside>
  );
}
