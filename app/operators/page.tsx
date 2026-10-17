import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OperatorFilterSidebar from '@/components/OperatorFilterSidebar';
import { safariOperators } from '@/lib/site-data';
import Link from 'next/link';
import { Star, MapPin, ChevronRight, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OperatorsPage({ searchParams }: { searchParams: Promise<{ country?: string; rating?: string; office?: string; search?: string; travelers?: string; month?: string }> }) {
  const params = await searchParams;
  let operators: any[] = safariOperators;

  if (params.search) {
    const q = params.search.trim().toLowerCase();
    operators = operators.filter((op) => op.companyName.toLowerCase().includes(q));
  }

  if (params.country) {
    operators = operators.filter((op) =>
      op.officesIn?.some((office: string) => office.toLowerCase() === params.country?.toLowerCase()) ||
      op.destinations?.some((destination: string) => destination.toLowerCase() === params.country?.toLowerCase())
    );
  }

  if (params.rating) {
    const minimumRating = Number(params.rating);
    operators = operators.filter((op) => (op.averageRating ?? 0) >= minimumRating);
  }

  if (params.office) {
    operators = operators.filter((op) =>
      op.officesIn?.some((office: string) => office.toLowerCase() === params.office?.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border-soft)] bg-white/40 backdrop-blur-md py-8">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-[var(--ink-secondary)] uppercase tracking-[0.12em] font-semibold mb-3 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="text-[var(--brand-ink)] hover:underline normal-case">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span className="text-[var(--ink)] normal-case">Tour Operators</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold font-display text-[var(--ink)] tracking-tight">
                  Safari Tour Operators
                </h1>
                <p className="mt-2 text-sm text-[var(--ink-secondary)] max-w-2xl">
                  Discover 100% verified local safari companies across Africa with direct traveler reviews and zero commission markups.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto surface-card rounded-full px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-sm border border-[var(--glass-border)]">
                <Star className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                Verified local specialists
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[300px] flex-shrink-0">
              <div className="sticky top-20">
                <OperatorFilterSidebar
                  currentCountry={params.country || ''}
                  currentRating={params.rating || ''}
                  currentOffice={params.office || ''}
                  currentSearch={params.search || ''}
                />
              </div>
            </div>

            {/* Main Results */}
            <div className="flex-1 min-w-0">

              {/* Header Info */}
              <div className="mb-6">
                <div className="text-[13px] text-[var(--ink-secondary)]">
                  Showing <strong className="text-[var(--ink)]">{operators.length} verified operators</strong>{params.search ? ` matching “${params.search}”` : ''}. All licensed and vetted.
                </div>
              </div>

              {/* Operators List */}
              <div className="space-y-6 mb-10">
                {operators.length === 0 ? (
                  <div className="surface-card rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--ink-body)]">
                    <p className="font-bold text-lg text-[var(--ink)] mb-2 font-display">No operators match your filters.</p>
                    <p className="text-sm text-[var(--ink-secondary)]">Try removing a filter or <Link href="/operators" className="text-[var(--brand-ink)] font-semibold hover:underline">viewing all operators</Link>.</p>
                  </div>
                ) : (
                  operators.map((op) => (
                    <article key={op.id} className="surface-card surface-card-hover rounded-2xl p-6 border border-[var(--glass-border)] flex flex-col md:flex-row gap-6 shadow-sm transition-all">

                      {/* Image */}
                      <div className="w-full h-[180px] md:w-[200px] md:h-[150px] bg-[var(--surface-sunk)] flex-shrink-0 rounded-xl overflow-hidden relative">
                        <img src={op.image} alt={op.companyName} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">

                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <Link href={`/operators/${op.slug}`} className="text-xl font-bold font-display text-[var(--ink)] hover:text-[var(--brand-ink)] transition-colors">
                              {op.companyName}
                            </Link>

                            <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                              <span className="flex text-[var(--gold)]" aria-hidden="true">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(op.averageRating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#e2ddd4] text-[#e2ddd4]'}`} />
                                ))}
                              </span>
                              <span className="font-bold text-[var(--ink)]">{op.averageRating.toFixed(1)}</span>
                              <span className="text-[var(--ink-muted)]">/5 · {op.totalReviews} Reviews</span>
                              {op.isVerified && (
                                <span className="badge badge-success">Verified</span>
                              )}
                            </div>
                          </div>

                          {/* Logo */}
                          <div className="w-12 h-12 rounded-xl border border-[var(--glass-border)] bg-white p-1 flex-shrink-0 hidden md:flex items-center justify-center overflow-hidden shadow-xs">
                            <img src={op.logo} alt={`${op.companyName} Logo`} className="w-full h-full object-cover rounded-lg" />
                          </div>
                        </div>

                        <div className="mt-4 text-xs text-[var(--ink-body)] space-y-1.5">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[var(--ink-secondary)] font-medium">Offices In:</span>
                            <span className="flex gap-1.5 flex-wrap font-semibold">
                              {op.officesIn.map((c: string) => (
                                <Link key={c} href={`/operators?office=${encodeURIComponent(c)}`} className="text-[var(--brand-ink)] hover:underline inline-flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> {c}
                                </Link>
                              ))}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[var(--ink-secondary)] font-medium">Price Range:</span>
                            <span className="font-bold text-[var(--ink)]">{op.priceRange} <span className="font-normal text-[var(--ink-muted)]">pp/day</span></span>
                          </div>
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[var(--ink-secondary)] font-medium">Tour Types:</span>
                            <span className="text-[var(--ink-body)]">{op.tourTypes}</span>
                          </div>
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[var(--ink-secondary)] font-medium">Destinations:</span>
                            <span className="flex gap-1.5 flex-wrap">
                              {op.destinations.map((d: string) => (
                                <Link key={d} href={`/tours?country=${encodeURIComponent(d)}`} className="text-[var(--brand-ink)] hover:underline inline-flex items-center gap-1 font-semibold">
                                  <MapPin className="h-3 w-3" /> {d}
                                </Link>
                              ))}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-[var(--border-soft)] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/operators/${op.slug}`} className="btn btn-primary btn-sm">
                              View Operator <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link href={`/tours?country=${encodeURIComponent(op.officesIn[0] || 'Tanzania')}`} className="btn btn-secondary btn-sm">
                              All {op.toursCount} Tours <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">Direct operator quote</span>
                        </div>

                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 text-sm" aria-hidden="true">
                <span className="px-3.5 py-1.5 text-[var(--ink-muted)] cursor-not-allowed">&lt; Prev</span>
                <span className="px-3.5 py-1.5 font-bold text-white bg-[var(--brand-deep)] rounded-xl shadow-xs">1</span>
                <span className="px-3.5 py-1.5 text-[var(--ink-muted)] cursor-not-allowed">Next &gt;</span>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
