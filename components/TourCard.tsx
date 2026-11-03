'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

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
    departures?: { total: number; open: number; nextOpen: string | null; seatsLeft: number };
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

export default function TourCard({ tour }: TourCardProps) {
  const bgImage = getTourImage(tour.primaryCountry, tour.slug);
  const destNames = tour.destinations.map((d) => d.destination.name).join(', ');
  const maxPrice = tour.minPriceUsd + Math.floor(tour.minPriceUsd * 0.15);
  const typeStr = tour.tourType === 'PRIVATE' ? 'Private tour' : 'Shared tour (max 7 people)';
  const comfortStr = tour.comfortLevel === 'MID_RANGE' ? 'Mid-range' : tour.comfortLevel === 'BUDGET' ? 'Budget' : 'Luxury';
  const accomStr = tour.inclusions[0] || 'Lodge & Tented Camp';
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/favorites');
        if (!res.ok) return;
        const data = await res.json();
        const ids = Array.isArray(data?.tours) ? data.tours.map((item: any) => item.id) : [];
        setIsFavorite(ids.includes(tour.id));
      } catch {
        setIsFavorite(false);
      }
    };

    load();
  }, [tour.id]);

  const toggleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setLoadingFavorite(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: tour.id }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const favorites = Array.isArray(data?.favorites) ? data.favorites : [];
      setIsFavorite(favorites.includes(tour.id));
      window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { count: favorites.length } }));
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <article className="surface-card surface-card-hover group/card flex flex-col overflow-hidden font-sans rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg border border-[var(--glass-border)]">
      <Link href={`/tours/${tour.slug}`} className="block group">
        {/* ── Photo Header ── */}
        <div className="relative h-[200px] sm:h-[220px] overflow-hidden bg-[var(--dark)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-95 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Accessible 40px favorite button */}
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-3.5 right-3.5 flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/70 bg-white/90 backdrop-blur-md shadow-sm transition hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[var(--brand)] text-[var(--brand)]' : 'text-[var(--ink-secondary)]'}`} />
          </button>

          {/* Departure pill badge */}
          {tour.departures && (
            <span
              className={`absolute top-3.5 left-3.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md max-w-[calc(100%-65px)] truncate backdrop-blur-md border ${
                tour.departures.total > 0 && tour.departures.open === 0
                  ? 'bg-red-700 text-white border-red-500'
                  : 'bg-white text-[var(--ink)] border-white/80'
              }`}
            >
              {tour.departures.total === 0
                ? 'Dates on request'
                : tour.departures.open === 0
                  ? 'Fully booked'
                  : `Next: ${new Date(`${tour.departures.nextOpen}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} · ${tour.departures.seatsLeft} seats`}
            </span>
          )}

          <div className="absolute bottom-3.5 left-4 right-4">
            <h3 className="text-white font-bold text-[19px] sm:text-[21px] leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] line-clamp-2">
              {tour.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Price & Duration */}
        <div className="mb-2.5 flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[var(--brand-deep)] font-extrabold text-[22px] sm:text-[25px] tracking-tight">
              ${tour.minPriceUsd.toLocaleString()}
            </span>
            <span className="text-[var(--ink)] font-bold text-sm sm:text-base">
              to ${maxPrice.toLocaleString()}
            </span>
            <span className="text-[var(--ink-secondary)] text-xs sm:text-[13px] font-bold ml-0.5">
              pp (USD)
            </span>
          </div>

          <span className="rounded-lg bg-[var(--brand-soft)] border border-[var(--brand)]/20 px-2.5 py-1 text-xs font-extrabold text-[var(--brand-ink)] shadow-2xs">
            {tour.durationDays}D / {tour.durationNights}N
          </span>
        </div>

        {/* Features */}
        <p className="text-sm sm:text-[14.5px] text-[var(--ink)] font-medium mb-2.5 leading-normal">
          <span className="font-extrabold text-[var(--brand-deep)]">{tour.primaryCountry}:</span>{' '}
          <span>{typeStr}</span> <span className="text-[var(--brand)] font-bold">•</span>{' '}
          <span>{comfortStr}</span> <span className="text-[var(--brand)] font-bold">•</span>{' '}
          <span>{accomStr}</span>
        </p>

        {/* Destinations */}
        <p className="text-sm text-[var(--ink-body)] line-clamp-2 mb-4 leading-relaxed flex-1">
          <strong className="font-bold text-[var(--ink)]">You Visit: </strong>
          <span className="font-medium text-[var(--ink)]">{destNames}</span>
        </p>

        {/* Divider & Operator Row */}
        <div className="mt-auto border-t border-[var(--border-soft)] -mx-4 -mb-1 px-4 pt-3 sm:-mx-5 sm:-mb-2 sm:px-5">
          <Link
            href={`/operators/${tour.operator.slug}`}
            className="group/op -mx-1.5 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/80"
          >
            <div className="flex h-9 w-10 sm:h-10 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-white shadow-2xs">
              <span className="text-[var(--brand-deep)] text-sm font-extrabold">{tour.operator.companyName.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm sm:text-base font-bold text-[var(--ink)] transition-colors group-hover/op:text-[var(--brand-ink)]">
                {tour.operator.companyName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <div className="flex text-[var(--gold)]">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-xs sm:text-sm">{star}</span>)}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[var(--ink)] ml-0.5">{tour.operator.averageRating}</span>
                <span className="text-xs sm:text-[13px] font-semibold text-[var(--ink-secondary)]">/5 · {tour.operator.totalReviews} Reviews</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
