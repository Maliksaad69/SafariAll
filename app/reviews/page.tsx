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
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-500 text-amber-500' : 'fill-black/10 text-black/15'}`} />
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
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Traveler Reviews</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>Verified Safari Reviews</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-4">
            What travelers say about their safari adventures
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--ink-muted)] mb-10">
            Read transparent reviews from travelers who booked African safaris through our verified operator network.
          </p>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            {/* Summary panel */}
            <aside>
              <div className="rounded-2xl border border-black/5 bg-[var(--sand)]/60 p-6 text-center shadow-sm">
                <div className="text-5xl font-bold font-display text-[var(--brand-deep)] leading-none">
                  {average.toFixed(1)}
                </div>
                <div className="mt-3 flex justify-center">
                  <Stars rating={Math.round(average)} />
                </div>
                <div className="mt-1.5 text-xs text-[var(--ink-muted)]">
                  {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
                </div>

                <div className="mt-6 space-y-2 border-t border-black/5 pt-5">
                  {distribution.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-right font-semibold text-[var(--ink)]">{star}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="w-5 text-left text-[var(--ink-muted)]">{count}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/login"
                  className="btn btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm"
                >
                  <PenLine className="h-4 w-4" />
                  <span>Write a Review</span>
                </Link>
              </div>
            </aside>

            {/* Review cards */}
            <div>
              {usingFallback && (
                <p className="mb-6 rounded-2xl border border-[var(--brand-pale)] bg-[var(--brand-soft)]/50 px-4 py-3 text-xs text-[var(--brand-deep)]">
                  Showing sample reviews. Recent verified traveler reviews will appear here as they are submitted and approved.
                </p>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="surface-card rounded-2xl border border-black/5 p-6 shadow-sm hover:border-[var(--brand)]/30 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[var(--ink)] truncate">
                          {review.name ?? [review.traveler?.firstName, review.traveler?.lastName].filter(Boolean).join(' ') ?? 'Traveler'}
                        </div>
                        <div className="text-xs text-[var(--ink-muted)]">
                          {review.origin ?? review.traveler?.country ?? 'Safari traveler'}
                        </div>
                      </div>
                      <Stars rating={Math.round(review.rating ?? review.overallRating ?? 0)} />
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{review.title ?? review.reviewTitle}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink)]/80">
                      {review.text ?? review.reviewBody}
                    </p>
                    {review.operator?.companyName && (
                      <div className="mt-4 pt-3 border-t border-black/5">
                        <Link
                          href={`/operators/${review.operator.slug}`}
                          className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Operator: {review.operator.companyName}</span>
                        </Link>
                      </div>
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
