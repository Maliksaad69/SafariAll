'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, ChevronRight, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [tourCount, setTourCount] = useState<number | null>(null);

  // Fetch the real number of published tours so the CTA is never a fake number
  useEffect(() => {
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
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('search', destination.trim());
    if (startDate) {
      const date = new Date(`${startDate}T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        params.set('startDate', startDate);
        const month = date.toLocaleString('en-US', { month: 'long' });
        params.set('month', month);
      }
    }
    if (travelers !== 2) params.set('travelers', String(travelers));
    const qs = params.toString();
    router.push(qs ? `/tours?${qs}` : '/tours');
  };

  const countries = ['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Rwanda', 'Zimbabwe'];

  return (
    <div className="absolute bottom-8 left-1/2 z-20 w-[min(94vw,980px)] -translate-x-1/2 md:bottom-12">
      <form
        onSubmit={handleSearch}
        className="flex flex-col overflow-hidden rounded-md shadow-[0_15px_30px_rgba(0,0,0,0.3)] md:flex-row md:items-stretch"
      >
        {/* Destination */}
        <div className="relative flex flex-1 items-center border-b border-[#e5e5e5] bg-white px-4 py-3 md:border-b-0 md:border-r">
          <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#8a8a8a]" />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              list="hero-destinations"
              placeholder="Where To..."
              aria-label="Destination"
              className="w-full bg-transparent text-[15px] font-bold text-[#333] outline-none placeholder:font-normal placeholder:text-[#8a8a8a]"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <datalist id="hero-destinations">
              {countries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Start date — real date input */}
        <div className="relative flex flex-1 items-center border-b border-[#e5e5e5] bg-white px-4 py-3 md:border-b-0 md:border-r">
          <Calendar className="mr-3 h-5 w-5 shrink-0 text-[#8a8a8a]" />
          <div className="flex-1 min-w-0">
            <label htmlFor="hero-start-date" className="block text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">
              Start Date
            </label>
            <input
              id="hero-start-date"
              type="date"
              aria-label="Start date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-transparent text-[15px] font-bold text-[#333] outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Travelers — interactive stepper */}
        <div className="relative flex flex-1 items-center bg-white px-4 py-3">
          <Users className="mr-3 h-5 w-5 shrink-0 text-[#8a8a8a]" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">Travelers</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Remove a traveler"
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d5d5d5] text-[#555] transition hover:border-[#999] hover:text-[#222]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[64px] text-center text-[15px] font-bold text-[#333]">
                {travelers} {travelers === 1 ? 'Adult' : 'Adults'}
              </span>
              <button
                type="button"
                aria-label="Add a traveler"
                onClick={() => setTravelers((t) => Math.min(15, t + 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d5d5d5] text-[#555] transition hover:border-[#999] hover:text-[#222]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex h-14 w-full items-center justify-center bg-[#f09b1f] px-4 text-[16px] font-bold text-white transition-colors hover:bg-[#e08b15] md:w-[240px]"
        >
          Show {tourCount !== null ? tourCount.toLocaleString() : ''} Tours{' '}
          <ChevronRight className="ml-1 h-5 w-5 shrink-0" />
        </button>
      </form>
    </div>
  );
}
