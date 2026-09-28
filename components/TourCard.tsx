'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react';

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

export default function TourCard({ tour }: TourCardProps) {
  const bgImage = getTourImage(tour.primaryCountry, tour.slug);
  const destNames = tour.destinations.map((d) => d.destination.name).join(', ');
  const maxPrice = tour.minPriceUsd + Math.floor(tour.minPriceUsd * 0.15);
  const typeStr = tour.tourType === 'PRIVATE' ? 'Private Tour' : 'Shared Group';
  const comfortStr = tour.comfortLevel === 'MID_RANGE' ? 'Mid-Range' : tour.comfortLevel === 'BUDGET' ? 'Budget' : 'Luxury';
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
    <article className="surface-card surface-card-hover bg-white rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col font-sans transition-all duration-300 group hover:shadow-xl hover:border-amber-400/40">
      <Link href={`/tours/${tour.slug}`} className="block relative">
        {/* ── Photo Header ── */}
        <div className="relative h-[220px] overflow-hidden bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center img-zoom-hover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <span className="badge bg-stone-900/80 backdrop-blur-md text-amber-300 font-bold px-3 py-1.5 text-xs rounded-xl border border-stone-700/50 shadow-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {tour.durationDays} Days / {tour.durationNights} Nights
            </span>
            {tour.operator.isVerified && (
              <span className="badge bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/40 font-bold px-2.5 py-1 text-xs rounded-xl shadow-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-md transition-all hover:scale-110 hover:bg-white disabled:opacity-60 z-10 cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'}`} />
          </button>

          {/* Title on card image gradient */}
          <div className="absolute bottom-3.5 left-4 right-4 z-10">
            <h3 className="text-white font-extrabold text-[19px] leading-snug drop-shadow-md font-display group-hover:text-amber-200 transition-colors line-clamp-2">
              {tour.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Price & Comfort level */}
        <div className="mb-3.5 flex items-end justify-between border-b border-[var(--border-soft)] pb-3">
          <div>
            <span className="text-xs text-[var(--ink-muted)] block font-semibold uppercase tracking-wider mb-0.5">From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[var(--gold)] font-extrabold text-[24px] tracking-tight font-display">
                ${tour.minPriceUsd.toLocaleString()}
              </span>
              <span className="text-[var(--ink-secondary)] font-medium text-[13px]">
                - ${maxPrice.toLocaleString()}
              </span>
              <span className="text-[var(--ink-muted)] text-[11px] uppercase font-bold">
                pp
              </span>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {comfortStr}
          </span>
        </div>

        {/* Attribute Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--ink-body)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
            {tour.primaryCountry}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--ink-body)]">
            {typeStr}
          </span>
        </div>

        {/* Destinations visited */}
        <p className="text-[12.5px] text-[var(--ink-secondary)] line-clamp-2 mb-4 leading-relaxed flex-1">
          <strong className="text-[var(--ink)] font-bold">Visits:</strong> {destNames}
        </p>

        {/* Operator Info Row & View Tour Link */}
        <div className="border-t border-[var(--border-soft)] pt-3.5 mt-auto flex items-center justify-between gap-3">
          <Link href={`/operators/${tour.operator.slug}`} className="flex items-center gap-2.5 group/op min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--gold-soft)] border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-[var(--gold-ink)] font-bold text-xs shadow-2xs">
              {tour.operator.companyName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold text-[var(--ink)] group-hover/op:text-[var(--gold)] truncate transition-colors">
                {tour.operator.companyName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-[11px] font-bold text-[var(--ink)]">{tour.operator.averageRating}</span>
                <span className="text-[11px] text-[var(--ink-secondary)]">({tour.operator.totalReviews})</span>
              </div>
            </div>
          </Link>

          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex items-center gap-1 text-[12.5px] font-extrabold text-[var(--gold)] hover:text-amber-700 transition-colors flex-shrink-0 group/link"
          >
            Details <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
