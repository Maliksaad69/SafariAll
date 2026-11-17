'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Compass, Calendar } from 'lucide-react';
import { SAFARI_COUNTRY_LIST } from '@/lib/countries';

const SAFARI_STYLES = [
  { value: '', label: 'All safari styles' },
  { value: 'Wildlife Safari', label: 'Wildlife Safari' },
  { value: 'Luxury Safari', label: 'Luxury Safari' },
  { value: 'Gorilla Trekking', label: 'Gorilla Trekking' },
  { value: 'Family Safari', label: 'Family Safari' },
  { value: 'Big Five Safari', label: 'Big Five Safari' },
  { value: 'Fly-in Safari', label: 'Fly-in Safari' },
  { value: 'Cultural Safari', label: 'Cultural & Walking' },
];

export default function HeroSearchForm({ initialTourCount }: { initialTourCount?: number } = {}) {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [style, setStyle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [tourCount, setTourCount] = useState<number | null>(initialTourCount ?? null);

  useEffect(() => {
    if (typeof initialTourCount === 'number') return;
    let cancelled = false;
    fetch('/api/tours-count')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.count === 'number') setTourCount(d.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialTourCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) {
      params.set('country', destination.trim());
    }
    if (style.trim()) {
      params.set('search', style.trim());
    }
    if (startDate) {
      const date = new Date(`${startDate}T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        params.set('startDate', startDate);
        const month = date.toLocaleString('en-US', { month: 'long' });
        params.set('month', month);
      }
    }
    const qs = params.toString();
    router.push(qs ? `/african-safari-tours?${qs}` : '/african-safari-tours');
  };

  return (
    <div id="search" className="relative z-20 w-full max-w-[1120px] -mt-8 sm:-mt-10 mx-auto px-4">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-xs border border-[#E2DFD4] p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.1fr_1fr_auto] gap-3 items-center"
      >
        {/* Field 1: Where to */}
        <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E2DFD4]">
          <label
            htmlFor="hero-where"
            className="flex items-center gap-2 text-xs font-medium text-[#6B7D79] mb-1"
          >
            <MapPin className="w-4 h-4 text-[#6B7D79]" strokeWidth={1.5} />
            Where to
          </label>
          <select
            id="hero-where"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-white text-[#182624] text-sm font-semibold outline-none cursor-pointer border-0 p-0 focus:ring-0"
          >
            <option value="">All 13 destinations</option>
            {SAFARI_COUNTRY_LIST.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Field 2: Safari style */}
        <div className="px-3 py-2 border-b sm:border-b-0 lg:border-r border-[#E2DFD4]">
          <label
            htmlFor="hero-style"
            className="flex items-center gap-2 text-xs font-medium text-[#6B7D79] mb-1"
          >
            <Compass className="w-4 h-4 text-[#6B7D79]" strokeWidth={1.5} />
            Safari style
          </label>
          <select
            id="hero-style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full bg-white text-[#182624] text-sm font-semibold outline-none cursor-pointer border-0 p-0 focus:ring-0"
          >
            {SAFARI_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 3: Travel date */}
        <div className="px-3 py-2 sm:border-r lg:border-r border-[#E2DFD4]">
          <label
            htmlFor="hero-date"
            className="flex items-center gap-2 text-xs font-medium text-[#6B7D79] mb-1"
          >
            <Calendar className="w-4 h-4 text-[#6B7D79]" strokeWidth={1.5} />
            Travel date
          </label>
          <input
            id="hero-date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white text-[#182624] text-sm font-semibold outline-none cursor-pointer border-0 p-0 focus:ring-0"
          />
        </div>

        {/* Submit button */}
        <div className="p-0.5 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="btn w-full min-h-[44px] px-6 py-3 bg-[#1E433B] hover:bg-[#142E28] text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Search safaris</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
