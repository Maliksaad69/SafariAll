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
    <article className="bg-white rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col font-sans border border-[#e1e1e1]">
      <Link href={`/tours/${tour.slug}`} className="block group">
        {/* ── Photo Header ── */}
        <div className="relative h-[200px] overflow-hidden bg-[#222]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow transition hover:scale-105 disabled:opacity-60"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#ff4d4d] text-[#ff4d4d]' : 'text-[#8a8a8a]'}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-[20px] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {tour.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-[#35792c] font-bold text-[20px]">
            ${tour.minPriceUsd.toLocaleString()}
          </span>
          <span className="text-[#333] font-bold text-[15px]">
            {' '}to ${maxPrice.toLocaleString()}
          </span>
          <span className="text-[#666] text-[12px] ml-1">
            pp (USD)
          </span>
        </div>

        {/* Features */}
        <p className="text-[13px] text-[#444] mb-2 leading-snug">
          <span className="font-bold">{tour.primaryCountry}:</span> {typeStr} • {comfortStr} • {accomStr}
        </p>

        {/* Destinations */}
        <p className="text-[12px] text-[#666] line-clamp-2 mb-4 leading-snug flex-1">
          <strong className="text-[#444]">You Visit:</strong> {destNames}
        </p>

        {/* Divider */}
        <div className="border-t border-[#eee] -mx-4 px-4 pt-3 mt-auto">
          {/* Operator row — clickable link to operator profile */}
          <Link href={`/operators/${tour.operator.slug}`} className="flex items-center gap-3 group/op rounded-sm -mx-1 px-1 py-1 hover:bg-[#fafafa] transition-colors">
            <div className="w-10 h-7 border border-[#ddd] bg-[#f9f9f9] flex items-center justify-center flex-shrink-0">
              <span className="text-[#8a8a8a] text-[10px] font-bold">{tour.operator.companyName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#333] group-hover/op:text-[#0070c0] group-hover/op:underline truncate transition-colors">
                {tour.operator.companyName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex text-[#ffc107]">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-[11px]">{star}</span>)}
                </div>
                <span className="text-[11px] font-bold text-[#333] ml-0.5">{tour.operator.averageRating}</span>
                <span className="text-[11px] text-[#666]">/5 - {tour.operator.totalReviews} Reviews</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
