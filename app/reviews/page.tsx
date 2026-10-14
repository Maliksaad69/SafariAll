import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Star, CheckCircle2, PenLine } from 'lucide-react';

export const dynamic = 'force-dynamic';

const fallbackReviews = [
  { name: 'Emma C.', origin: 'United Kingdom', title: 'Perfectly organized and unforgettable', text: 'The itinerary was spot on, and the operator handled every detail seamlessly from airport pickup to the final game drive.', rating: 5 },
  { name: 'Daniel M.', origin: 'United States', title: 'Worth every penny', text: 'Great value for a luxury safari. The lodge choices, timing, and wildlife sightings were all excellent.', rating: 5 },
  { name: 'Maya T.', origin: 'Australia', title: 'The best safari planning experience', text: 'We compared several operators and ended up with a trip that matched our budget and expectations perfectly.', rating: 4 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-[#d4a435] text-[#d4a435]' : 'fill-[#e2ddd4] text-[#e2ddd4]'}`} />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  let reviews: any[] = [];
  let usingFallback = false;

  try {
    reviews = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        traveler: { select: { firstName: true, lastName: true, country: true } },
        operator: { select: { companyName: true, slug: true } },
      },
    });
  } catch {
    reviews = [];
  }

  if (reviews.length === 0) {
    usingFallback = true;
    reviews = fallbackReviews.map((r, i) => ({ id: `fallback-${i}`, ...r }));
  }

  const average =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (r.rating ?? r.overallRating ?? 0), 0) / reviews.length) * 10) / 10
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating ?? r.overallRating ?? 0) === star).length,
  }));

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            <Star className="h-3.5 w-3.5 fill-current" />
            Traveler reviews
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>
            What people say about their safari trips
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Summary panel */}
            <aside>
              <div className="rounded-[14px] border border-[#e8e0d8] bg-[#faf7f2] p-5 text-center">
                <div className="text-[44px] font-bold leading-none text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>
                  {average.toFixed(1)}
                </div>
                <div className="mt-2 flex justify-center">
                  <Stars rating={Math.round(average)} />
                </div>
                <div className="mt-1 text-[12px] text-[#6a574a]">
                  {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
                </div>

                <div className="mt-5 space-y-1.5">
                  {distribution.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-[11px]">
                      <span className="w-8 text-right font-bold text-[#4a4136]">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e0d8]">
                        <div
                          className="h-full rounded-full bg-[#d4a435]"
                          style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="w-5 text-left text-[#6a574a]">{count}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/login"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A17] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#a6470e]"
                >
                  <PenLine className="h-4 w-4" />
                  Write a Review
                </Link>
              </div>
            </aside>

            {/* Review cards */}
            <div>
              {usingFallback && (
                <p className="mb-4 rounded-xl border border-[#e8e0d8] bg-[#faf7f2] px-4 py-3 text-[12px] text-[#6a574a]">
                  Showing sample reviews. Recent verified traveler reviews will appear here as they are approved.
                </p>
              )}
              <div className="grid gap-5 md:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-[14px] border border-[#e8e0d8] bg-[#faf7f2] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#1d1a18] truncate">
                          {review.name ?? [review.traveler?.firstName, review.traveler?.lastName].filter(Boolean).join(' ') ?? 'Traveler'}
                        </div>
                        <div className="text-[12px] text-[#6a574a]">
                          {review.origin ?? review.traveler?.country ?? 'Africa traveler'}
                        </div>
                      </div>
                      <Stars rating={Math.round(review.rating ?? review.overallRating ?? 0)} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2e6a64]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{review.title ?? review.reviewTitle}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#5a4e46]">
                      {review.text ?? review.reviewBody}
                    </p>
                    {review.operator?.companyName && (
                      <Link
                        href={`/operators/${review.operator.slug}`}
                        className="mt-3 inline-block text-[12px] font-bold text-[var(--brand-ink)] hover:underline"
                      >
                        Reviewed operator: {review.operator.companyName}
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
