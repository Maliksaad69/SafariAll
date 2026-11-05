'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Star, Award, ChevronRight } from 'lucide-react';

export interface SafariExpert {
  id: string;
  name: string;
  slug: string;
  country: string;
  reviewCount: number;
  biography: string;
  imageUrl?: string | null;
}

interface SafariExpertsTickerProps {
  experts: SafariExpert[];
}

export default function SafariExpertsTicker({ experts }: SafariExpertsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Sync with OS reduced-motion accessibility preference (accessible-animation skill)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!experts || experts.length === 0) return null;

  // Duplicate the list 3x to ensure continuous seamless loop across wide displays
  const tickerItems = [...experts, ...experts, ...experts];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Top Controls Bar for Accessibility (WCAG 2.2.2 Pause/Stop/Hide) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-secondary)]">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11.5px] sm:text-xs">Live Field Reports · Left-to-Right</span>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Resume ticker movement' : 'Pause ticker movement'}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-white/80 text-[var(--ink)] text-xs font-bold hover:bg-white hover:border-[var(--brand)] transition-colors shadow-2xs cursor-pointer active:scale-95"
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Resume Motion</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Pause Motion</span>
            </>
          )}
        </button>
      </div>

      {/* Ticker Stage with Edge Fades & Touch Support */}
      <div
        className="relative overflow-hidden py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left & Right Gradient Mask Overlays */}
        {!prefersReduced && (
          <>
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#F7F6F1] to-transparent z-10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#F7F6F1] to-transparent z-10"
              aria-hidden="true"
            />
          </>
        )}

        {/* Ticker Track: scrolls from Left to Right */}
        <div
          className="animate-ticker-ltr gap-3.5 sm:gap-5"
          style={{
            animationPlayState: isPaused || prefersReduced ? 'paused' : 'running',
          }}
        >
          {tickerItems.map((expert, idx) => (
            <article
              key={`${expert.id}-${idx}`}
              className="surface-card surface-card-hover group flex flex-col justify-between w-[275px] sm:w-[330px] md:w-[360px] h-[190px] sm:h-[200px] shrink-0 p-3.5 sm:p-5 rounded-2xl border border-[var(--glass-border)] shadow-xs hover:shadow-md transition-all bg-white/90 backdrop-blur-md active:scale-[0.99]"
            >
              {/* Header: Avatar, Name, Review Badge */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--brand)]/30 shadow-2xs">
                  <img
                    src={expert.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={expert.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" title="Verified Expert" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <Link
                      href={`/experts/${expert.slug}`}
                      className="font-bold text-[14px] sm:text-[14.5px] text-[var(--ink)] group-hover:text-[var(--brand-ink)] transition-colors truncate"
                    >
                      {expert.name}
                    </Link>
                  </div>
                  <div className="text-[11px] sm:text-[11.5px] font-semibold text-[var(--ink-secondary)] truncate">{expert.country} Specialist</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10.5px] sm:text-[11px] font-extrabold text-[var(--gold)]">
                    <Star className="h-3 w-3 fill-current shrink-0" />
                    <span className="truncate">{expert.reviewCount} Verified Expert Reviews</span>
                  </div>
                </div>
              </div>

              {/* Biography / Review Snippet */}
              <p className="line-clamp-3 text-[12px] sm:text-[12.5px] leading-relaxed text-[var(--ink-body)] italic opacity-90 pl-1 border-l-2 border-[var(--brand)]/40">
                &ldquo;{expert.biography}&rdquo;
              </p>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-soft)]">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--ink-muted)]">Independent Field Authority</span>
                <Link
                  href={`/experts/${expert.slug}`}
                  className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-bold text-[var(--brand-ink)] group-hover:underline"
                >
                  <span>Read Reviews</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
