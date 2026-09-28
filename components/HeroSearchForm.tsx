'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Sun, Search, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [comfort, setComfort] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [tourCount, setTourCount] = useState<number | null>(null);

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
    if (destination.trim()) params.set('country', destination.trim());
    if (comfort) params.set('comfort', comfort);
    if (travelDate) {
      const date = new Date(`${travelDate}T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        params.set('startDate', travelDate);
        const month = date.toLocaleString('en-US', { month: 'long' });
        params.set('month', month);
      }
    }
    const qs = params.toString();
    router.push(qs ? `/tours?${qs}` : '/tours');
  };

  const destinationOptions = [
    { label: 'Tanzania (1,313 safaris)', val: 'Tanzania' },
    { label: 'Uganda (288 safaris)', val: 'Uganda' },
    { label: 'Kenya (282 safaris)', val: 'Kenya' },
    { label: 'Botswana (152 safaris)', val: 'Botswana' },
    { label: 'Rwanda (84 safaris)', val: 'Rwanda' },
    { label: 'South Africa (14 safaris)', val: 'South Africa' },
    { label: 'Zimbabwe (44 safaris)', val: 'Zimbabwe' },
    { label: 'Zambia (44 safaris)', val: 'Zambia' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 z-20 w-[min(94vw,1040px)] -translate-x-1/2 md:bottom-10">
      <div className="rounded-2xl border border-amber-900/20 bg-white/95 backdrop-blur-md p-3 md:p-4 shadow-[0_24px_48px_rgba(28,25,23,0.28)]">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. Destination Select */}
          <div className="md:col-span-4 relative flex items-center rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:border-[var(--gold)]">
            <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-soft)] text-[var(--gold-ink)] font-bold">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="home-destination-select" className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Select Destination
              </label>
              <select
                id="home-destination-select"
                aria-label="Select destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent text-[13.5px] font-bold text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="">Any Destination (All Africa)</option>
                {destinationOptions.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Comfort Level */}
          <div className="md:col-span-3 relative flex items-center rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:border-[var(--gold)]">
            <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-soft)] text-[var(--gold-ink)] font-bold">
              <Sun className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="home-comfort-select" className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Select Comfort
              </label>
              <select
                id="home-comfort-select"
                aria-label="Select comfort level"
                value={comfort}
                onChange={(e) => setComfort(e.target.value)}
                className="w-full bg-transparent text-[13.5px] font-bold text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="">Select Comfort</option>
                <option value="BUDGET">Budget Tour</option>
                <option value="MID_RANGE">Mid-Range Tour</option>
                <option value="LUXURY">Luxury Tour</option>
                <option value="LUXURY_PLUS">Ultra Luxury Tour</option>
              </select>
            </div>
          </div>

          {/* 3. Travel Date */}
          <div className="md:col-span-3 relative flex items-center rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:border-[var(--gold)]">
            <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-soft)] text-[var(--gold-ink)] font-bold">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="home-travel-date" className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Travel Date
              </label>
              <input
                id="home-travel-date"
                type="date"
                aria-label="Travel Date"
                min={new Date().toISOString().split('T')[0]}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-transparent text-[13.5px] font-bold text-[var(--ink)] outline-none"
              />
            </div>
          </div>

          {/* 4. SEARCH Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[var(--gold)] px-4 text-[15px] font-extrabold tracking-wide text-white shadow-lg shadow-amber-900/20 transition-all hover:bg-[var(--gold-hover)] hover:shadow-xl cursor-pointer"
            >
              SEARCH
              <ChevronRight className="ml-1 h-4 w-4 shrink-0" strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
