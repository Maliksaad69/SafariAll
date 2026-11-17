'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getClientFavoriteIds, updateClientFavorites } from '@/lib/favorites-client';

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
    let active = true;
    getClientFavoriteIds().then((ids) => {
      if (active) setIsFavorite(ids.includes(tour.id));
    });
    return () => {
      active = false;
    };
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
      updateClientFavorites(favorites);
      setIsFavorite(favorites.includes(tour.id));
      window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { count: favorites.length } }));
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <article className="surface-card surface-card-hover flex flex-col h-full overflow-hidden font-sans rounded-xl border border-[#E2DFD4] bg-white">
      <Link href={`/tours/${tour.slug}`} className="block group">
        {/* ── Photo Header ── */}
        <div className="relative h-[200px] sm:h-[220px] overflow-hidden bg-[#132220]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Accessible favorite button */}
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-3 right-3 flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-white/40 bg-white/90 backdrop-blur-sm shadow-xs transition-colors hover:bg-white disabled:opacity-60 cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C9773B] text-[#C9773B]' : 'text-[#6B7D79]'}`} />
          </button>

          {/* Departure tag */}
          {tour.departures && (
            <span
              className={`absolute top-3 left-3 rounded-md px-2.5 py-1 text-xs font-medium max-w-[calc(100%-60px)] truncate border backdrop-blur-sm ${
                tour.departures.total > 0 && tour.departures.open === 0
                  ? 'bg-[#A83838]/85 text-white border-white/20'
                  : 'bg-[#132220]/80 text-white border-white/20'
              }`}
            >
              {tour.departures.total === 0
                ? 'Dates on request'
                : tour.departures.open === 0
                  ? 'Fully booked'
                  : `Next: ${new Date(`${tour.departures.nextOpen}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} · ${tour.departures.seatsLeft} seats`}
            </span>
          )}

          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-semibold text-lg leading-snug line-clamp-2">
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
            <span className="tabular-nums text-[#182624] font-semibold text-xl tracking-tight">
              ${tour.minPriceUsd.toLocaleString()}
            </span>
            <span className="tabular-nums text-[#3D4D4A] font-normal text-sm">
              to ${maxPrice.toLocaleString()}
            </span>
            <span className="text-[#6B7D79] text-xs font-normal ml-0.5">
              pp (USD)
            </span>
          </div>

          <span className="tabular-nums rounded-md bg-[#EFECE4] border border-[#E2DFD4] px-2.5 py-0.5 text-xs font-medium text-[#182624]">
            {tour.durationDays}D / {tour.durationNights}N
          </span>
        </div>

        {/* Features */}
        <p className="text-sm text-[#3D4D4A] font-normal mb-2 leading-normal">
          <span className="font-semibold text-[#182624]">{tour.primaryCountry}:</span>{' '}
          <span>{typeStr}</span> <span className="text-[#8C9C98]">•</span>{' '}
          <span>{comfortStr}</span> <span className="text-[#8C9C98]">•</span>{' '}
          <span>{accomStr}</span>
        </p>

        {/* Destinations */}
        <p className="text-xs sm:text-[13px] text-[#6B7D79] line-clamp-2 mb-4 leading-relaxed flex-1">
          <span className="font-medium text-[#3D4D4A]">You visit: </span>
          <span>{destNames}</span>
        </p>

        {/* Divider & Operator Row */}
        <div className="mt-auto border-t border-[#E2DFD4] -mx-4 -mb-1 px-4 pt-3 sm:-mx-5 sm:-mb-2 sm:px-5">
          <Link
            href={`/operators/${tour.operator.slug}`}
            className="group/op flex items-center gap-3 rounded-lg py-1 transition-colors"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#E2DFD4] bg-[#F7F5F0]">
              <span className="text-[#1E433B] text-xs font-semibold">{tour.operator.companyName.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs sm:text-sm font-semibold text-[#182624] group-hover/op:text-[#1E433B] transition-colors">
                {tour.operator.companyName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <div className="flex text-[#C9773B]">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-xs">{star}</span>)}
                </div>
                <span className="tabular-nums text-xs font-semibold text-[#182624] ml-0.5">{tour.operator.averageRating}</span>
                <span className="tabular-nums text-xs text-[#6B7D79]">/5 · {tour.operator.totalReviews} reviews</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
