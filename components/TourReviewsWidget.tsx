'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, Star } from 'lucide-react';

interface TourReviewsWidgetProps {
  operatorId?: string;
  operatorName: string;
}

const PAGE_SIZE = 1;

export default function TourReviewsWidget({ operatorId, operatorName }: TourReviewsWidgetProps) {
  const [reviews, setReviews] = useState<any[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!operatorId) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/reviews?operatorId=${encodeURIComponent(operatorId)}`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => {
        if (!cancelled) setReviews(Array.isArray(d.reviews) ? d.reviews : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [operatorId]);

  const loading = reviews === null;
  const list = reviews && reviews.length > 0 ? reviews : null;
  const pageCount = list ? Math.max(1, Math.ceil(list.length / PAGE_SIZE)) : 1;
  const current = list ? list[page * PAGE_SIZE] : null;

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-[var(--glass-border)] shadow-sm font-sans">
      <h3 className="text-lg font-bold font-display text-[var(--ink)] mb-3.5">Traveler Reviews</h3>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-sunk)]" />
      ) : current ? (
        <>
          <div className="flex gap-2.5 items-center mb-3">
            <div className="w-9 h-9 rounded-full border border-[var(--brand)]/20 flex items-center justify-center bg-[var(--brand-soft)] text-[var(--brand-deep)] font-extrabold text-sm">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-[var(--ink)]">
              {current.traveler?.firstName || 'Traveler'} {current.traveler?.lastName || ''}
              {current.traveler?.country ? <span className="font-normal text-[var(--ink-secondary)]"> · {current.traveler.country}</span> : null}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white/90 p-4 text-sm mb-3.5 shadow-2xs">
            <h4 className="font-bold text-[var(--ink)] text-sm sm:text-[15px] leading-snug mb-1.5">&quot;{current.reviewTitle}&quot;</h4>
            <div className="flex items-center gap-1.5 mb-2.5" aria-label={`Rated ${current.overallRating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(current.overallRating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#D5E2EC] text-[#D5E2EC]'}`} />
              ))}
              <span className="text-[var(--ink)] font-extrabold text-sm ml-1">{current.overallRating}</span>
              <span className="text-[var(--ink-secondary)] font-semibold text-xs">/ 5</span>
            </div>
            <p className="text-[var(--ink)] line-clamp-4 leading-relaxed mb-2 font-normal text-sm">{current.reviewBody}</p>
            <Link href="/reviews" className="text-[var(--brand-deep)] hover:underline font-bold text-xs inline-flex items-center gap-1">Full Review &rarr;</Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--surface-sunk)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-[var(--ink)]">{page + 1} of {pageCount}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="p-2 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--surface-sunk)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--ink-secondary)] italic">No verified traveler reviews yet for {operatorName} — be the first to <Link href="/reviews" className="text-[var(--brand-deep)] hover:underline font-bold">write one</Link>.</p>
        </>
      )}
    </div>
  );
}
