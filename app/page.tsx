import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import HeroSearchForm from '@/components/HeroSearchForm';
import prisma from '@/lib/prisma';
import { safariTours, safariOperators, countryHighlights, blogPosts, safariExperts } from '@/lib/site-data';
import { CheckCircle2, ChevronRight, ShieldCheck, Star, Calendar, Award } from 'lucide-react';

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
      tours: tourCount + safariTours.length,
      operators: operatorCount + safariOperators.length,
      reviews: reviewAgg._count.id,
      rating: reviewAgg._avg.overallRating ? Math.round(reviewAgg._avg.overallRating * 10) / 10 : 4.9,
      destinations: destinationCount,
    };
  } catch {
    return { tours: safariTours.length, operators: safariOperators.length, reviews: 0, rating: 4.9, destinations: 0 };
  }
}

export default async function HomePage() {
  const stats = await getRealStats();

  const tours = safariTours.slice(0, 3);
  const operators = safariOperators.slice(0, 4).map((op) => ({
    name: op.companyName,
    slug: op.slug,
    rating: op.averageRating,
    reviews: `${op.totalReviews.toLocaleString()} Reviews`,
  }));

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-body)] font-sans">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section
          className="relative h-[560px] w-full overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=80')" }}
        >
          {/* Heavy scrim so white text never blends */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/45" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1230px] items-center justify-center px-4 pb-28 md:pb-32">
            <div className="text-center text-white">
              <h1 className="text-[36px] font-bold leading-[1.02] tracking-[-0.05em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-[46px] md:text-[58px]" style={{ fontFamily: 'Georgia, serif' }}>
                Compare {stats.tours.toLocaleString()} African<br />Safari Tours
              </h1>
              <p className="mt-3 text-[16px] font-medium text-white md:text-[20px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]" style={{ fontFamily: 'Georgia, serif' }}>
                Booked directly from verified local operators
              </p>
            </div>
          </div>

          <HeroSearchForm />
        </section>

        {/* ── Trust strip ── */}
        <div className="border-b border-[var(--border)] bg-white py-3.5 text-[13px] text-[var(--ink-body)]">
          <div className="mx-auto flex max-w-[1230px] flex-wrap items-center justify-center gap-x-9 gap-y-2 px-4">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> <strong className="text-[var(--ink)]">{stats.operators}</strong> Verified Local Operators</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> <strong className="text-[var(--ink)]">Best Price</strong> Guarantee</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> <strong className="text-[var(--ink)]">{stats.reviews}</strong> Traveler Reviews</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> <strong className="text-[var(--ink)]">{stats.destinations}</strong> Parks &amp; Reserves</span>
          </div>
        </div>

        {/* ── Countries ── */}
        <section className="bg-[var(--surface-page)] py-11">
          <div className="mx-auto max-w-[1230px] px-4">
            <h2 className="mb-5 text-[26px] font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              Top-rated Safari Countries
            </h2>

            <div className="surface-card overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="w-full border-b border-[var(--border-soft)] bg-[var(--surface-raised)] lg:w-[270px] lg:border-b-0 lg:border-r">
                  {countryHighlights.map((country) => (
                    <Link
                      key={country.name}
                      href={`/parks/${country.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center px-5 py-3 text-[14px] transition-colors ${country.active ? 'bg-[var(--surface-sunk)] font-bold text-[var(--ink)]' : 'link hover:bg-[var(--surface-sunk)]'}`}
                    >
                      <span className={`mr-3 inline-block w-8 text-[12px] ${country.active ? 'text-[var(--ink-secondary)]' : 'text-[var(--ink-muted)]'}`}>{country.rank}</span>
                      <span>{country.name}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" />
                    </Link>
                  ))}
                </div>

                {/* Featured country panel — pure white text on strong dark scrim */}
                <div className="relative flex-1 bg-[var(--dark)]">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80')" }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

                  <div className="relative z-10 flex min-h-[380px] flex-col justify-center px-8 py-8 text-white md:px-10 md:py-10">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-[30px] font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Tanzania</h3>
                      <div className="flex items-center gap-0.5 text-[var(--dark-gold)]" aria-label="Rated 4.8 out of 5">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                      </div>
                      <span className="text-[12px] font-semibold text-white">4.8/5 · 2,172 Reviews</span>
                    </div>

                    <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.1em] text-white">#1 of 8 Major Safari Countries</p>

                    <p className="max-w-[560px] text-[14px] leading-relaxed text-white">
                      Tanzania, with its three safari circuits, is one of Africa&apos;s top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the Spice Island of Zanzibar is only a short flight away.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-6 text-[13px]">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 font-bold text-white">$</div>
                        <div>
                          <div className="font-bold text-white">Rates (USD)</div>
                          <div className="text-white">$229 to $659 pp/day</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-white"><Calendar className="h-4 w-4" /></div>
                        <div>
                          <div className="font-bold text-white">Best Time to Go</div>
                          <div className="text-white">June to October; January to February</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/tours?country=Tanzania" className="btn btn-primary btn-sm">
                        Tanzania Safaris <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link href="/operators?country=Tanzania" className="btn btn-ghost-dark btn-sm">
                        Tanzania Operators <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Popular tours ── */}
        <section className="bg-[var(--surface-page)] py-10">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-[26px] font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                Popular Safari Tours
              </h2>
              <Link href="/tours" className="link text-sm inline-flex items-center gap-1">
                View all {stats.tours.toLocaleString()} tours <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Operators ── */}
        <section className="bg-[var(--surface-page)] py-10">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-[26px] font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                Top Rated Tour Operators
              </h2>
              <Link href="/operators" className="link text-sm inline-flex items-center gap-1">
                Browse all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {operators.map((op) => (
                <Link
                  key={op.slug}
                  href={`/operators/${op.slug}`}
                  className="surface-card surface-card-hover block overflow-hidden"
                >
                  <div className="relative h-32 bg-[var(--dark)]">
                    <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=500&q=80')" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-[17px] font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>{op.name}</h3>
                    </div>
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4">
                    <div className="mb-1 flex text-[13px] text-[var(--gold)]" aria-hidden="true">
                      {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                    </div>
                    <div className="text-xs font-semibold text-[var(--ink-secondary)]">{op.reviews}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog ── */}
        <section className="bg-[var(--surface-page)] py-10">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-[26px] font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                Latest from the Blog
              </h2>
              <Link href="/blog" className="link text-sm inline-flex items-center gap-1">
                All articles <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="surface-card surface-card-hover group relative block h-[195px] overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${post.image}')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-[19px] font-bold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" style={{ fontFamily: 'Georgia, serif' }}>{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experts ── */}
        <section className="bg-[var(--surface-page)] py-10 pb-14">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-[26px] font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                SafariAsili Experts
              </h2>
            </div>

            <p className="mb-5 max-w-2xl text-[14px] text-[var(--ink-body)]">
              Independent travel writers and industry experts review destinations and operators across the continent, so you can book with confidence.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {safariExperts.map((expert) => (
                <div key={expert.id} className="surface-card surface-card-hover flex gap-4 p-5">
                  <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl">
                    <img src={expert.image} alt={expert.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/experts/${expert.id}`} className="link text-[15px] font-bold">
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
