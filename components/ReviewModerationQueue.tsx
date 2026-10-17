'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

interface ReviewItem {
  id: string;
  reviewTitle: string;
  reviewBody: string;
  overallRating: number;
  createdAt: string;
  traveler: { firstName: string; lastName: string; email?: string; country?: string | null };
  operator: { companyName: string; slug: string };
  tour?: { title: string; slug: string } | null;
}

export default function ReviewModerationQueue() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function loadReviews() {
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  async function handleDecision(reviewId: string, status: 'APPROVED' | 'REJECTED') {
    setSubmittingId(reviewId);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      });

      if (!res.ok) {
        throw new Error('Unable to update review status');
      }

      await loadReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <section className="bg-white rounded-3xl border border-[#E5E0D8] shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E5E0D8] mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#7A6A5C] font-bold">Moderation Queue</p>
          <h2 className="text-2xl font-bold font-serif text-[#1C2826]">Traveler Review Approvals</h2>
        </div>
        <div className="rounded-full bg-[#E9C46A]/20 text-[#8B6914] px-3 py-1 text-xs font-bold">
          {reviews.length} pending
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--ink-muted)]">Loading review submissions...</p>
      ) : reviews.length === 0 ? (
        <div className="surface-card rounded-2xl border border-dashed border-black/10 p-8 text-center shadow-sm">
          <ShieldAlert className="w-8 h-8 text-[var(--brand)] mx-auto mb-3" />
          <p className="text-xs sm:text-sm font-semibold text-[var(--brand-deep)]">No traveler reviews are waiting for moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="surface-card rounded-2xl border border-black/5 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--brand-deep)] font-display text-base">{review.operator.companyName}</span>
                    <span className="text-xs text-[var(--ink-muted)]">•</span>
                    <span className="text-xs text-[var(--ink-muted)]">{review.traveler.firstName} {review.traveler.lastName}</span>
                    {review.traveler.country && (
                      <span className="text-xs text-[var(--ink-muted)]">({review.traveler.country})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-amber-500">
                    {Array.from({ length: Math.round(review.overallRating) }).map((_, index) => (
                      <span key={index} aria-label="star">★</span>
                    ))}
                    <span className="text-xs font-bold text-[var(--ink)]">{review.overallRating.toFixed(1)} / 5</span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--ink)]">{review.reviewTitle}</h3>
                  <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed">{review.reviewBody}</p>

                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                    {review.tour && <span className="rounded-full bg-[var(--sand)] px-2.5 py-1">{review.tour.title}</span>}
                    <span className="rounded-full bg-[var(--sand)] px-2.5 py-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={submittingId === review.id}
                    onClick={() => handleDecision(review.id, 'APPROVED')}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={submittingId === review.id}
                    onClick={() => handleDecision(review.id, 'REJECTED')}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
