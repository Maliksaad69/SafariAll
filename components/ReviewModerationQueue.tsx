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
        <p className="text-sm text-gray-500">Loading review submissions...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FAF7F0] p-8 text-center">
          <ShieldAlert className="w-8 h-8 text-[#8B6914] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1C2826]">No traveler reviews are waiting for moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[#E5E0D8] bg-[#FAF7F0] p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#1C2826]">{review.operator.companyName}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{review.traveler.firstName} {review.traveler.lastName}</span>
                    {review.traveler.country && (
                      <span className="text-xs text-gray-500">({review.traveler.country})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[#D4A373]">
                    {Array.from({ length: Math.round(review.overallRating) }).map((_, index) => (
                      <span key={index} aria-label="star">★</span>
                    ))}
                    <span className="text-xs font-bold text-[#1C2826]">{review.overallRating.toFixed(1)} / 5</span>
                  </div>

                  <h3 className="text-base font-bold text-[#1C2826]">{review.reviewTitle}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{review.reviewBody}</p>

                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-500">
                    {review.tour && <span className="rounded-full bg-white px-2 py-1">{review.tour.title}</span>}
                    <span className="rounded-full bg-white px-2 py-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
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
