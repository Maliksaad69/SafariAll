'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Users, Star, Building2, ChevronDown, Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

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

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    return params.toString();
  };

  const handleParamChange = (name: string, value: string) => {
    router.push(`/safari-operators?${createQueryString(name, value)}`);
  };

  const resetAll = () => {
    router.push('/safari-operators');
  };

  const applyOperatorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleParamChange('search', operatorQuery.trim());
  };

  const countryOptions = ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'Rwanda', 'Zimbabwe'];
  const officeOptions = ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'United States'];

  const selectClass =
    'w-full appearance-none rounded-xl border border-[#DEDCCF] bg-white py-2.5 pl-3.5 pr-9 text-left text-sm font-semibold text-[#193A38] shadow-2xs outline-none transition-all focus:border-[#214446] focus:ring-1 focus:ring-[#214446] cursor-pointer';

  const labelClass =
    'text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5 mb-2';

  const hasAnyFilter = Boolean(currentCountry || currentRating || currentOffice || currentSearch);

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];
    if (currentCountry) list.push({ key: 'country', label: `Country: ${currentCountry}`, value: '' });
    if (currentRating) list.push({ key: 'rating', label: `${currentRating}★ & up`, value: '' });
    if (currentOffice) list.push({ key: 'office', label: `Office: ${currentOffice}`, value: '' });
    if (currentSearch) list.push({ key: 'search', label: `"${currentSearch}"`, value: '' });
    return list;
  }, [currentCountry, currentRating, currentOffice, currentSearch]);

  const renderFilterSections = () => (
    <>
      {/* Destination, Departure, Group Size */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
          {/* Destination */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-4 h-4 text-[#214446]" /> Destination
            </label>
            <div className="relative">
              <select
                value={currentCountry || ''}
                onChange={(event) => handleParamChange('country', event.target.value)}
                className={selectClass}
              >
                <option value="">Any destination</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
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
                value=""
                onChange={(e) => handleParamChange('month', e.target.value)}
                className={selectClass}
              >
                <option value="">Any departure date</option>
                {['This month', 'Next month', 'Next 3 months', 'Next 6 months'].map((m) => (
                  <option key={m} value={m}>
                    {m}
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#516D6A]" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Rating */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#214446]" /> Minimum Rating
          </span>
          {currentRating && (
            <button
              type="button"
              onClick={() => handleParamChange('rating', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5 w-full">
          {[5, 4, 3, 2, 1].map((stars) => {
            const isSelected = Number(currentRating || 0) === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => handleParamChange('rating', isSelected ? '' : String(stars))}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                    : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
                }`}
              >
                <span className="flex items-center gap-0.5 whitespace-nowrap">
                  <span>{stars}</span>
                  <Star className={`h-3 w-3 ${isSelected ? 'fill-white text-white' : 'fill-[#E46924] text-[#E46924]'}`} />
                </span>
                <span className={`text-[10px] font-medium leading-none mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#516D6A]'}`}>
                  {stars === 5 ? 'only' : '& up'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Search by Operator Name */}
      <div className="p-4 sm:p-5">
        <div className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5 mb-2.5">
          <Search className="w-4 h-4 text-[#214446]" /> Search by Name
        </div>
        <form onSubmit={applyOperatorSearch} className="flex gap-2">
          <input
            type="text"
            value={operatorQuery}
            onChange={(e) => setOperatorQuery(e.target.value)}
            placeholder="Operator company name..."
            aria-label="Filter by operator name"
            className="w-full appearance-none rounded-xl border border-[#DEDCCF] bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-[#193A38] outline-none placeholder:text-[#516D6A]/60 focus:border-[#214446] focus:ring-1 focus:ring-[#214446]"
          />
          <button
            type="submit"
            className="btn btn-primary px-3.5 py-2 text-xs font-bold shrink-0 bg-[#214446] text-white hover:bg-[#193A38] rounded-xl cursor-pointer"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="border-t border-[#DEDCCF]"></div>

      {/* Office Location */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#193A38] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#214446]" /> Office Location
          </span>
          {currentOffice && (
            <button
              type="button"
              onClick={() => handleParamChange('office', '')}
              className="text-[11px] font-bold text-[#516D6A] hover:text-[#214446] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {officeOptions.map((label) => {
            const isSelected = currentOffice === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleParamChange('office', isSelected ? '' : label)}
                className={`flex items-center justify-center px-2.5 py-2.5 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#214446] !text-white border-[#214446] shadow-sm ring-1 ring-[#214446]'
                    : 'bg-white border-[#DEDCCF] !text-[#193A38] hover:bg-[#E4DBB4]/30 hover:border-[#214446]/40'
                }`}
              >
                <span className="whitespace-nowrap truncate">{label}</span>
              </button>
            );
          })}
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
            <span>Filter Operators</span>
            {activeFilters.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#214446] px-1.5 text-[11px] font-extrabold text-white">
                {activeFilters.length}
              </span>
            )}
          </button>
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
            aria-label="Filter African Safari Operators"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#DEDCCF] bg-[#F7F6F1] px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#214446]" />
                <h2 className="text-xl font-bold font-display text-[#193A38]">Filter Operators</h2>
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
                Show Operators
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sticky Sidebar (>= 1024px) ── */}
      <aside className="hidden lg:block surface-card w-full rounded-2xl overflow-hidden border border-[#DEDCCF] shadow-sm font-sans text-[#344C49] bg-white">
        {/* Header section (Spread edge-to-edge from left to right) */}
        <div className="bg-[#F7F6F1] border-b border-[#DEDCCF] p-4 sm:p-5 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#193A38]">Filter Operators</h2>
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
