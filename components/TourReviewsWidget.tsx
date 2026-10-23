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
    <div className="surface-card rounded-2xl p-5 border border-[var(--glass-border)] shadow-sm font-sans">
      <h3 className="text-base font-bold font-display text-[var(--ink)] mb-3.5">Traveler Reviews</h3>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-sunk)]" />
      ) : current ? (
        <>
          <div className="flex gap-2.5 items-center mb-3">
            <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-[12px] font-bold text-[var(--ink)]">
              {current.traveler?.firstName || 'Traveler'} {current.traveler?.lastName || ''}
              {current.traveler?.country ? <span className="font-normal text-[var(--ink-secondary)]"> · {current.traveler.country}</span> : null}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white/80 p-3.5 text-[12px] mb-3.5 shadow-sm">
            <h4 className="font-bold text-[var(--ink)] text-[13px] leading-snug mb-1">&quot;{current.reviewTitle}&quot;</h4>
            <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${current.overallRating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(current.overallRating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#e2ddd4] text-[#e2ddd4]'}`} />
              ))}
              <span className="text-[var(--ink)] font-bold ml-1">{current.overallRating}</span>
              <span className="text-[var(--ink-muted)]">/5</span>
            </div>
            <p className="text-[var(--ink-body)] line-clamp-4 leading-relaxed mb-1.5">{current.reviewBody}</p>
            <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline font-bold text-[11px]">Full Review &rarr;</Link>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--surface-sunk)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] text-[var(--ink-secondary)]">{page + 1} of {pageCount}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--surface-sunk)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] text-[var(--ink-muted)] italic">No verified traveler reviews yet for {operatorName} — be the first to <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline">write one</Link>.</p>
        </>
      )}
    </div>
  );
}
