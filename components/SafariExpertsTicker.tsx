'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Award, ChevronRight } from 'lucide-react';

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
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7D79]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#2A6B48]" />
          <span>Independent safari field authorities</span>
        </div>
      </div>

      {/* Ticker Stage with Edge Fades & Touch Support */}
      <div
        className="relative overflow-hidden py-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left & Right Gradient Mask Overlays */}
        {!prefersReduced && (
          <>
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#F7F5F0] to-transparent z-10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#F7F5F0] to-transparent z-10"
              aria-hidden="true"
            />
          </>
        )}

        {/* Ticker Track */}
        <div
          className="animate-ticker-ltr gap-4"
          style={{
            animationPlayState: isPaused || prefersReduced ? 'paused' : 'running',
          }}
        >
          {tickerItems.map((expert, idx) => (
            <article
              key={`${expert.id}-${idx}`}
              className="surface-card flex flex-col justify-between w-[280px] sm:w-[320px] md:w-[350px] h-[190px] shrink-0 p-4 rounded-xl border border-[#E2DFD4] bg-white shadow-xs"
            >
              {/* Header: Avatar, Name, Review Badge */}
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E2DFD4]">
                  <img
                    src={expert.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={expert.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#2A6B48] ring-2 ring-white" title="Verified Expert" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <Link
                      href={`/experts/${expert.slug}`}
                      className="font-semibold text-sm text-[#182624] hover:text-[#1E433B] transition-colors truncate"
                    >
                      {expert.name}
                    </Link>
                  </div>
                  <div className="text-xs text-[#6B7D79] truncate">{expert.country} specialist</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-[#C9773B]">
                    <Star className="h-3 w-3 fill-current shrink-0" />
                    <span className="tabular-nums truncate font-medium">{expert.reviewCount} verified reviews</span>
                  </div>
                </div>
              </div>

              {/* Biography / Review Snippet */}
              <p className="line-clamp-3 text-xs leading-relaxed text-[#3D4D4A] pl-2 border-l-2 border-[#1E433B]/30">
                &ldquo;{expert.biography}&rdquo;
              </p>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2DFD4]">
                <span className="text-[11px] text-[#8C9C98]">Field authority</span>
                <Link
                  href={`/experts/${expert.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1E433B] hover:underline"
                >
                  <span>Read reviews</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
