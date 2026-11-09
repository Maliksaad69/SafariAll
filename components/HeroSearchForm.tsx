'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SAFARI_COUNTRIES } from '@/lib/countries';

export default function HeroSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
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
    const qs = params.toString();
    router.push(qs ? `/african-safari-tours?${qs}` : '/african-safari-tours');
  };

  const countries = SAFARI_COUNTRIES;

  return (
    <div className="animate-fade-up relative z-20 w-full max-w-[680px] mx-auto md:absolute md:bottom-8 lg:bottom-12 md:left-1/2 md:-translate-x-1/2 md:w-[min(90vw,680px)] px-2 sm:px-2 md:px-0 mt-3 sm:mt-4 md:mt-0">
      <form
        onSubmit={handleSearch}
        className="glass flex flex-col gap-1.5 sm:gap-2 rounded-2xl md:rounded-full p-1.5 sm:p-2 md:flex-row md:items-center shadow-2xl border border-white/70 bg-white/92 md:bg-white/80 backdrop-blur-xl"
      >
        {/* Destination */}
        <div className="relative flex flex-1 items-center rounded-xl md:rounded-full bg-white/70 px-3 sm:px-3.5 py-1.5 sm:py-2 transition-colors focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[var(--brand)]/30 hover:bg-white/85">
          <MapPin className="mr-2 sm:mr-2.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <label htmlFor="hero-destination" className="block text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Where To
            </label>
            <input
              id="hero-destination"
              type="text"
              list="hero-destinations"
              placeholder="e.g. Serengeti, Masai Mara..."
              aria-label="Destination"
              className="w-full bg-transparent text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] outline-none placeholder:font-normal placeholder:text-[var(--ink-muted)]"
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

        {/* Subtle desktop divider */}
        <div className="hidden md:block h-7 w-px bg-[var(--border)] shrink-0 self-center" aria-hidden="true" />

        {/* Start date */}
        <div className="relative flex flex-1 items-center rounded-xl md:rounded-full bg-white/70 px-3 sm:px-3.5 py-1.5 sm:py-2 transition-colors focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[var(--brand)]/30 hover:bg-white/85">
          <Calendar className="mr-2 sm:mr-2.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <label htmlFor="hero-start-date" className="block text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Start Date
            </label>
            <input
              id="hero-start-date"
              type="date"
              aria-label="Start date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-transparent text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary h-11 sm:h-[46px] w-full md:w-auto md:min-w-[150px] rounded-xl md:rounded-full px-5 text-[13.5px] sm:text-[14px] font-bold shadow-md transition-all active:scale-[0.98] shrink-0 justify-center gap-1.5"
        >
          <span>Show {tourCount !== null ? tourCount.toLocaleString() : ''} Tours</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </form>
    </div>
  );
}
