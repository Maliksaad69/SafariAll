'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, Star } from 'lucide-react';

interface TourReviewsWidgetProps {
  operatorId?: string;
  operatorName: string;
  fallbackReview: {
    title: string;
    body: string;
    rating: number;
  };
}

const PAGE_SIZE = 1;

export default function TourReviewsWidget({ operatorId, operatorName, fallbackReview }: TourReviewsWidgetProps) {
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
    <div className="surface-card p-4">
      <h3 className="text-[15px] font-bold text-[var(--ink)] mb-3">Customer Reviews</h3>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-raised)]" />
      ) : current ? (
        <>
          <div className="flex gap-2 items-center mb-3">
            <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--surface-raised)] text-[var(--ink-muted)]">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-[12px] font-bold text-[var(--ink)]">
              {current.traveler?.firstName || 'Traveler'} {current.traveler?.lastName || ''}
              {current.traveler?.country ? <span className="font-normal text-[var(--ink-secondary)]"> - {current.traveler.country}</span> : null}
            </div>
          </div>

          <div className="relative border border-[var(--gold-soft)] p-3 text-[12px] rounded-xl bg-[var(--gold-soft)] mb-3">
            <div className="absolute -top-[6px] left-4 w-3 h-3 bg-[var(--gold-soft)] border-t border-l border-[var(--gold)]/30 transform rotate-45"></div>
            <h4 className="font-bold text-[var(--ink)] text-[14px] leading-snug mb-1">&quot;{current.reviewTitle}&quot;</h4>
            <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${current.overallRating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(current.overallRating) ? 'fill-[var(--dark-gold)] text-[var(--dark-gold)]' : 'fill-[var(--border-strong)] text-[var(--border-strong)]'}`} />
              ))}
              <span className="text-[var(--ink)] font-bold ml-1">{current.overallRating}</span>
              <span className="text-[var(--ink-muted)]">/5</span>
            </div>
            <p className="text-[var(--ink-secondary)] line-clamp-4 leading-relaxed mb-1">{current.reviewBody}</p>
            <Link href="/reviews" className="link font-bold">Full Review</Link>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] text-[var(--ink-secondary)]">{page + 1} of {pageCount}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="btn btn-secondary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative border border-[var(--gold)]/20 p-3 text-[12px] rounded-xl bg-[var(--gold-soft)] mb-3">
            <div className="absolute -top-[6px] left-4 w-3 h-3 bg-[var(--gold-soft)] border-t border-l border-[var(--gold)]/20 transform rotate-45"></div>
            <h4 className="font-bold text-[var(--ink)] text-[14px] leading-snug mb-1">&quot;{fallbackReview.title}&quot;</h4>
            <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${fallbackReview.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < fallbackReview.rating ? 'fill-[var(--dark-gold)] text-[var(--dark-gold)]' : 'fill-[var(--border-strong)] text-[var(--border-strong)]'}`} />
              ))}
              <span className="text-[var(--ink)] font-bold ml-1">{fallbackReview.rating}</span>
              <span className="text-[var(--ink-muted)]">/5</span>
            </div>
            <p className="text-[var(--ink-secondary)] line-clamp-4 leading-relaxed mb-1">{fallbackReview.body}</p>
            <Link href="/reviews" className="link font-bold">Full Review</Link>
          </div>
          <p className="text-[11px] text-[var(--ink-muted)] italic">No verified traveler reviews yet for {operatorName} — be the first to <Link href="/reviews" className="link">write one</Link>.</p>
        </>
      )}
    </div>
  );
}
