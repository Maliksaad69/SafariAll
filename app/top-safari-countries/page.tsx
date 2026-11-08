import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getCountries } from '@/lib/catalog';
import { Sun, TrendingUp, Play, ChevronRight, Compass } from 'lucide-react';
import HeroBackgroundSlider from '@/components/HeroBackgroundSlider';
import { COUNTRY_FLAGS } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Top African Safari Countries & National Parks | SafariRequest',
  description:
    'Compare Africa’s premier safari destinations. Explore seasonal wildlife concentrations, park guides, daily travel budgets, and verified local tour operators.',
};

export default async function TopSafariCountriesPage() {
  const countries = (await getCountries())
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      reviews: c.reviewCount,
      rating: c.rating ?? 0,
      description: c.description ?? '',
      rates: c.dailyRates ?? 'On request',
      bestTime: c.bestTimeSummary ?? '',
      highSeason: c.highSeason ?? '',
      image: c.featuredImageUrl ?? '',
      toursCount: c.toursCount,
      parks: c.parks.slice(0, 6),
      totalParks: c.parks.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-16">
        {/* Top Breadcrumbs */}
        <div className="border-b border-[var(--border-soft)] bg-white/70 backdrop-blur-md py-3 text-sm text-[var(--ink-secondary)]">
          <div className="max-w-[1230px] mx-auto px-4 flex items-center gap-2">
            <Link href="/" className="text-[var(--brand-deep)] font-bold hover:underline">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--ink-secondary)]" />
            <span className="text-[var(--ink)] font-extrabold">Top Safari Countries</span>
          </div>
        </div>

        {/* Hero Banner */}
        <HeroBackgroundSlider
          minHeightClass="min-h-[340px] md:h-[380px]"
          className="border-b border-[var(--dark-border)]"
        >
          <div className="relative max-w-[1230px] mx-auto px-4 py-12 md:py-16 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-bold text-[var(--gold)] backdrop-blur-md mb-3 self-start">
              <Compass className="w-4 h-4 text-[var(--gold)]" />
              <span>Comprehensive African Safari Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white mb-3 tracking-tight">
              Top African Safari Countries &amp; National Parks
            </h1>
            <p className="text-base sm:text-lg text-white/95 max-w-3xl leading-relaxed font-light">
              Compare Africa&apos;s premier safari destinations. Explore seasonal wildlife concentrations, park guides, daily travel budgets, and verified local tour operators.
            </p>
          </div>
        </HeroBackgroundSlider>

        <div className="max-w-[1230px] mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--brand-deep)] block mb-1">
                Destination Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--ink)]">
                Top Safari Countries ({countries.length})
              </h2>
              <p className="text-sm sm:text-base text-[var(--ink)] font-medium mt-1">
                Select a country to discover national parks, wildlife concentrations, rates, and travel logistics.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {countries.length > 0 ? (
              countries.map((country) => (
                <article
                  key={country.id}
                  className="surface-card surface-card-hover rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm flex flex-col lg:flex-row bg-white/95"
                >
                {/* Left: Image Banner */}
                <div className="w-full lg:w-[260px] relative flex-shrink-0 min-h-[220px] lg:min-h-[260px]">
                  <img
                    src={country.image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'}
                    alt={country.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3.5 left-3.5 text-white text-xs font-bold drop-shadow">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/20 text-white font-bold">
                      <Play className="h-3 w-3 fill-current text-[var(--brand)]" />
                      {country.name} Safari
                    </span>
                  </div>
                </div>

                {/* Middle: Country Info & Description */}
                <div className="flex-1 p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[var(--border-soft)] flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <h3 className="text-2xl sm:text-3xl font-bold font-display text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors">
                        <Link href={`/parks/${country.slug}`} className="inline-flex items-center gap-2">
                          {COUNTRY_FLAGS[country.name] && <span>{COUNTRY_FLAGS[country.name]}</span>}
                          <span>{country.name}</span>
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex text-amber-500 font-bold">
                          {'★★★★★'.split('').map((s, i) => (
                            <span key={i}>{s}</span>
                          ))}
                        </div>
                        <span className="font-extrabold text-[var(--ink)]">{country.rating.toFixed(1)}</span>
                        <span className="text-[var(--ink-secondary)] font-medium">
                          /5 ·{' '}
                          <Link href="/safari-reviews" className="text-[var(--brand-deep)] font-bold hover:underline">
                            {country.reviews} Reviews
                          </Link>
                        </span>
                      </div>
                    </div>

                    <p className="text-[15px] sm:text-[16px] text-[var(--ink)] font-normal leading-relaxed mb-6">
                      {country.description}
                    </p>

                    {/* Key Travel Facts Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                        <div className="w-9 h-9 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-extrabold text-xs shrink-0 border border-[var(--brand)]/15">
                          $$
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">Daily Rates</div>
                          <div className="font-bold text-[var(--ink)] text-sm truncate">{country.rates}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                        <div className="w-9 h-9 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--brand)]/15">
                          <Sun className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">Best Time</div>
                          <div className="font-bold text-[var(--ink)] text-sm truncate">{country.bestTime.split('(')[0]}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                        <div className="w-9 h-9 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--brand)]/15">
                          <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">High Season</div>
                          <div className="font-bold text-[var(--ink)] text-sm truncate">{country.highSeason.split('(')[0]}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-soft)]">
                    <Link href={`/parks/${country.slug}`} className="btn btn-primary text-sm font-bold px-5 py-2.5 rounded-xl">
                      Explore {country.name} Guide &rarr;
                    </Link>
                    <Link href={`/african-safari-tours?country=${country.name}`} className="btn btn-secondary text-sm font-bold px-5 py-2.5 rounded-xl">
                      View {country.toursCount.toLocaleString()} {country.name} Safaris &rarr;
                    </Link>
                  </div>
                </div>

                {/* Right: National Parks Sidebar */}
                <div className="w-full lg:w-[260px] p-6 flex-shrink-0 bg-white/70 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-3.5 pb-2 border-b border-[var(--border-soft)] flex items-center justify-between">
                      <span>{country.name} Parks</span>
                      <span className="text-xs font-bold text-[var(--ink-secondary)] normal-case">
                        {country.totalParks} total
                      </span>
                    </h4>
                    <ul className="space-y-2.5 mb-4">
                      {country.parks.map((park) => (
                        <li key={park.slug}>
                          <Link
                            href={`/parks/${park.slug}`}
                            className="group flex items-center gap-2 text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--brand)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            <span className="truncate group-hover:underline">{park.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/parks/${country.slug}#guide-parks-reserves`}
                    className="text-sm font-bold text-[var(--brand-deep)] hover:underline inline-flex items-center gap-1.5 pt-3 border-t border-[var(--border-soft)]"
                  >
                    <span>All {country.totalParks} Parks &amp; Highlights</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))
            ) : (
              <div className="surface-card rounded-2xl border border-[var(--border)] p-12 text-center text-sm text-[var(--ink-secondary)]">
                No safari destinations currently available in the database.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
