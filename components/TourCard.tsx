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
    <article className="surface-card surface-card-hover group/card flex flex-col overflow-hidden font-sans">
      <Link href={`/tours/${tour.slug}`} className="block group">
        {/* ── Photo Header ── */}
        <div className="relative h-[205px] overflow-hidden bg-[var(--dark)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-95 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-3 right-3 rounded-full border border-white/60 bg-white/75 p-1.5 backdrop-blur-md transition hover:scale-105 hover:bg-white disabled:opacity-60"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[var(--brand)] text-[var(--brand)]' : 'text-[var(--ink-secondary)]'}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-[20px] leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              {tour.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Price */}
        <div className="mb-2 flex items-baseline gap-1.5">
          <span className="text-[var(--success)] font-extrabold text-[21px] tracking-tight">
            ${tour.minPriceUsd.toLocaleString()}
          </span>
          <span className="text-[var(--ink-secondary)] font-bold text-[14px]">
            to ${maxPrice.toLocaleString()}
          </span>
          <span className="text-[var(--ink-muted)] text-[12px] ml-0.5">
            pp (USD)
          </span>
        </div>

        {/* Features */}
        <p className="text-[13px] text-[var(--ink-body)] mb-2 leading-snug">
          <span className="font-bold text-[var(--ink)]">{tour.primaryCountry}:</span> {typeStr} • {comfortStr} • {accomStr}
        </p>

        {/* Destinations */}
        <p className="text-[12px] text-[var(--ink-muted)] line-clamp-2 mb-4 leading-snug flex-1">
          <strong className="text-[var(--ink-body)]">You Visit:</strong> {destNames}
        </p>

        {/* Divider */}
        <div className="mt-auto border-t border-[var(--border-soft)] -mx-4 px-4 pt-3">
          {/* Operator row — clickable link to operator profile */}
          <Link href={`/operators/${tour.operator.slug}`} className="group/op -mx-1 flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-white/60">
            <div className="flex h-8 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/70">
              <span className="text-[var(--ink-muted)] text-[11px] font-extrabold">{tour.operator.companyName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-[var(--ink)] transition-colors group-hover/op:text-[var(--brand-ink)] group-hover/op:underline">
                {tour.operator.companyName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex text-[var(--gold)]">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-[11px]">{star}</span>)}
                </div>
                <span className="text-[11px] font-bold text-[var(--ink)] ml-0.5">{tour.operator.averageRating}</span>
                <span className="text-[11px] text-[var(--ink-muted)]">/5 - {tour.operator.totalReviews} Reviews</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
