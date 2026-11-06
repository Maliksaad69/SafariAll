import Link from 'next/link';
import { Award, ChevronRight, Star, ShieldCheck, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

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
  totalOperatorsCount = 120,
}: TopRatedOperatorsBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#214446] text-white p-4 sm:p-6 md:p-10 border border-[#193A38] shadow-md">
      {/* ── Banner Header Row ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-white/15">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
            <Award className="h-3.5 w-3.5 text-white" />
            <span>100% Vetted Local Outfitters</span>
          </div>

          <h2 className="mt-2.5 text-[22px] sm:text-3xl md:text-4xl font-bold font-display text-white tracking-tight leading-snug">
            Top Rated Tour Operators
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            Partner directly with licensed in-country specialists who live and breathe African wildlife.
            Enjoy true local rates with zero commission markups and 24/7 on-the-ground safari backup.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/15">
            <ShieldCheck className="h-4 w-4 text-white shrink-0" />
            <span>Guaranteed Direct Quotes</span>
          </div>

          <Link
            href="/safari-operators"
            className="btn btn-secondary inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold bg-[#E4DBB4] hover:bg-[#D8CDA1] text-[#193A38] shadow-sm transition-all active:scale-95 w-full sm:w-auto border-transparent"
          >
            <span>Explore All {totalOperatorsCount.toLocaleString()} Operators</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Operators Showcase Grid (Responsive Grid) ── */}
      <div className="relative z-10 mt-5 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {operators.map((op, idx) => {
          const bannerImage =
            (op.image && op.image.trim()) ||
            OPERATOR_FALLBACK_IMAGES[idx % OPERATOR_FALLBACK_IMAGES.length];

          return (
            <Link
              key={op.slug}
              href={`/operators/${op.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 p-3.5 sm:p-5 backdrop-blur-md border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:border-white/50 active:scale-[0.99]"
            >
              {/* Top Visual Vignette with Rank Badge */}
              <div className="relative h-28 sm:h-36 w-full rounded-lg sm:rounded-xl overflow-hidden mb-3 bg-black/40">
                <img
                  src={bannerImage}
                  alt={op.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Rank / Verified Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                  <Sparkles className="h-2.5 w-2.5 text-white fill-white" />
                  <span>Rank #{idx + 1}</span>
                </div>

                <div className="absolute top-2 right-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-xs" title="Verified License">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                {/* Company Initials Avatar floating at bottom edge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 sm:gap-2">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white/95 text-[#214446] font-extrabold text-xs sm:text-sm shadow-md border border-white">
                    {op.name.charAt(0)}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 drop-shadow uppercase tracking-wide">
                    Licensed Outfitter
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] sm:text-[17px] font-bold text-white group-hover:text-white transition-colors line-clamp-1 font-display">
                    {op.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
                    <div className="flex text-amber-300" aria-hidden="true">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className="text-[11px] sm:text-xs">{star}</span>
                      ))}
                    </div>
                    <span className="font-bold text-white">{op.rating.toFixed(1)}</span>
                    <span className="text-white/80 text-[10.5px] sm:text-[11px]">· {op.reviews}</span>
                  </div>
                </div>

                {/* Bottom Quick Action Strip */}
                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/90 group-hover:text-white">
                  <span className="text-[10.5px] sm:text-[11px] text-white/80">Direct Quotes</span>
                  <span className="inline-flex items-center gap-1 text-white group-hover:translate-x-0.5 transition-transform text-xs font-bold">
                    View Tours <ChevronRight className="h-3 w-3 text-white" />
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
