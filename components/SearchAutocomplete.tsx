'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Compass, Building2, ChevronRight, Loader2 } from 'lucide-react';

export default function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    destinations: Array<{ id: string; name: string; slug: string; country: string; type: string }>;
    tours: Array<{ id: string; title: string; slug: string; durationDays: number; minPriceUsd: number; primaryCountry: string }>;
    operators: Array<{ id: string; companyName: string; slug: string; isVerified: boolean; averageRating: number; countryOfOrigin: string }>;
  }>({ destinations: [], tours: [], operators: [] });
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ destinations: [], tours: [], operators: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/tours?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults =
    results.destinations.length > 0 || results.tours.length > 0 || results.operators.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-black/10 shadow-xl focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition-all">
          <Search className="w-5 h-5 text-[var(--ink-muted)] ml-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder="Search parks (Serengeti, Kruger), tours, or local operators..."
            className="w-full py-3.5 sm:py-4 pl-3 pr-12 bg-transparent text-[var(--ink)] placeholder-[var(--ink-muted)] text-sm focus:outline-none rounded-2xl"
          />
          {loading && (
            <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin absolute right-4" />
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 surface-card rounded-2xl border border-black/5 shadow-2xl overflow-hidden z-50 divide-y divide-black/5 max-h-[480px] overflow-y-auto">
          {!hasResults && !loading && (
            <div className="p-6 text-center text-xs text-[var(--ink-muted)]">
              No matching parks, tours, or operators found for &ldquo;<span className="font-bold text-[var(--brand-deep)]">{query}</span>&rdquo;.
            </div>
          )}

          {/* Destinations Group */}
          {results.destinations.length > 0 && (
            <div className="p-3">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>National Parks &amp; Destinations</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.destinations.map((park) => (
                  <Link
                    key={park.id}
                    href={`/parks/${park.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-2.5 hover:bg-[var(--brand-soft)]/50 rounded-xl transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--brand-deep)] block">{park.name}</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">{park.country} • {park.type.replace('_', ' ')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--ink-muted)]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tours Group */}
          {results.tours.length > 0 && (
            <div className="p-3">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>Safari Packages</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.tours.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tours/${t.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-2.5 hover:bg-[var(--brand-soft)]/50 rounded-xl transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--brand-deep)] block">{t.title}</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">{t.durationDays} Days • {t.primaryCountry}</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-xs">From ${t.minPriceUsd}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Operators Group */}
          {results.operators.length > 0 && (
            <div className="p-3">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>Verified Tour Operators</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.operators.map((op) => (
                  <Link
                    key={op.id}
                    href={`/operators/${op.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-2.5 hover:bg-[var(--brand-soft)]/50 rounded-xl transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--brand-deep)] block">{op.companyName}</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">Based in {op.countryOfOrigin} • ★ {op.averageRating}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--ink-muted)]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
