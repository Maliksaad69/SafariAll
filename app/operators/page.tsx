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
    <div className="min-h-screen flex flex-col bg-[#f5f1ea] text-[#333] font-sans">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-10">
        <div className="bg-[#efe7db] border-b border-[#e4dbc9] py-8">
          <div className="max-w-[1230px] mx-auto px-4">
            <nav className="text-[12px] text-[#6b5130] uppercase tracking-[0.12em] font-semibold mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
              <span>You are here:</span>
              <Link href="/" className="text-[var(--brand-ink)] hover:underline normal-case">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#2d1a12] normal-case">Tour Operators</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-[38px] md:text-[52px] leading-none text-[#1d1a18] tracking-[-0.05em]" style={{ fontFamily: 'Georgia, serif' }}>
                  Safari Tour Operators
                </h1>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto bg-white/80 border border-[#e0d4bb] rounded-full px-4 py-2 text-[13px] font-bold text-[#2d1a12] shadow-sm">
                <Star className="w-4 h-4 fill-[#f4b400] text-[#f4b400]" />
                Verified local specialists
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar */}
            <div className="lg:w-[300px] flex-shrink-0">
              <div>
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
              <div className="mb-4">
                <h2 className="text-[28px] font-bold text-[#333] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Safari Tour Operators
                </h2>

                <div className="text-[13px] text-[#555]">
                  <strong className="text-[#333]">{operators.length} operators</strong> matching your filters{params.search ? ` for “${params.search}”` : ''}. All licensed and verified.
                </div>
              </div>

              {/* Operators List */}
              <div className="space-y-4 mb-8">
                {operators.length === 0 ? (
                  <div className="rounded border border-dashed border-[#c9c9c9] bg-white p-8 text-center text-[#555]">
                    <p className="font-bold text-[#333] mb-1">No operators match your filters.</p>
                    <p className="text-[13px]">Try removing a filter or <Link href="/operators" className="text-[var(--brand-ink)] hover:underline">view all operators</Link>.</p>
                  </div>
                ) : (
                  operators.map((op) => (
                  <div key={op.id} className="bg-white border border-[#d5d5d5] rounded-sm flex flex-col md:flex-row p-4 relative shadow-sm hover:border-[#b8b8b8] transition-colors">

                    {/* Image */}
                    <div className="w-full h-[160px] md:w-[180px] md:h-[130px] bg-gray-100 flex-shrink-0 md:mr-5 mb-4 md:mb-0 rounded-sm overflow-hidden">
                      <img src={op.image} alt={op.companyName} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between pt-1 md:pt-0 min-w-0">

                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <Link href={`/operators/${op.slug}`} className="text-[18px] font-bold text-[var(--brand-ink)] hover:underline">
                            {op.companyName}
                          </Link>

                          <div className="flex items-center gap-1.5 mt-1 text-[13px] flex-wrap">
                            <span className="flex" aria-hidden="true">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(op.averageRating) ? 'fill-[#ffc107] text-[#ffc107]' : 'fill-[#ddd] text-[#ddd]'}`} />
                              ))}
                            </span>
                            <span className="font-bold text-[#333]">{op.averageRating.toFixed(1)}</span>
                            <span className="text-[#8a8a8a]">/5 - {op.totalReviews} Reviews</span>
                            {op.isVerified && (
                              <span className="ml-1 rounded-full bg-[#e7f2e7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2e6a34]">Verified</span>
                            )}
                          </div>
                        </div>

                        {/* Logo */}
                        <div className="w-[64px] h-[64px] bg-white rounded-full border border-[#eee] flex-shrink-0 hidden md:flex items-center justify-center overflow-hidden">
                          <img src={op.logo} alt={`${op.companyName} Logo`} className="w-full h-full object-cover rounded-full" />
                        </div>
                      </div>

                      <div className="mt-3 text-[13px] text-[#444] space-y-1">
                        <div className="flex flex-wrap">
                          <span className="w-[100px] text-[#8a8a8a] shrink-0">Offices In:</span>
                          <span className="flex-1 flex gap-2 flex-wrap">
                            {op.officesIn.map((c: string) => (
                              <Link key={c} href={`/operators?office=${encodeURIComponent(c)}`} className="inline-flex items-center gap-1 text-[var(--brand-ink)] hover:underline"><Building2 className="h-3 w-3" /> {c}</Link>
                            ))}
                          </span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="w-[100px] text-[#8a8a8a] shrink-0">Price Range:</span>
                          <span className="flex-1 font-bold">{op.priceRange} <span className="font-normal text-[#555]">per person per day (USD)</span></span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="w-[100px] text-[#8a8a8a] shrink-0">Tour Types:</span>
                          <span className="flex-1">{op.tourTypes}</span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="w-[100px] text-[#8a8a8a] shrink-0">Destinations:</span>
                          <span className="flex-1 flex gap-2 flex-wrap">
                            {op.destinations.map((d: string) => (
                              <Link key={d} href={`/tours?country=${encodeURIComponent(d)}`} className="inline-flex items-center gap-1 text-[var(--brand-ink)] hover:underline"><MapPin className="h-3 w-3" /> {d}</Link>
                            ))}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#f0f0f0] text-[13px]">
                        <ul className="space-y-1 mb-3">
                          {op.topTours.map((t: any, i: number) => (
                            <li key={i}>
                              <Link href={`/tours?country=${encodeURIComponent(op.officesIn[0] || 'Tanzania')}`} className="text-[var(--brand-ink)] hover:underline mr-1">{t.name}</Link>
                              <span className="text-[#8a8a8a]">(from {t.price})</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                          <Link href={`/operators/${op.slug}`} className="bg-[#f4c45b] text-[#2d1a12] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 hover:brightness-105 transition">
                            View Operator <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Link href={`/tours?country=${encodeURIComponent(op.officesIn[0] || 'Tanzania')}`} className="border border-[var(--brand-ink)] text-[var(--brand-ink)] font-bold px-3 py-1.5 rounded-sm hover:bg-[var(--brand-soft)] transition flex items-center gap-1">
                            All {op.toursCount} Tours <ChevronRight className="w-3 h-3" />
                          </Link>
                          <span className="text-[#8a8a8a]">- Offered by {op.companyName}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                  ))
                )}
              </div>

              {/* Pagination (single page of results) */}
              <div className="flex justify-center items-center gap-2 text-[14px]" aria-hidden="true">
                <span className="px-3 py-1.5 text-[#b5b5b5]">&lt; Prev</span>
                <span className="px-3 py-1.5 font-bold text-[#333] border border-[#ccc] bg-white rounded-sm">1</span>
                <span className="px-3 py-1.5 text-[#b5b5b5]">Next &gt;</span>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
