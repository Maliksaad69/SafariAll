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
import { withMemoryCache } from '@/lib/cache';
import { CheckCircle2, ChevronRight, Award, ShieldCheck, Compass, Globe, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getRealStats() {
  return withMemoryCache('home_real_stats', 60, async () => {
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
      console.warn('[HomePage] Database query failed in getRealStats:', (err as Error)?.message);
      return {
        tours: 0,
        operators: 0,
        reviews: 0,
        rating: 0,
        destinations: 0,
      };
    }
  });
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
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 13)
    .map((c, i) => ({
      name: c.name,
      slug: c.slug,
      rank: `#${c.popularityRank || i + 1}`,
      popularityRank: c.popularityRank || i + 1,
      featuredImageUrl: c.featuredImageUrl,
      rating: c.rating,
      reviewCount: c.reviewCount,
      description: c.description,
      dailyRates: c.dailyRates,
      bestTimeSummary: c.bestTimeSummary,
      highSeason: c.highSeason,
      toursCount: c.toursCount,
      parks: (c.parks || []).map((p: any) => ({ name: p.name, slug: p.slug })),
    }));

  return (
    <div className="min-h-screen font-sans text-[var(--ink-body)] overflow-x-hidden">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <HeroBackgroundSlider />

        {/* ── Floating Overlapping Search Card ── */}
        <HeroSearchForm initialTourCount={stats.tours} />

        {/* ── Trust strip ── */}
        <div className="relative z-10 mx-auto mt-6 sm:mt-8 max-w-[1240px] px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 border-b border-[#E2DFD4]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#EFECE4] text-[#1E433B] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <div>
                <strong className="block text-xs sm:text-sm font-semibold text-[#182624]">Direct connections</strong>
                <small className="block text-[11px] sm:text-xs text-[#6B7D79] mt-0.5">
                  Talk to {stats.operators > 0 ? `${stats.operators} verified` : 'local'} operators directly
                </small>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#EFECE4] text-[#1E433B] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <div>
                <strong className="block text-xs sm:text-sm font-semibold text-[#182624]">Safari specialists</strong>
                <small className="block text-[11px] sm:text-xs text-[#6B7D79] mt-0.5">Tours crafted by licensed African guides</small>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#EFECE4] text-[#1E433B] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <div>
                <strong className="block text-xs sm:text-sm font-semibold text-[#182624]">13 destinations</strong>
                <small className="block text-[11px] sm:text-xs text-[#6B7D79] mt-0.5">National parks and reserves across Africa</small>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#EFECE4] text-[#1E433B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <div>
                <strong className="block text-xs sm:text-sm font-semibold text-[#182624]">Zero commission</strong>
                <small className="block text-[11px] sm:text-xs text-[#6B7D79] mt-0.5">True local prices with direct operator quotes</small>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top-rated Safari Countries (Interactive Circuit & Spotlight) ── */}
        <section className="py-12 sm:py-16 relative">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
            <FeaturedCountriesSection countries={countryHighlights} />
          </div>
        </section>

        {/* ── Popular tours ── */}
        <section className="bg-[#F7F5F0] py-12 sm:py-16 border-y border-[#E2DFD4]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#182624]">
                  Popular Safari Tours
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#3D4D4A]">
                  Authentic itineraries offered by verified local operators
                </p>
              </div>
              <Link href="/african-safari-tours" className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#1E433B] hover:text-[#142E28] transition-colors self-start sm:self-auto">
                <span>View all {stats.tours.toLocaleString()} tours</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#E2DFD4] bg-white p-12 text-center text-sm text-[#6B7D79]">
                No tours currently listed in the database.
              </div>
            )}
          </div>
        </section>

        {/* ── Operators Banner ── */}
        {operators.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
              <TopRatedOperatorsBanner
                operators={operators}
                totalOperatorsCount={stats.operators}
              />
            </div>
          </section>
        )}

        {/* ── Blog ── */}
        {blogPosts.length > 0 && (
          <section className="py-12 sm:py-16 border-t border-[#E2DFD4]">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#182624]">
                    Latest from the Blog
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#6B7D79]">
                    Safari planning guides, wildlife photography advice, and field reports
                  </p>
                </div>
                <Link href="/safari-blog" className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#1E433B] hover:text-[#142E28] transition-colors self-start sm:self-auto">
                  <span>All articles</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <Link
                    href={`/safari-blog/${post.slug}`}
                    key={post.slug}
                    className="surface-card surface-card-hover group relative block h-[200px] overflow-hidden rounded-xl border border-[#E2DFD4]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${post.coverImageUrl ?? ''}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="text-base font-semibold leading-snug text-white line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Experts ── */}
        <section className="py-12 sm:py-16 border-t border-[#E2DFD4]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#182624]">
                Safari Field Reports
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#6B7D79]">
                Independent reviews and destination reports by verified safari specialists across the continent.
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
