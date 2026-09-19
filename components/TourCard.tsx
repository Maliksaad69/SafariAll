import Link from 'next/link';
import { MapPin, CheckCircle, Star, ArrowRight, Clock } from 'lucide-react';

interface TourCardProps {
  tour: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    durationNights: number;
    minPriceUsd: number;
    comfortLevel: string;
    tourType: string;
    primaryCountry: string;
    inclusions: string[];
    operator: {
      companyName: string;
      slug: string;
      isVerified: boolean;
      averageRating: number;
      totalReviews: number;
    };
    destinations: {
      destination: {
        name: string;
      };
    }[];
  };
}

function getTourImage(country: string, slug: string): string {
  if (slug.includes('serengeti') || country === 'Tanzania') {
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80';
  }
  if (slug.includes('mara') || country === 'Kenya') {
    return 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80';
  }
  if (slug.includes('bwindi') || country === 'Uganda') {
    return 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=80';
  }
  if (country === 'South Africa') {
    return 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80';
}

const comfortLabels: Record<string, string> = {
  BUDGET: 'Budget',
  MID_RANGE: 'Mid-Range',
  LUXURY: 'Luxury',
  FLY_IN: 'Fly-in',
};

const comfortColors: Record<string, { bg: string; color: string; border: string }> = {
  BUDGET: { bg: 'rgba(27,67,50,0.1)', color: '#2D6A4F', border: 'rgba(27,67,50,0.2)' },
  MID_RANGE: { bg: 'rgba(184,129,26,0.1)', color: '#8B6914', border: 'rgba(184,129,26,0.2)' },
  LUXURY: { bg: 'rgba(139,69,20,0.1)', color: '#7B3F0A', border: 'rgba(139,69,20,0.2)' },
  FLY_IN: { bg: 'rgba(28,17,8,0.07)', color: '#3D2B0F', border: 'rgba(28,17,8,0.15)' },
};

export default function TourCard({ tour }: TourCardProps) {
  const bgImage = getTourImage(tour.primaryCountry, tour.slug);
  const comfort = comfortColors[tour.comfortLevel] ?? comfortColors['MID_RANGE'];
  const comfortLabel = comfortLabels[tour.comfortLevel] ?? tour.comfortLevel;
  const destNames = tour.destinations.map((d) => d.destination.name).join(', ');

  return (
    <article className="tour-card group">
      {/* ── Photo Header ── */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-106"
          style={{
            backgroundImage: `url('${bgImage}')`,
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Gradient at bottom of image */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(28,17,8,0.5) 0%, transparent 60%)',
          }}
        />

        {/* Country label */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{
              background: 'rgba(250,247,240,0.88)',
              backdropFilter: 'blur(12px)',
              color: '#1C1108',
              fontFamily: 'var(--font-body)',
            }}
          >
            <MapPin className="w-3 h-3" style={{ color: '#B8811A' }} />
            {tour.primaryCountry}
          </span>
        </div>

        {/* Comfort level badge */}
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{
              background: 'rgba(250,247,240,0.88)',
              backdropFilter: 'blur(12px)',
              color: comfort.color,
              fontFamily: 'var(--font-body)',
            }}
          >
            {comfortLabel}
          </span>
        </div>

        {/* Duration bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white"
            style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: '#D4A235' }} />
            {tour.durationDays} days / {tour.durationNights} nights
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Title */}
        <div>
          <h3
            className="text-lg font-semibold leading-snug mb-1 transition-colors group-hover:text-[#B8811A]"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: '#1C1108' }}
          >
            {tour.title}
          </h3>
          <p
            className="text-xs truncate"
            style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
          >
            {destNames}
          </p>
        </div>

        {/* Inclusions */}
        {tour.inclusions.length > 0 && (
          <ul className="space-y-1.5">
            {tour.inclusions.slice(0, 3).map((inc, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs truncate"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B8811A' }} />
                <span className="truncate">{inc}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(228,219,202,0.7)' }} />

        {/* Operator row */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B8811A, #D4A235)', fontFamily: 'var(--font-body)' }}
          >
            {tour.operator.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div
              className="flex items-center gap-1.5 text-sm font-semibold leading-none truncate"
              style={{ color: '#1C1108', fontFamily: 'var(--font-body)' }}
            >
              {tour.operator.companyName}
              {tour.operator.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-[#D4A235] text-[#D4A235]" />
              <span
                className="text-xs font-semibold"
                style={{ color: '#8B6914', fontFamily: 'var(--font-body)' }}
              >
                {tour.operator.averageRating}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
              >
                ({tour.operator.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span
              className="block text-[10px] font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
            >
              From
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display), serif', color: '#B8811A' }}
              >
                ${tour.minPriceUsd.toLocaleString()}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}
              >
                /person
              </span>
            </div>
          </div>

          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #B8811A 0%, #D4A235 100%)',
              boxShadow: '0 4px 14px rgba(184,129,26,0.25)',
              fontFamily: 'var(--font-body)',
            }}
          >
            View Tour
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
