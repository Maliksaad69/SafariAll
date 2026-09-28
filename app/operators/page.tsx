import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OperatorFilterSidebar from '@/components/OperatorFilterSidebar';
import { safariOperators } from '@/lib/site-data';
import Link from 'next/link';
import { Star, MapPin, ChevronRight, Building2, ShieldCheck, Award, Sparkles, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)] font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-16">
        {/* ── Modern Hero Banner ── */}
        <div className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white py-12 border-b border-amber-900/20 shadow-md">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-amber-200/80 uppercase tracking-widest font-bold mb-4 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500/70" />
              <span className="text-amber-400 font-extrabold">Tour Operators Directory</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Vetted Local Agencies
                </div>
                <h1 className="text-[32px] md:text-[44px] font-extrabold leading-tight font-display tracking-tight text-white">
                  Verified African Safari Operators
                </h1>
                <p className="mt-2 text-[14.5px] text-stone-300 leading-relaxed max-w-2xl">
                  Connect directly with licensed tour specialists across Tanzania, Kenya, South Africa, and Uganda. No middleman commissions, direct traveler quotes.
                </p>
              </div>

              <div className="inline-flex flex-col items-start gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs font-bold self-start md:self-center shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-extrabold">
                  <Award className="w-4 h-4" />
                  <span>Licensed & Background Checked</span>
                </div>
                <span className="text-stone-300 font-medium">Direct quotes with transparent daily rates</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="max-w-[1230px] mx-auto px-4 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:w-[290px] flex-shrink-0">
              <OperatorFilterSidebar
                currentCountry={params.country || ''}
                currentRating={params.rating || ''}
                currentOffice={params.office || ''}
                currentSearch={params.search || ''}
              />
            </div>

            {/* Main Results Container */}
            <div className="flex-1 min-w-0">

              {/* Header Info Bar */}
              <div className="bg-white border border-[var(--border)] rounded-2xl p-4 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Agency Directory</span>
                  <h2 className="text-[20px] font-extrabold text-[var(--ink)] font-display">
                    {operators.length} Verified {operators.length === 1 ? 'Operator' : 'Operators'} Available
                  </h2>
                </div>
                {params.search && (
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold">
                    Filter: “{params.search}”
                  </div>
                )}
              </div>

              {/* Operators List */}
              <div className="space-y-6 mb-10">
                {operators.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-white p-12 text-center text-[var(--ink-secondary)] shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-[var(--gold)] flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-[var(--ink)] text-xl font-display mb-1">No safari agencies match your filter criteria</h3>
                    <p className="text-sm text-[var(--ink-secondary)] mb-4 max-w-md mx-auto">
                      Try adjusting your destination country or rating parameters.
                    </p>
                    <Link href="/operators" className="btn btn-primary btn-md inline-flex items-center gap-2">
                      Reset Agency Directory
                    </Link>
                  </div>
                ) : (
                  operators.map((op) => (
                    <div
                      key={op.id}
                      className="surface-card surface-card-hover bg-white rounded-2xl border border-[var(--border)] p-6 shadow-2xs transition-all duration-300 hover:shadow-xl hover:border-amber-300/50 flex flex-col md:flex-row gap-6 items-start"
                    >
                      {/* Operator Image & Avatar */}
                      <div className="w-full md:w-[220px] h-[160px] bg-stone-900 rounded-2xl overflow-hidden relative flex-shrink-0 group">
                        <img
                          src={op.image}
                          alt={op.companyName}
                          className="w-full h-full object-cover img-zoom-hover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                        {op.isVerified && (
                          <span className="absolute top-3 left-3 bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-800/40 text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                          </span>
                        )}

                        <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-xl p-1 shadow-md border border-stone-200 overflow-hidden flex items-center justify-center">
                          <img src={op.logo} alt={`${op.companyName} Logo`} className="w-full h-full object-cover rounded-lg" />
                        </div>
                      </div>

                      {/* Content Middle Section */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link
                              href={`/operators/${op.slug}`}
                              className="text-[21px] font-extrabold text-[var(--ink)] hover:text-[var(--gold)] transition-colors font-display leading-tight"
                            >
                              {op.companyName}
                            </Link>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-lg font-extrabold">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{op.averageRating.toFixed(1)}</span>
                            </div>
                            <span className="text-[var(--ink-secondary)] font-semibold">({op.totalReviews} Verified Reviews)</span>
                          </div>
                        </div>

                        {/* Office & Destination Badges */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[var(--ink-muted)] text-[11px] uppercase tracking-wider w-20 shrink-0">Offices:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {op.officesIn.map((office: string) => (
                                <Link
                                  key={office}
                                  href={`/operators?office=${encodeURIComponent(office)}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-soft)] font-semibold text-[var(--ink)] hover:bg-[var(--gold-soft)] hover:text-[var(--gold-ink)] transition-colors"
                                >
                                  <Building2 className="w-3 h-3 text-[var(--gold)]" /> {office}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="font-bold text-[var(--ink-muted)] text-[11px] uppercase tracking-wider w-20 shrink-0 mt-1">Destinations:</span>
                            <div className="flex flex-wrap gap-1.5 flex-1">
                              {op.destinations.map((dest: string) => (
                                <Link
                                  key={dest}
                                  href={`/tours?country=${encodeURIComponent(dest)}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
                                >
                                  <MapPin className="w-3 h-3 text-[var(--gold)]" /> {dest}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Box */}
                      <div className="w-full md:w-auto md:min-w-[180px] flex flex-col justify-between items-stretch md:items-end gap-4 border-t md:border-t-0 md:border-l border-[var(--border-soft)] pt-4 md:pt-0 md:pl-6 self-stretch">
                        <div className="bg-[var(--surface-raised)] border border-[var(--border-soft)] p-3 rounded-xl text-center md:text-right w-full">
                          <span className="text-[11px] text-[var(--ink-muted)] uppercase font-bold tracking-wider block mb-0.5">Rates / Day</span>
                          <span className="text-base font-extrabold text-[var(--gold)] font-display">{op.priceRange}</span>
                          <span className="text-[10px] text-[var(--ink-secondary)] block font-medium">USD pp</span>
                        </div>

                        <div className="space-y-2 w-full">
                          <Link
                            href={`/operators/${op.slug}`}
                            className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
                          >
                            View Profile <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/tours?country=${encodeURIComponent(op.officesIn[0] || 'Tanzania')}`}
                            className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-1.5"
                          >
                            All {op.toursCount} Safaris
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
