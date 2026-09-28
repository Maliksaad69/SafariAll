'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Compass, Building2, ChevronRight, Loader2, X } from 'lucide-react';

interface NavbarSearchProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

interface SearchResults {
  destinations: Array<{ id: string; name: string; slug: string; country: string; type: string }>;
  tours: Array<{ id: string; title: string; slug: string; durationDays: number; minPriceUsd: number; primaryCountry: string }>;
  operators: Array<{ id: string; companyName: string; slug: string; isVerified: boolean; averageRating: number; countryOfOrigin: string }>;
}

const EMPTY: SearchResults = { destinations: [], tours: [], operators: [] };

export default function NavbarSearch({ mobile = false, onNavigate }: NavbarSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Live search with debounce — hits the real /api/search endpoint
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults({
          destinations: Array.isArray(data.destinations) ? data.destinations : [],
          tours: Array.isArray(data.tours) ? data.tours : [],
          operators: Array.isArray(data.operators) ? data.operators : [],
        });
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.destinations.length > 0 || results.tours.length > 0 || results.operators.length > 0;

  const closeAndGo = (href: string) => {
    setOpen(false);
    setQuery('');
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) closeAndGo(`/tours?search=${encodeURIComponent(q)}`);
  };

  if (mobile) {
    return (
      <form onSubmit={submit} className="px-2 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            placeholder="Search tours, parks, agencies..."
            aria-label="Search"
            className="w-full rounded-lg border border-white/15 bg-white/10 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-white/60 focus:border-[var(--dark-gold)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(''); setResults(EMPTY); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile results panel */}
        {query.trim().length >= 2 && (
          <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <SearchResultsPanel
              loading={loading}
              hasResults={hasResults}
              results={results}
              query={query}
              onResultClick={closeAndGo}
            />
          </div>
        )}
      </form>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-1.5 hover:text-white"
        aria-label="Search safaris"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        Search
        <Search className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Search safaris"
          className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,420px)]"
        >
          {/* Arrow */}
          <div className="ml-auto mr-6 h-3 w-3 rotate-45 border-l border-t border-[var(--border)] bg-white" />

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_16px_40px_rgba(28,17,8,0.22)]">
            {/* Input */}
            <form onSubmit={submit} className="border-b border-[var(--border-soft)] p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tours, parks, agencies..."
                  aria-label="Search tours, parks and agencies"
                  autoFocus
                  className="form-control pl-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => { setQuery(''); setResults(EMPTY); inputRef.current?.focus(); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Live results */}
            <div className="max-h-[380px] overflow-y-auto">
              <SearchResultsPanel
                loading={loading}
                hasResults={hasResults}
                results={results}
                query={query}
                onResultClick={closeAndGo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultsPanel({
  loading,
  hasResults,
  results,
  query,
  onResultClick,
}: {
  loading: boolean;
  hasResults: boolean;
  results: SearchResults;
  query: string;
  onResultClick: (href: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-[var(--ink-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
        Searching...
      </div>
    );
  }

  if (query.trim().length < 2) {
    return (
      <div className="px-4 py-6 text-center text-xs text-[var(--ink-secondary)]">
        Type at least 2 characters to search tours, parks and agencies.
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="px-4 py-6 text-center text-xs text-[var(--ink-secondary)]">
        No results for <span className="font-bold text-[var(--ink)]">&ldquo;{query.trim()}&rdquo;</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border-soft)]">
      {results.tours.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            <Compass className="h-3.5 w-3.5 text-[var(--brand)]" /> Safari Tours
          </div>
          {results.tours.map((t) => (
            <Link
              key={t.id}
              href={`/tours/${t.slug}`}
              onClick={() => onResultClick(`/tours/${t.slug}`)}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--surface-raised)]"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-[var(--ink)]">{t.title}</div>
                <div className="text-[11px] text-[var(--ink-secondary)]">{t.durationDays} days · {t.primaryCountry}</div>
              </div>
              <span className="shrink-0 text-xs font-bold text-[var(--success)]">${t.minPriceUsd.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      )}

      {results.destinations.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            <MapPin className="h-3.5 w-3.5 text-[var(--info)]" /> Parks &amp; Destinations
          </div>
          {results.destinations.map((d) => (
            <Link
              key={d.id}
              href={`/parks/${d.slug}`}
              onClick={() => onResultClick(`/parks/${d.slug}`)}
              className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-[var(--surface-raised)]"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-[var(--ink)]">{d.name}</div>
                <div className="text-[11px] text-[var(--ink-secondary)]">{d.country} · {d.type.replace(/_/g, ' ').toLowerCase()}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
            </Link>
          ))}
        </div>
      )}

      {results.operators.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            <Building2 className="h-3.5 w-3.5 text-[var(--gold)]" /> Tour Agencies
          </div>
          {results.operators.map((op) => (
            <Link
              key={op.id}
              href={`/operators/${op.slug}`}
              onClick={() => onResultClick(`/operators/${op.slug}`)}
              className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-[var(--surface-raised)]"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-[var(--ink)]">{op.companyName}</div>
                <div className="text-[11px] text-[var(--ink-secondary)]">★ {op.averageRating} · {op.countryOfOrigin}</div>
              </div>
              {op.isVerified && <span className="badge badge-success shrink-0">Verified</span>}
            </Link>
          ))}
        </div>
      )}

      {/* See-all footer */}
      <button
        type="button"
        onClick={() => onResultClick(`/tours?search=${encodeURIComponent(query.trim())}`)}
        className="w-full bg-[var(--surface-raised)] px-4 py-3 text-center text-xs font-bold text-[var(--brand)] transition-colors hover:bg-[var(--surface-sunk)]"
      >
        See all results for &ldquo;{query.trim()}&rdquo;
      </button>
    </div>
  );
}
