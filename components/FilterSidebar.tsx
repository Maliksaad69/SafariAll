'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

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

export const comfortOptions = [
  { label: 'Luxury+', val: 'LUXURY_PLUS' },
  { label: 'Luxury', val: 'LUXURY' },
  { label: 'Mid-range', val: 'MID_RANGE' },
  { label: 'Budget', val: 'BUDGET' },
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
    'w-full appearance-none rounded-xl border border-[#DEDCCF] bg-white py-2.5 pl-3.5 pr-9 text-left text-sm font-semibold text-[#193A38] shadow-2xs outline-none transition-all focus:border-[#214446] focus:ring-1 focus:ring-[#214446] cursor-pointer';

  const labelClass =
    'text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5 mb-2';

  const hasAnyFilter = Boolean(
    currentCountry ||
    currentComfort ||
    currentDuration ||
    currentMonth ||
    (currentTravelers && currentTravelers !== '2') ||
    searchParams.get('tourType') ||
    currentSort
  );

  return (
    <aside className="surface-card w-full rounded-2xl overflow-hidden border border-[#DEDCCF] shadow-sm font-sans text-[#344C49] bg-white">
      {/* Header section (Spread edge-to-edge from left to right) */}
      <div className="bg-[#F7F6F1] border-b border-[#DEDCCF] p-4 sm:p-5 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#193A38]">Filter Safaris</h2>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs sm:text-sm font-bold text-[#214446] hover:underline cursor-pointer transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Core Selects (Country, Departure Date, Travelers) */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
          {/* Where To */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-4 h-4 text-[#214446]" /> Country
            </label>
            <div className="relative">
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#516D6A]" />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className={labelClass}>
              <Calendar className="w-4 h-4 text-[#214446]" /> Start Date
            </label>
            <div className="relative">
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#516D6A]" />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className={labelClass}>
              <Users className="w-4 h-4 text-[#214446]" /> Travelers
            </label>
            <div className="relative">
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#516D6A]" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Tour Format (Spread left to right in a 2-column grid, no stacked words) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#214446]" /> Tour Format
          </span>
          {searchParams.get('tourType') && (
            <button
              type="button"
              onClick={() => handleParamChange('tourType', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={() => handleParamChange('tourType', searchParams.get('tourType') === 'PRIVATE' ? '' : 'PRIVATE')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
              searchParams.get('tourType') === 'PRIVATE'
                ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Private Tour</span>
          </button>
          <button
            type="button"
            onClick={() => handleParamChange('tourType', searchParams.get('tourType') === 'SHARED_GROUP' ? '' : 'SHARED_GROUP')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
              searchParams.get('tourType') === 'SHARED_GROUP'
                ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Shared Group</span>
          </button>
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Tour Length (Spread left to right in a 2-column grid, no words stacked down) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#214446]" /> Tour Length
          </span>
          {currentDuration && (
            <button
              type="button"
              onClick={() => handleParamChange('duration', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {durationOptions.map((option, idx) => {
            const count = durationCounts?.[option.value];
            const checked = currentDuration === option.value;
            const isLastOdd = idx === durationOptions.length - 1 && durationOptions.length % 2 === 1;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleParamChange('duration', checked ? '' : option.value)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  isLastOdd ? 'col-span-2' : ''
                } ${
                  checked
                    ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                    : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
                }`}
              >
                <span className="whitespace-nowrap">{option.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`ml-1.5 text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      checked ? 'bg-white/20 !text-white' : 'bg-[#F7F6F1] !text-[#516D6A] border border-[#DEDCCF]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Comfort Level (Spread left to right in a 2x2 grid, no options centered) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#214446]" /> Comfort Level
          </span>
          {currentComfort && (
            <button
              type="button"
              onClick={() => handleParamChange('comfort', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {comfortOptions.map((opt) => {
            const count = comfortCounts?.[opt.val];
            const checked = currentComfort === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleParamChange('comfort', checked ? '' : opt.val)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  checked
                    ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                    : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
                }`}
              >
                <span className="whitespace-nowrap">{opt.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`ml-1.5 text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      checked ? 'bg-white/20 !text-white' : 'bg-[#F7F6F1] !text-[#516D6A] border border-[#DEDCCF]'
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Sort Results */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-[#214446]" /> Sort Results
          </label>
          {currentSort && (
            <button
              type="button"
              onClick={() => handleParamChange('sort', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline"
            >
              Default
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={currentSort || 'recommended'}
            onChange={(e) => handleParamChange('sort', e.target.value === 'recommended' ? '' : e.target.value)}
            className={selectClass}
          >
            <option value="recommended">Recommended Safaris</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Top Rated First</option>
            <option value="duration_asc">Duration: Shortest First</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#516D6A]" />
        </div>
      </div>
    </aside>
  );
}
