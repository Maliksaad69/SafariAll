'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getClientFavoriteIds, updateClientFavorites } from '@/lib/favorites-client';

interface FavoriteHeartButtonProps {
  tourId: string;
  className?: string;
  iconClassName?: string;
}

export default function FavoriteHeartButton({
  tourId,
  className = 'absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors',
  iconClassName = 'w-5 h-5 text-white',
}: FavoriteHeartButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getClientFavoriteIds().then((ids) => {
      if (active) setIsFavorite(ids.includes(tourId));
    });
    return () => {
      active = false;
    };
  }, [tourId]);

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const favorites = Array.isArray(data?.favorites) ? data.favorites : [];
      updateClientFavorites(favorites);
      setIsFavorite(favorites.includes(tourId));
      window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { count: favorites.length } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
      onClick={toggleFavorite}
      disabled={loading}
      className={className}
    >
      <Heart className={`${iconClassName} ${isFavorite ? 'fill-[#ff4d4d] text-[#ff4d4d]' : ''}`} />
    </button>
  );
}
