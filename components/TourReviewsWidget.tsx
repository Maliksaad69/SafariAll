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
    <div className="bg-white border border-[#e1e1e1] rounded-sm p-4 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#333] mb-3">Customer Reviews</h3>

      {loading ? (
        <div className="h-24 animate-pulse rounded-sm bg-[#f4f4f4]" />
      ) : current ? (
        <>
          <div className="flex gap-2 items-center mb-3">
            <div className="w-8 h-8 rounded-full border border-[#ddd] flex items-center justify-center bg-[#f9f9f9] text-[#8a8a8a]">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-[12px] font-bold text-[#333]">
              {current.traveler?.firstName || 'Traveler'} {current.traveler?.lastName || ''}
              {current.traveler?.country ? <span className="font-normal text-[#555]"> - {current.traveler.country}</span> : null}
            </div>
          </div>

          <div className="relative border border-[var(--gold)] p-3 text-[12px] rounded-sm bg-[#fffdf5] mb-3">
            <div className="absolute -top-[6px] left-4 w-3 h-3 bg-[#fffdf5] border-t border-l border-[var(--gold)] transform rotate-45"></div>
            <h4 className="font-bold text-[#333] text-[14px] leading-snug mb-1">&quot;{current.reviewTitle}&quot;</h4>
            <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${current.overallRating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(current.overallRating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#ddd] text-[#ddd]'}`} />
              ))}
              <span className="text-[#333] font-bold ml-1">{current.overallRating}</span>
              <span className="text-[#8a8a8a]">/5</span>
            </div>
            <p className="text-[#4a4a4a] line-clamp-4 leading-relaxed mb-1">{current.reviewBody}</p>
            <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline font-bold">Full Review</Link>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="border border-[#ccc] px-2 py-1 bg-white hover:bg-[#f4f4f4] text-[#555] rounded-sm disabled:text-[#ccc] disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] text-[#555]">{page + 1} of {pageCount}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="border border-[#ccc] px-2 py-1 bg-white hover:bg-[#f4f4f4] text-[#555] rounded-sm disabled:text-[#ccc] disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative border border-[var(--gold)] p-3 text-[12px] rounded-sm bg-[#fffdf5] mb-3">
            <div className="absolute -top-[6px] left-4 w-3 h-3 bg-[#fffdf5] border-t border-l border-[var(--gold)] transform rotate-45"></div>
            <h4 className="font-bold text-[#333] text-[14px] leading-snug mb-1">&quot;{fallbackReview.title}&quot;</h4>
            <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${fallbackReview.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < fallbackReview.rating ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#ddd] text-[#ddd]'}`} />
              ))}
              <span className="text-[#333] font-bold ml-1">{fallbackReview.rating}</span>
              <span className="text-[#8a8a8a]">/5</span>
            </div>
            <p className="text-[#4a4a4a] line-clamp-4 leading-relaxed mb-1">{fallbackReview.body}</p>
            <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline font-bold">Full Review</Link>
          </div>
          <p className="text-[11px] text-[#8a8a8a] italic">No verified traveler reviews yet for {operatorName} — be the first to <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline">write one</Link>.</p>
        </>
      )}
    </div>
  );
}
