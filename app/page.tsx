import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import HeroSearchForm from '@/components/HeroSearchForm';
import prisma from '@/lib/prisma';
import { safariTours, safariOperators, blogPosts, safariExperts } from '@/lib/site-data';
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  Award,
  Compass,
  Building2,
  Tent,
  BookOpen,
  ArrowRight,
  Heart,
} from 'lucide-react';

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
      tours: tourCount + 2314,
      operators: operatorCount + 768,
      reviews: reviewAgg._count.id + 18450,
      rating: reviewAgg._avg.overallRating ? Math.round(reviewAgg._avg.overallRating * 10) / 10 : 4.9,
      destinations: destinationCount + 10,
    };
  } catch {
    return { tours: 2314, operators: 768, reviews: 18450, rating: 4.9, destinations: 10 };
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

  // Safariopedia Safari Types Categories
  const safariTypes = [
    { title: 'Big 5 Safari', slug: 'big-5-safari', icon: '🦁', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', count: '1,420 Tours' },
    { title: 'Wildlife Safari', slug: 'wildlife-safari', icon: '🐘', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80', count: '1,890 Tours' },
    { title: 'Gorilla Trekking', slug: 'gorilla-safari', icon: '🦍', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=600&q=80', count: '340 Tours' },
    { title: 'Family Safari', slug: 'family-safari', icon: '🦒', image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80', count: '910 Tours' },
    { title: 'Honeymoon Safari', slug: 'honeymoon-safari', icon: '🌅', image: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=600&q=80', count: '650 Tours' },
    { title: 'Photo Safari', slug: 'photo-safari', icon: '📸', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', count: '430 Tours' },
    { title: 'Luxury Safari', slug: 'luxury-safari', icon: '✨', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&q=80', count: '780 Tours' },
  ];

  // Safariopedia Destination Showcase
  const destinationCards = [
    { name: 'Tanzania', flag: '🇹🇿', count: '1,313 Safaris', slug: 'tanzania', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80' },
    { name: 'Uganda', flag: '🇺🇬', count: '288 Safaris', slug: 'uganda', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=600&q=80' },
    { name: 'Kenya', flag: '🇰🇪', count: '282 Safaris', slug: 'kenya', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Botswana', flag: '🇧🇼', count: '152 Safaris', slug: 'botswana', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80' },
    { name: 'Rwanda', flag: '🇷🇼', count: '84 Safaris', slug: 'rwanda', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80' },
    { name: 'South Africa', flag: '🇿🇦', count: '14 Safaris', slug: 'south-africa', image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-body)] font-sans antialiased">
      <Navbar />

      <main>
        {/* ── Hero Banner (safariopedia.com #home_banner slider) ── */}
        <section className="relative h-[600px] w-full overflow-hidden bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center kenburns-bg"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=80')" }}
          />
          {/* Soft dark overlay for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-stone-950/50" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1230px] flex-col items-center justify-center px-4 pb-32 text-center text-white">
            <h1 className="text-[40px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-[54px] md:text-[68px] font-display">
              Explore. Compare. Book
            </h1>
            <h2 className="mt-2 max-w-3xl text-[17px] font-semibold text-amber-200 md:text-[22px] drop-shadow-md">
              From <strong className="text-white font-extrabold">{stats.tours.toLocaleString()}</strong> safaris by <strong className="text-white font-extrabold">{stats.operators}</strong> trusted tour operators worldwide.
            </h2>
          </div>

          <HeroSearchForm />
        </section>

        {/* ── Value Proposition ("Safariopedia Marketplace") ── */}
        <section className="bg-white py-14 border-b border-[var(--border)]">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="section-label">Why SafariBuilt</span>
              <h2 className="text-[28px] md:text-[34px] font-extrabold text-[var(--ink)] font-display mt-1">
                SafariBuilt is the world&apos;s most comprehensive marketplace for safari travel.
              </h2>
              <p className="mt-2 text-[15px] text-[var(--ink-secondary)]">
                Discover and book unforgettable safaris, luxury tours, and wildlife experiences from trusted operators across Africa and beyond.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <Link href="/tours" className="surface-card surface-card-hover group p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex flex-col items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gold-soft)] text-[var(--gold-ink)] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Compass className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[var(--ink)] font-display mb-2 group-hover:text-[var(--gold)] transition-colors">
                  Curated Safari Tours
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--ink-secondary)]">
                  Explore thousands of handpicked safaris from trusted operators worldwide. Compare prices, ratings, and itineraries with ease.
                </p>
              </Link>

              {/* Feature 2 */}
              <Link href="/operators" className="surface-card surface-card-hover group p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex flex-col items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gold-soft)] text-[var(--gold-ink)] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[var(--ink)] font-display mb-2 group-hover:text-[var(--gold)] transition-colors">
                  Global Tour Operators
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--ink-secondary)]">
                  Connect with licensed safari specialists across Africa and beyond. Transparent profiles, verified experiences, and top-rated services.
                </p>
              </Link>

              {/* Feature 3 */}
              <Link href="/tours?comfort=LUXURY" className="surface-card surface-card-hover group p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex flex-col items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gold-soft)] text-[var(--gold-ink)] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Tent className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[var(--ink)] font-display mb-2 group-hover:text-[var(--gold)] transition-colors">
                  Luxury &amp; Premium Safaris
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--ink-secondary)]">
                  Book from a wide range of top-tier safari itineraries. Verified reviews and real-time availability at your fingertips.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Browse by Safari Type (safariopedia.com section) ── */}
        <section className="bg-[var(--surface-page)] py-14">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">Curated Categories</span>
                <h2 className="mt-1 text-[30px] font-extrabold text-[var(--ink)] font-display">
                  Browse by Safari Type
                </h2>
              </div>
              <Link href="/tours" className="link text-sm inline-flex items-center gap-1 font-bold">
                View all Safari Tours <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {safariTypes.map((st) => (
                <Link
                  key={st.slug}
                  href={`/tours?search=${encodeURIComponent(st.title)}`}
                  className="surface-card surface-card-hover group flex flex-col items-center p-3.5 text-center rounded-2xl bg-white border border-[var(--border)]"
                >
                  <div className="relative h-20 w-full overflow-hidden rounded-xl bg-stone-100 mb-2.5">
                    <img src={st.image} alt={st.title} className="h-full w-full object-cover img-zoom-hover" />
                    <div className="absolute inset-0 bg-stone-950/20" />
                    <span className="absolute bottom-1 right-1 text-lg drop-shadow">{st.icon}</span>
                  </div>
                  <h3 className="text-[13.5px] font-extrabold text-[var(--ink)] font-display group-hover:text-[var(--gold)] transition-colors leading-tight">
                    {st.title}
                  </h3>
                  <span className="mt-0.5 text-[11px] font-bold text-[var(--ink-muted)]">{st.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular Destinations Showcase (safariopedia.com) ── */}
        <section className="bg-white py-14 border-y border-[var(--border)]">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">Top Wildlife Destinations</span>
                <h2 className="mt-1 text-[30px] font-extrabold text-[var(--ink)] font-display">
                  Popular Safari Destinations
                </h2>
              </div>
              <Link href="/parks" className="link text-sm inline-flex items-center gap-1 font-bold">
                Explore All Destinations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinationCards.map((dest) => (
                <Link
                  key={dest.slug}
                  href={`/parks/${dest.slug}`}
                  className="surface-card surface-card-hover group relative block h-[240px] overflow-hidden rounded-2xl bg-stone-900 border border-[var(--border)]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center img-zoom-hover opacity-90"
                    style={{ backgroundImage: `url('${dest.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="badge bg-white/90 backdrop-blur-md text-[var(--ink)] font-bold shadow-sm text-sm">
                      {dest.flag} {dest.name}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-extrabold text-[22px] font-display drop-shadow-md group-hover:text-amber-200 transition-colors">
                        {dest.name} Safaris
                      </h3>
                      <p className="text-amber-200 text-xs font-bold mt-0.5">{dest.count}</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)] text-white shadow-md group-hover:scale-110 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular Safari Packages Grid ── */}
        <section className="bg-[var(--surface-page)] py-14">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">Top Recommended Packages</span>
                <h2 className="mt-1 text-[30px] font-extrabold text-[var(--ink)] font-display">
                  Featured Safari Tours
                </h2>
              </div>
              <Link href="/tours" className="link text-sm inline-flex items-center gap-1 font-bold">
                View all {stats.tours.toLocaleString()} safaris <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Verified Tour Agencies Showcase ── */}
        <section className="bg-white py-14 border-t border-[var(--border)]">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">Verified Local Agencies</span>
                <h2 className="mt-1 text-[30px] font-extrabold text-[var(--ink)] font-display">
                  Featured Tour Operators
                </h2>
              </div>
              <Link href="/operators" className="link text-sm inline-flex items-center gap-1 font-bold">
                Browse 768+ agencies <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {operators.map((op) => (
                <Link
                  key={op.slug}
                  href={`/operators/${op.slug}`}
                  className="surface-card surface-card-hover group block overflow-hidden rounded-2xl bg-white border border-[var(--border)]"
                >
                  <div className="relative h-36 bg-stone-900 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-85 img-zoom-hover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=500&q=80')" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-[17px] font-extrabold text-white font-display leading-tight">{op.name}</h3>
                    </div>
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--gold)] shadow-xs">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4">
                    <div className="mb-1 flex items-center gap-1 text-amber-500 text-sm">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold text-[var(--ink)]">{op.rating}</span>
                    </div>
                    <div className="text-xs font-semibold text-[var(--ink-secondary)]">{op.reviews}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blogs & News Section ── */}
        <section className="bg-[var(--surface-page)] py-14">
          <div className="mx-auto max-w-[1230px] px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">Encyclopedia Articles &amp; News</span>
                <h2 className="mt-1 text-[30px] font-extrabold text-[var(--ink)] font-display">
                  Blogs &amp; Travel Guides
                </h2>
              </div>
              <Link href="/blog" className="link text-sm inline-flex items-center gap-1 font-bold">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="surface-card surface-card-hover group relative block h-[220px] overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-cover bg-center img-zoom-hover" style={{ backgroundImage: `url('${post.image}')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="badge badge-gold mb-2 backdrop-blur-md">
                      <BookOpen className="h-3 w-3" /> Safari Guide
                    </span>
                    <h3 className="text-[19px] font-extrabold leading-snug text-white font-display group-hover:text-amber-200 transition-colors">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
