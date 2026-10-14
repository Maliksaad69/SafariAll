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
    'w-full border border-[#ccc] p-2 text-[13px] bg-white text-[#333] rounded-sm focus:outline-none focus:border-[#666] cursor-pointer';

  return (
    <aside className="w-full bg-[#f4f4f4] border border-[#d5d5d5] rounded-sm pb-4 font-sans text-[#333]">
      {/* Header section */}
      <div className="bg-[#e9e9e9] border-b border-[#d5d5d5] p-4 relative">
        <h2 className="text-[22px] font-bold text-[#333]">Your Safari</h2>
        <button
          type="button"
          onClick={resetAll}
          className="absolute top-4 right-4 text-[12px] text-[var(--brand-ink)] hover:underline cursor-pointer"
        >
          Reset all
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Where To */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[13px] font-bold">
            <MapPin className="w-4 h-4 text-[#8a8a8a]" /> Where To
          </div>
          <select
            value={currentCountry || ''}
            onChange={(e) => handleParamChange('country', e.target.value)}
            className={selectClass}
          >
            <option value="">Any country</option>
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

        {/* Start Date — real month filter wired to results */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[13px] font-bold">
            <Calendar className="w-4 h-4 text-[#8a8a8a]" /> Start Date
          </div>
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

        {/* Travelers — functional dropdown persisted in the URL */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[13px] font-bold">
            <Users className="w-4 h-4 text-[#8a8a8a]" /> Travelers
          </div>
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

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Tour Length */}
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-3 text-[13px] font-bold">
          Tour Length
        </div>
        <div className="px-2 space-y-3">
          {durationOptions.map((option) => {
            const count = durationCounts?.[option.value];
            const checked = currentDuration === option.value;
            return (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="duration"
                  checked={checked}
                  onChange={() => handleParamChange('duration', checked ? '' : option.value)}
                  className="w-3.5 h-3.5 text-[#444] focus:ring-[#444] cursor-pointer"
                />
                <span className={`text-[13px] ${checked ? 'font-bold text-[#222]' : 'text-[#555] group-hover:text-[#333]'}`}>
                  {option.label}
                  {typeof count === 'number' ? <span className="text-[#7a7263] text-[11px]"> ({count})</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Comfort Level */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">
          Comfort Level <Info className="w-3.5 h-3.5 text-[#8a8a8a]" />
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
              <label key={opt.val} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleParamChange('comfort', checked ? '' : opt.val)}
                  className="w-3.5 h-3.5 border-[#ccc] rounded-sm text-[#444] focus:ring-[#444] cursor-pointer"
                />
                <span className={`text-[13px] ${checked ? 'font-bold text-[#222]' : 'text-[#555] group-hover:text-[#333]'}`}>
                  {opt.label}
                  {typeof count === 'number' ? <span className="text-[#7a7263] text-[11px]"> ({count.toLocaleString()})</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Private or Shared Tour */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">
          Private or Shared Tour <Info className="w-3.5 h-3.5 text-[#8a8a8a]" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="tourType"
              checked={searchParams.get('tourType') === 'PRIVATE'}
              onChange={() => handleParamChange('tourType', 'PRIVATE')}
              className="w-3.5 h-3.5 text-[#444] focus:ring-[#444] cursor-pointer"
            />
            <span className="text-[13px] text-[#555] group-hover:text-[#333]">Private tour</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="tourType"
              checked={searchParams.get('tourType') === 'SHARED_GROUP'}
              onChange={() => handleParamChange('tourType', 'SHARED_GROUP')}
              className="w-3.5 h-3.5 text-[#444] focus:ring-[#444] cursor-pointer"
            />
            <span className="text-[13px] text-[#555] group-hover:text-[#333]">Shared tour</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[#d5d5d5] my-2"></div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">Sort By</div>
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
