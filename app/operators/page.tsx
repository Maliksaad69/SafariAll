import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OperatorFilterSidebar from '@/components/OperatorFilterSidebar';
import { getOperatorCards } from '@/lib/catalog';
import Link from 'next/link';
import { Star, MapPin, ChevronRight, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OperatorsPage({ searchParams }: { searchParams: Promise<{ country?: string; rating?: string; office?: string; search?: string; travelers?: string; month?: string }> }) {
  const params = await searchParams;
  let operators = await getOperatorCards();

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
        {/* Page Hero Banner (Deep Safari Teal with Pure White Typography) */}
        <div className="bg-[#214446] border-b border-[#193A38] py-10 sm:py-12 !text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#193A38]/90 via-[#214446] to-[#193A38]/90 pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#8C9F91]/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1230px] mx-auto px-4 sm:px-6">
            <nav className="text-sm font-semibold !text-white/80 mb-3.5 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="!text-white/85 hover:!text-white hover:underline transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <span className="!text-white font-extrabold">Tour Operators</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold font-display !text-white tracking-tight drop-shadow-sm">
                  Safari Tour Operators
                </h1>
                <p className="mt-2 text-base text-white/90 max-w-2xl leading-relaxed">
                  Discover 100% verified local safari companies across Africa with direct traveler reviews and zero commission markups.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-full px-4 py-2 text-sm font-bold !text-white shadow-sm border border-white/20 bg-white/10 backdrop-blur-md">
                <Star className="w-4 h-4 fill-[#E4DBB4] text-[#E4DBB4]" />
                <span className="font-extrabold !text-white">Verified local specialists</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[320px] flex-shrink-0">
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
                        <img
                          src={(op.image && op.image.trim()) || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'}
                          alt={op.companyName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Logo cleanly aligned with the heading */}
                            {op.logo && op.logo.trim() ? (
                              <div className="w-12 h-12 rounded-xl border border-[var(--glass-border)] bg-white p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                <img src={op.logo} alt={`${op.companyName} Logo`} className="w-full h-full object-contain rounded-lg" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--brand-soft)] text-[var(--brand-deep)] font-extrabold text-lg flex-shrink-0 flex items-center justify-center shadow-2xs">
                                {op.companyName.charAt(0)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/operators/${op.slug}`} className="text-xl font-bold font-display text-[var(--ink)] hover:text-[var(--brand-ink)] transition-colors">
                                  {op.companyName}
                                </Link>
                                {op.isVerified && (
                                  <span className="badge badge-success">Verified</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                                <span className="flex text-[var(--gold)]" aria-hidden="true">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(op.averageRating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#DEDCCF] text-[#DEDCCF]'}`} />
                                  ))}
                                </span>
                                <span className="font-bold text-[var(--ink)]">{op.averageRating.toFixed(1)}</span>
                                <span className="text-[var(--ink-muted)]">/5 · {op.totalReviews} Reviews</span>
                              </div>
                            </div>
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
