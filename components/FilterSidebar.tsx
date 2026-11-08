'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
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

export const safariCountries = ['Botswana', 'Kenya', 'Namibia', 'Rwanda', 'South Africa', 'Tanzania', 'Uganda', 'Zimbabwe'];

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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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
    router.push(`/african-safari-tours?${createQueryString({ [name]: value })}`);
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
    router.push('/african-safari-tours');
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

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];
    if (currentCountry) list.push({ key: 'country', label: currentCountry, value: '' });
    if (currentComfort) {
      const opt = comfortOptions.find((c) => c.val === currentComfort);
      list.push({ key: 'comfort', label: opt?.label || currentComfort, value: '' });
    }
    if (currentDuration) list.push({ key: 'duration', label: `${currentDuration} days`, value: '' });
    if (currentMonth) list.push({ key: 'month', label: currentMonth, value: '' });
    if (currentTravelers && currentTravelers !== '2') list.push({ key: 'travelers', label: `${currentTravelers} travelers`, value: '2' });
    if (searchParams.get('tourType')) {
      const tt = searchParams.get('tourType');
      list.push({ key: 'tourType', label: tt === 'PRIVATE' ? 'Private tour' : 'Shared group', value: '' });
    }
    return list;
  }, [currentCountry, currentComfort, currentDuration, currentMonth, currentTravelers, searchParams]);

  // Shared Filter Controls Content
  const renderFilterSections = () => (
    <>
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
                {(countryCounts ? Object.keys(countryCounts).sort((a, b) => a.localeCompare(b)) : safariCountries).map((country) => {
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

      {/* Tour Format */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#214446]" /> Tour Format
          </span>
          {searchParams.get('tourType') && (
            <button
              type="button"
              onClick={() => handleParamChange('tourType', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
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

      {/* Tour Length */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#214446]" /> Tour Length
          </span>
          {currentDuration && (
            <button
              type="button"
              onClick={() => handleParamChange('duration', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
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

      {/* Comfort Level */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#214446]" /> Comfort Level
          </span>
          {currentComfort && (
            <button
              type="button"
              onClick={() => handleParamChange('comfort', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
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
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
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
    </>
  );

  return (
    <>
      {/* ── Mobile Compact Trigger Bar (< 1024px) ── */}
      <div className="block lg:hidden mb-4 space-y-2.5">
        <div className="flex items-center gap-2.5">
          {/* Main Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#DEDCCF] bg-white px-4 py-3 text-sm font-bold text-[#193A38] shadow-xs hover:bg-[#E4DBB4]/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#214446]" />
            <span>Filter Safaris</span>
            {activeFilters.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#214446] px-1.5 text-[11px] font-extrabold text-white">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Quick Sort Selector on Mobile */}
          <div className="relative w-44 shrink-0">
            <select
              value={currentSort || 'recommended'}
              onChange={(e) => handleParamChange('sort', e.target.value === 'recommended' ? '' : e.target.value)}
              aria-label="Sort safaris"
              className="w-full appearance-none rounded-xl border border-[#DEDCCF] bg-white py-3 pl-3 pr-8 text-xs font-bold text-[#193A38] shadow-xs outline-none cursor-pointer truncate"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
              <option value="duration_asc">Shortest First</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#516D6A]" />
          </div>
        </div>

        {/* Active Filter Chips on Mobile */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-lg bg-[#E4DBB4]/50 hover:bg-[#E4DBB4] px-2.5 py-1 text-xs font-bold text-[#193A38] shrink-0 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => handleParamChange(f.key, f.value)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#214446]/20 bg-white px-2.5 py-1 text-xs font-semibold text-[#193A38] shadow-2xs shrink-0 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors group"
              >
                <span>{f.label}</span>
                <X className="h-3 w-3 text-[#516D6A] group-hover:text-red-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile Slide-Over Drawer Modal (< 1024px) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            role="dialog"
            aria-label="Filter African Safari Tours"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#DEDCCF] bg-[#F7F6F1] px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#214446]" />
                <h2 className="text-xl font-bold font-display text-[#193A38]">Filter Safaris</h2>
                {activeFilters.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#214446] px-1.5 text-xs font-extrabold text-white">
                    {activeFilters.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#193A38] hover:bg-[#E4DBB4]/40 transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {renderFilterSections()}
            </div>

            {/* Sticky Drawer Footer */}
            <div className="sticky bottom-0 border-t border-[#DEDCCF] bg-white p-4 shadow-lg flex items-center gap-3">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-[#DEDCCF] px-4 py-3 text-sm font-bold text-[#516D6A] hover:bg-[#F7F6F1] transition-colors cursor-pointer"
                >
                  Reset all
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex-1 btn btn-primary py-3 text-sm font-bold text-center justify-center rounded-xl cursor-pointer"
              >
                Show Safaris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sticky Sidebar (>= 1024px) ── */}
      <aside className="hidden lg:block surface-card w-full rounded-2xl overflow-hidden border border-[#DEDCCF] shadow-sm font-sans text-[#344C49] bg-white">
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

        {renderFilterSections()}
      </aside>
    </>
  );
}
