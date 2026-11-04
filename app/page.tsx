import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import HeroSearchForm from '@/components/HeroSearchForm';
import HeroBackgroundSlider from '@/components/HeroBackgroundSlider';
import FeaturedCountriesSection, { CountryHighlight } from '@/components/FeaturedCountriesSection';
import prisma from '@/lib/prisma';
import { getTourCards, getOperatorCards, getCountries, getExperts, getLatestBlogPosts } from '@/lib/catalog';
import { CheckCircle2, ChevronRight, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getRealStats() {
  const [tourCount, operatorCount, reviewAgg, destinationCount] = await Promise.all([
    prisma.tour.count({ where: { isPublished: true } }),
    prisma.operator.count({ where: { isVerified: true } }),
    prisma.review.aggregate({ where: { status: 'APPROVED' }, _avg: { overallRating: true }, _count: { id: true } }),
    prisma.destination.count(),
  ]);
  return {
    tours: tourCount,
    operators: operatorCount,
    reviews: reviewAgg._count.id,
    rating: reviewAgg._avg.overallRating ? Math.round(reviewAgg._avg.overallRating * 10) / 10 : 0,
    destinations: destinationCount,
  };
}

export default async function HomePage() {
  const [stats, tours, operatorCards, countries, blogPosts, safariExperts] = await Promise.all([
    getRealStats(),
    getTourCards({}, 3),
    getOperatorCards(),
    getCountries(),
    getLatestBlogPosts(3),
    getExperts(),
  ]);

  const operators = operatorCards.slice(0, 4).map((op) => ({
    name: op.companyName,
    slug: op.slug,
    rating: op.averageRating,
    reviews: `${op.totalReviews.toLocaleString()} Reviews`,
    image: op.image,
  }));

  const countryHighlights: CountryHighlight[] = countries
    .filter((c) => c.popularityRank)
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      rank: `#${c.popularityRank}`,
      featuredImageUrl: c.featuredImageUrl,
      rating: c.rating,
      reviewCount: c.reviewCount,
      description: c.description,
      dailyRates: c.dailyRates,
      bestTimeSummary: c.bestTimeSummary,
    }));

  return (
    <div className="min-h-screen font-sans text-[var(--ink-body)] overflow-x-hidden">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <HeroBackgroundSlider
          tourCount={stats.tours}
          minHeightClass="min-h-[460px] sm:min-h-[450px] md:h-[460px] lg:h-[480px]"
        >
          {/* Search Form — anchored at bottom on desktop, stacked on mobile */}
          <HeroSearchForm />
        </HeroBackgroundSlider>

        {/* ── Trust strip ── */}
        <div className="relative z-10 mx-auto mt-4 sm:mt-5 max-w-[1230px] px-3 sm:px-4">
          <div className="glass grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-x-4 rounded-2xl px-3 sm:px-6 py-3.5 sm:py-4 text-[12px] sm:text-[13px] font-semibold text-[var(--ink-body)] md:grid-cols-4">
            <span className="flex items-center gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
              <span className="leading-tight"><strong className="text-[var(--ink)]">{stats.operators}</strong> Verified Operators</span>
            </span>
            <span className="flex items-center gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
              <span className="leading-tight"><strong className="text-[var(--ink)]">Best Price</strong> Guarantee</span>
            </span>
            <span className="flex items-center gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
              <span className="leading-tight"><strong className="text-[var(--ink)]">{stats.reviews}</strong> Traveler Reviews</span>
            </span>
            <span className="flex items-center gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
              <span className="leading-tight"><strong className="text-[var(--ink)]">{stats.destinations}</strong> Parks &amp; Reserves</span>
            </span>
          </div>
        </div>

        {/* ── Top-rated Safari Countries ── */}
        <section className="pt-16 sm:pt-24 pb-14 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="section-rule" />
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--ink)]">
                  Top-rated Safari Countries
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Explore Africa&apos;s leading safari destinations and verified packages
                </p>
              </div>
              <Link href="/parks" className="link hidden sm:inline-flex items-center gap-1 text-sm font-semibold">
                All {countries.length} countries <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <FeaturedCountriesSection countries={countryHighlights} />
          </div>
        </section>

        {/* ── Popular tours ── */}
        <section className="pb-14 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--ink)]">
                  Popular Safari Tours
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Handpicked authentic itineraries by local safari operators
                </p>
              </div>
              <Link href="/tours" className="link inline-flex items-center gap-1 text-sm font-semibold">
                View all {stats.tours.toLocaleString()} tours <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Operators ── */}
        <section className="pb-14 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--ink)]">
                  Top Rated Tour Operators
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Licensed local agencies with verified track records
                </p>
              </div>
              <Link href="/operators" className="link inline-flex items-center gap-1 text-sm font-semibold">
                Browse all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {operators.map((op) => (
                <Link
                  key={op.slug}
                  href={`/operators/${op.slug}`}
                  className="surface-card surface-card-hover block overflow-hidden rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md"
                >
                  <div className="relative h-28 sm:h-32 bg-[var(--dark)]">
                    <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url('${op.image}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                      <h3 className="text-[14px] sm:text-[17px] font-semibold text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)] truncate">
                        {op.name}
                      </h3>
                    </div>
                    <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[var(--brand-ink)] backdrop-blur-md shadow-2xs">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-3 sm:p-4 text-center">
                    <div className="mb-1 flex text-[12px] sm:text-[13px] text-[var(--gold)]" aria-hidden="true">
                      {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate w-full">
                      {op.reviews}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog ── */}
        <section className="pb-14 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--ink)]">
                  Latest from the Blog
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Insider safari guides, wildlife advice &amp; trip inspiration
                </p>
              </div>
              <Link href="/blogs" className="link inline-flex items-center gap-1 text-sm font-semibold">
                All articles <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {blogPosts.map((post) => (
                <Link
                  href={`/blogs/${post.slug}`}
                  key={post.slug}
                  className="surface-card surface-card-hover group relative block h-[190px] sm:h-[210px] overflow-hidden rounded-2xl shadow-xs"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${post.coverImageUrl ?? ''}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="text-[16px] sm:text-[18px] font-semibold leading-snug text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experts ── */}
        <section className="pb-20">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-6">
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--ink)]">
                SafariRequest Experts
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[var(--ink-secondary)]">
                Independent travel writers and industry experts review destinations and operators across the continent, so you can book with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {safariExperts.map((expert) => (
                <div key={expert.id} className="surface-card surface-card-hover flex gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl shadow-xs">
                  <div className="h-[56px] w-[56px] sm:h-[64px] sm:w-[64px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/70 shadow-2xs">
                    <img src={expert.imageUrl ?? ''} alt={expert.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/experts/${expert.slug}`} className="link text-[15px] font-bold line-clamp-1">
                      {expert.name}
                    </Link>
                    <div className="text-xs text-[var(--ink-secondary)]">{expert.country}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-[var(--gold)]">
                      ★ {expert.reviewCount} expert reviews
                    </div>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[var(--ink-body)]">
                      {expert.biography}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
