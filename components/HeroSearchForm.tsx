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
    <div className="animate-fade-up absolute bottom-8 left-1/2 z-20 w-[min(94vw,1000px)] -translate-x-1/2 md:bottom-12">
      <form
        onSubmit={handleSearch}
        className="glass flex flex-col gap-1.5 rounded-[22px] p-2 md:flex-row md:items-stretch"
      >
        {/* Destination */}
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/55 px-4 py-2.5 transition-colors focus-within:bg-white/80 hover:bg-white/70">
          <MapPin className="mr-3 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              list="hero-destinations"
              placeholder="Where To..."
              aria-label="Destination"
              className="w-full bg-transparent text-[15px] font-bold text-[var(--ink)] outline-none placeholder:font-medium placeholder:text-[var(--ink-muted)]"
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
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/55 px-4 py-2.5 transition-colors focus-within:bg-white/80 hover:bg-white/70">
          <Calendar className="mr-3 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <label htmlFor="hero-start-date" className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Start Date
            </label>
            <input
              id="hero-start-date"
              type="date"
              aria-label="Start date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-transparent text-[15px] font-bold text-[var(--ink)] outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Travelers — interactive stepper */}
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/55 px-4 py-2.5 transition-colors hover:bg-white/70">
          <Users className="mr-3 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Travelers</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Remove a traveler"
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--ink-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[64px] text-center text-[15px] font-bold text-[var(--ink)]">
                {travelers} {travelers === 1 ? 'Adult' : 'Adults'}
              </span>
              <button
                type="button"
                aria-label="Add a traveler"
                onClick={() => setTravelers((t) => Math.min(15, t + 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--ink-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary h-14 w-full rounded-2xl px-5 text-[16px] md:w-[240px]"
        >
          Show {tourCount !== null ? tourCount.toLocaleString() : ''} Tours{' '}
          <ChevronRight className="ml-1 h-5 w-5 shrink-0" />
        </button>
      </form>
    </div>
  );
}
