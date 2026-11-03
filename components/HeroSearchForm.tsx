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

  const countries = ['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Rwanda', 'Zimbabwe', 'Namibia'];

  return (
    <div className="animate-fade-up relative z-20 w-full max-w-[1020px] mx-auto md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:w-[min(94vw,1020px)] px-0 sm:px-2 md:px-0">
      <form
        onSubmit={handleSearch}
        className="glass-nav md:glass flex flex-col gap-2 rounded-2xl sm:rounded-[22px] p-2.5 sm:p-3 md:flex-row md:items-stretch shadow-2xl border border-white/60 bg-white/90 md:bg-white/70 backdrop-blur-xl"
      >
        {/* Destination */}
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/65 px-4 py-2.5 sm:py-3 transition-colors focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[var(--brand)]/30 hover:bg-white/80">
          <MapPin className="mr-3 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <label htmlFor="hero-destination" className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Where To
            </label>
            <input
              id="hero-destination"
              type="text"
              list="hero-destinations"
              placeholder="e.g. Serengeti, Masai Mara, Kenya..."
              aria-label="Destination"
              className="w-full bg-transparent text-[15px] font-bold text-[var(--ink)] outline-none placeholder:font-normal placeholder:text-[var(--ink-muted)]"
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
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/65 px-4 py-2.5 sm:py-3 transition-colors focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-[var(--brand)]/30 hover:bg-white/80">
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
              className="w-full bg-transparent text-[15px] font-bold text-[var(--ink)] outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Travelers — interactive stepper */}
        <div className="relative flex flex-1 items-center rounded-2xl bg-white/65 px-4 py-2.5 sm:py-3 transition-colors hover:bg-white/80">
          <Users className="mr-3 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Travelers</div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                type="button"
                aria-label="Remove a traveler"
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/80 text-[var(--ink)] transition hover:border-[var(--brand)] hover:bg-white hover:text-[var(--brand-ink)] active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[68px] text-center text-[15px] font-bold text-[var(--ink)]">
                {travelers} {travelers === 1 ? 'Adult' : 'Adults'}
              </span>
              <button
                type="button"
                aria-label="Add a traveler"
                onClick={() => setTravelers((t) => Math.min(15, t + 1))}
                className="flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/80 text-[var(--ink)] transition hover:border-[var(--brand)] hover:bg-white hover:text-[var(--brand-ink)] active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary h-[52px] sm:h-14 w-full rounded-2xl px-6 text-[15px] sm:text-[16px] font-bold shadow-md transition-all active:scale-[0.98] md:w-[240px] shrink-0 justify-center"
        >
          <span>Show {tourCount !== null ? tourCount.toLocaleString() : ''} Tours</span>
          <ChevronRight className="ml-1 h-5 w-5 shrink-0" />
        </button>
      </form>
    </div>
  );
}
