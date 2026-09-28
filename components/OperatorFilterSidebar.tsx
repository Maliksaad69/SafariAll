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
    'w-full border border-[#ccc] p-2 text-[13px] bg-white text-[#333] rounded-sm focus:outline-none focus:border-[#666] cursor-pointer';

  return (
    <aside className="w-full bg-[#f4f4f4] border border-[#d5d5d5] rounded-sm pb-4 font-sans text-[#333]">
      {/* Header section */}
      <div className="bg-[#e9e9e9] border-b border-[#d5d5d5] p-4 relative">
        <h2 className="text-[22px] font-bold text-[#333]">Your Safari</h2>
        <button
          type="button"
          onClick={resetAll}
          className="absolute top-4 right-4 text-[12px] text-[#0070c0] hover:underline cursor-pointer"
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
          <div className="flex items-center gap-2 mb-1.5 text-[13px] font-bold">
            <Calendar className="w-4 h-4 text-[#8a8a8a]" /> Start Date
          </div>
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

        {/* Travelers — now a functional select */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[13px] font-bold">
            <Users className="w-4 h-4 text-[#8a8a8a]" /> Travelers
          </div>
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

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Rating */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">
          Rating
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={Number(currentRating || 0) === stars}
                onChange={() => handleParamChange('rating', Number(currentRating || 0) === stars ? '' : String(stars))}
                className="w-3.5 h-3.5 text-[#444] focus:ring-[#444] cursor-pointer"
              />
              <span className="flex text-[12px]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-[#ffc107] text-[#ffc107]' : 'fill-[#ccc] text-[#ccc]'}`} />
                ))}
              </span>
              <span className="text-[13px] text-[#555] group-hover:text-[#333]">& up</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Filter by Operator — now wired to the page's search param */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">
          Filter by Operator
        </div>
        <form onSubmit={applyOperatorSearch} className="flex">
          <input
            type="text"
            value={operatorQuery}
            onChange={(e) => setOperatorQuery(e.target.value)}
            placeholder="Operator name..."
            aria-label="Filter by operator name"
            className="w-full border border-[#ccc] p-1.5 text-[13px] bg-white rounded-l-sm focus:outline-none focus:border-[#666] min-w-0"
          />
          <button
            type="submit"
            className="bg-[#e2e2e2] hover:bg-[#d5d5d5] border border-[#ccc] border-l-0 px-3 text-[12px] font-bold text-[#333] rounded-r-sm transition-colors cursor-pointer"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="border-t border-[#d5d5d5] my-2"></div>

      {/* Office In */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3 text-[13px] font-bold">
          Office In
        </div>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
          {officeOptions.map((label) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="office"
                checked={currentOffice === label}
                onChange={() => handleParamChange('office', currentOffice === label ? '' : label)}
                className="w-3.5 h-3.5 border-[#ccc] rounded-sm text-[#444] cursor-pointer"
              />
              <span className="text-[13px] text-[#555] group-hover:text-[#333]">{label}</span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
