import Link from 'next/link';
import { Award, ChevronRight, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface TopOperatorItem {
  name: string;
  slug: string;
  rating: number;
  reviews: string;
  image: string;
}

const OPERATOR_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
];

interface TopRatedOperatorsBannerProps {
  operators: TopOperatorItem[];
  totalOperatorsCount?: number;
}

export default function TopRatedOperatorsBanner({
  operators,
  totalOperatorsCount = 0,
}: TopRatedOperatorsBannerProps) {
  if (!operators || operators.length === 0) return null;
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#132220] text-white p-6 sm:p-8 md:p-10 border border-white/10 shadow-xs">
      {/* ── Banner Header Row ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-white/10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-[#E59E67] border border-white/10">
            <Award className="h-3.5 w-3.5 text-[#E59E67]" strokeWidth={1.5} />
            <span>Verified in-country operators</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold font-display text-white tracking-tight">
            Top Rated Safari Operators
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#D8DFDC] leading-relaxed">
            Partner directly with licensed in-country specialists who live and work across African safari circuits.
            Enjoy true local rates with direct traveler quotes and 24/7 on-the-ground support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/90 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#E59E67] shrink-0" strokeWidth={1.5} />
            <span>Guaranteed direct quotes</span>
          </div>

          <Link
            href="/safari-operators"
            className="btn bg-[#C9773B] hover:bg-[#B86930] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-lg shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Explore all {totalOperatorsCount.toLocaleString()} operators</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Operators Showcase Grid ── */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operators.map((op, idx) => {
          const bannerImage =
            (op.image && op.image.trim()) ||
            OPERATOR_FALLBACK_IMAGES[idx % OPERATOR_FALLBACK_IMAGES.length];

          return (
            <Link
              key={op.slug}
              href={`/operators/${op.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white/5 p-4 border border-white/10 transition-colors hover:bg-white/10 hover:border-white/20"
            >
              {/* Top Visual Vignette with Rank Badge */}
              <div className="relative h-32 sm:h-36 w-full rounded-lg overflow-hidden mb-3 bg-black/40">
                <img
                  src={bannerImage}
                  alt={op.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Rank Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-xs font-medium text-white border border-white/15">
                  <span className="tabular-nums">#{idx + 1}</span>
                </div>

                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#2A6B48] text-white" title="Verified License">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                </div>

                {/* Company Initials Avatar */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#1E433B] font-semibold text-xs border border-white">
                    {op.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-white/90">
                    Licensed outfitter
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#E59E67] transition-colors line-clamp-1">
                    {op.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-xs flex-wrap">
                    <div className="flex text-[#C9773B]" aria-hidden="true">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className="text-xs">{star}</span>
                      ))}
                    </div>
                    <span className="tabular-nums font-semibold text-white">{op.rating.toFixed(1)}</span>
                    <span className="tabular-nums text-white/70 text-xs">· {op.reviews}</span>
                  </div>
                </div>

                {/* Bottom Quick Action Strip */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-medium text-white/80 group-hover:text-white">
                  <span className="text-xs text-white/70">Direct quotes</span>
                  <span className="inline-flex items-center gap-1 text-white text-xs">
                    View tours <ChevronRight className="h-3 w-3 text-white" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
