import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import HeroSearchForm from '@/components/HeroSearchForm';
import HeroBackgroundSlider from '@/components/HeroBackgroundSlider';
import FeaturedCountriesSection, { CountryHighlight } from '@/components/FeaturedCountriesSection';
import TopRatedOperatorsBanner from '@/components/TopRatedOperatorsBanner';
import SafariExpertsTicker from '@/components/SafariExpertsTicker';
import prisma from '@/lib/prisma';
import { getTourCards, getOperatorCards, getCountries, getExperts, getLatestBlogPosts } from '@/lib/catalog';
import { CheckCircle2, ChevronRight, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getRealStats() {
  try {
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
  } catch (err) {
    console.warn('[HomePage] Database query failed in getRealStats, using offline fallback stats:', (err as Error)?.message);
    return {
      tours: 14,
      operators: 6,
      reviews: 770,
      rating: 4.9,
      destinations: 48,
    };
  }
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
    .sort((a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99))
    .slice(0, 9)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      rank: `#${c.popularityRank}`,
      popularityRank: c.popularityRank,
      featuredImageUrl: c.featuredImageUrl,
      rating: c.rating,
      reviewCount: c.reviewCount,
      description: c.description,
      dailyRates: c.dailyRates,
      bestTimeSummary: c.bestTimeSummary,
      highSeason: c.highSeason,
      toursCount: c.toursCount,
      parks: (c.parks || []).map((p) => ({ name: p.name, slug: p.slug })),
    }));

  return (
    <div className="min-h-screen font-sans text-[var(--ink-body)] overflow-x-hidden">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <HeroBackgroundSlider
          tourCount={stats.tours}
          minHeightClass="h-[460px] min-h-[460px]"
        >
          {/* Search Form — anchored at bottom on desktop, stacked on mobile */}
          <HeroSearchForm />
        </HeroBackgroundSlider>

        {/* ── Trust strip (Savannah Sand Statistics Bar) ── */}
        <div className="relative z-10 mx-auto mt-3 sm:mt-5 max-w-[1230px] px-3 sm:px-6">
          <div className="bg-[#E4DBB4] border border-[#DEDCCF] grid grid-cols-2 gap-x-2 gap-y-2.5 sm:gap-x-4 sm:gap-y-3 rounded-2xl px-3 sm:px-6 py-3.5 sm:py-4 text-[11.5px] sm:text-[13px] font-semibold text-[#344C49] md:grid-cols-4 shadow-xs">
            <span className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#214446]" />
              <span className="leading-tight"><strong className="text-[#193A38] font-bold">{stats.operators}</strong> Verified Operators</span>
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#214446]" />
              <span className="leading-tight"><strong className="text-[#193A38] font-bold">Best Price</strong> Guarantee</span>
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#214446]" />
              <span className="leading-tight"><strong className="text-[#193A38] font-bold">{stats.reviews}</strong> Traveler Reviews</span>
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-center md:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#214446]" />
              <span className="leading-tight"><strong className="text-[#193A38] font-bold">{stats.destinations}</strong> Parks &amp; Reserves</span>
            </span>
          </div>
        </div>

        {/* ── Top-rated Safari Countries (Interactive Circuit & Spotlight) ── */}
        <section className="pt-10 sm:pt-20 pb-10 sm:pb-16 relative">
          <div className="mx-auto max-w-[1230px] px-3 sm:px-6">
            <div className="section-rule mb-6 sm:mb-8" />
            <FeaturedCountriesSection countries={countryHighlights} />
          </div>
        </section>

        {/* ── Popular tours (Warm Ivory background) ── */}
        <section className="bg-[#F7F6F1] py-12 sm:py-16 border-y border-[#DEDCCF]">
          <div className="mx-auto max-w-[1230px] px-3 sm:px-6">
            <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-[22px] sm:text-[28px] font-semibold text-[#193A38]">
                  Popular Safari Tours
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#344C49]">
                  Handpicked authentic itineraries by local safari operators
                </p>
              </div>
              <Link href="/tours" className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#214446] hover:text-[#193A38] self-start sm:self-auto transition-colors">
                View all {stats.tours.toLocaleString()} tours <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Operators (New Distinctive Banner Design) ── */}
        <section className="pb-10 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-3 sm:px-6">
            <TopRatedOperatorsBanner
              operators={operators}
              totalOperatorsCount={stats.operators}
            />
          </div>
        </section>

        {/* ── Blog ── */}
        <section className="pb-10 sm:pb-16">
          <div className="mx-auto max-w-[1230px] px-3 sm:px-6">
            <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-[22px] sm:text-[28px] font-semibold text-[var(--ink)]">
                  Latest from the Blog
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Insider safari guides, wildlife advice &amp; trip inspiration
                </p>
              </div>
              <Link href="/blogs" className="link inline-flex items-center gap-1 text-xs sm:text-sm font-semibold self-start sm:self-auto">
                All articles <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {blogPosts.map((post) => (
                <Link
                  href={`/blogs/${post.slug}`}
                  key={post.slug}
                  className="surface-card surface-card-hover group relative block h-[180px] sm:h-[200px] overflow-hidden rounded-2xl shadow-xs"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${post.coverImageUrl ?? ''}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="text-[15px] sm:text-[18px] font-semibold leading-snug text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experts (Moving Left-to-Right with Accessible Motion) ── */}
        <section className="pb-14 sm:pb-20">
          <div className="mx-auto max-w-[1230px] px-3 sm:px-6">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-[22px] sm:text-[28px] font-semibold text-[var(--ink)]">
                SafariRequest Experts
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[var(--ink-secondary)]">
                Independent travel writers and industry experts review destinations and operators across the continent, so you can book with confidence.
              </p>
            </div>

            <SafariExpertsTicker experts={safariExperts} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
