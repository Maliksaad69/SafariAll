import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getCountries } from '@/lib/catalog';
import { Sun, TrendingUp, Play, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ParksPage() {
  const countries = (await getCountries()).map((c) => ({
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
  }));

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-12">
        {/* Top Breadcrumbs */}
        <div className="border-b border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-3 text-xs text-[var(--ink-secondary)]">
          <div className="max-w-[1230px] mx-auto px-4 flex items-center gap-1.5">
            <Link href="/" className="text-[var(--brand-ink)] hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3 text-[var(--ink-muted)]" />
            <span className="text-[var(--ink)] font-semibold">Countries & Parks</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div 
          className="relative surface-dark py-14 overflow-hidden border-b border-[var(--dark-border)]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--dark)] via-[var(--dark)]/85 to-transparent"></div>
          <div className="relative max-w-[1230px] mx-auto px-4">
            <span className="badge badge-brand bg-white/20 text-white border-white/30 backdrop-blur-md mb-3">
              Destination Guides
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-3">
              African Safari Countries & Parks
            </h1>
            <p className="text-sm md:text-base text-[var(--dark-text-soft)] max-w-2xl leading-relaxed">
              Explore Africa&apos;s most iconic safari destinations. Compare wildlife seasons, park highlights, daily budgets, and travel guides.
            </p>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-[var(--ink)]">
                Top Safari Destinations
              </h2>
              <p className="text-xs text-[var(--ink-secondary)] mt-1">Select a country to discover national parks, wildlife concentrations, and travel logistics.</p>
            </div>
          </div>

          <div className="space-y-6">
            {countries.map(country => (
              <article key={country.id} className="surface-card surface-card-hover rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-sm flex flex-col lg:flex-row">
                
                {/* Left: Image */}
                <div className="w-full lg:w-[260px] relative flex-shrink-0 min-h-[200px]">
                  <img src={country.image} alt={country.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-md border border-white/20">
                      <Play className="h-3 w-3 fill-current text-[var(--brand)]" />
                      {country.name}
                    </span>
                  </div>
                </div>

                {/* Middle: Country Info */}
                <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-soft)]">
                  <h3 className="text-2xl font-bold font-display text-[var(--ink)] hover:text-[var(--brand-ink)] transition-colors">
                    <Link href={`/parks/${country.slug}`}>{country.name}</Link>
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1.5 mb-3 text-xs flex-wrap">
                    <div className="flex text-[var(--gold)]">
                      {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                    </div>
                    <span className="font-bold text-[var(--ink)]">{country.rating.toFixed(1)}</span>
                    <span className="text-[var(--ink-muted)]">/5 · <Link href="/reviews" className="text-[var(--brand-ink)] hover:underline">{country.reviews} Reviews</Link></span>
                  </div>

                  <p className="text-xs text-[var(--ink-body)] mb-5 leading-relaxed">
                    {country.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 border border-[var(--border)]">
                      <div className="w-7 h-7 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0">$$</div>
                      <div>
                        <div className="font-bold text-[var(--ink)]">Daily Rates</div>
                        <div className="text-[var(--ink-secondary)] text-[11px]">{country.rates}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 border border-[var(--border)]">
                      <div className="w-7 h-7 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0"><Sun className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-bold text-[var(--ink)]">Best Time</div>
                        <div className="text-[var(--ink-secondary)] text-[11px] truncate">{country.bestTime.split('(')[0]}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 border border-[var(--border)]">
                      <div className="w-7 h-7 rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center font-bold text-xs shrink-0"><TrendingUp className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-bold text-[var(--ink)]">High Season</div>
                        <div className="text-[var(--ink-secondary)] text-[11px] truncate">{country.highSeason.split('(')[0]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Link href={`/parks/${country.slug}`} className="btn btn-primary btn-sm">
                      More About {country.name} &rarr;
                    </Link>
                    <Link href={`/tours?country=${country.name}`} className="btn btn-secondary btn-sm">
                      {country.toursCount.toLocaleString()} {country.name} Tours &rarr;
                    </Link>
                  </div>
                </div>

                {/* Right: Parks List */}
                <div className="w-full lg:w-[280px] p-6 flex-shrink-0 bg-white/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-3">{country.name} Parks & Reserves</h4>
                  <ul className="space-y-2 mb-4 text-xs">
                    {country.parks.map((park) => (
                      <li key={park.slug} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-[var(--brand-ink)] shrink-0" />
                        <Link href={`/parks/${park.slug}`} className="text-[var(--ink-body)] hover:text-[var(--brand-ink)] transition-colors">{park.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/tours?country=${country.name}`} className="text-xs font-bold text-[var(--brand-ink)] hover:underline inline-flex items-center gap-1">
                    All {country.totalParks} Parks & Reserves &rarr;
                  </Link>
                </div>
                
              </article>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
