'use client';

let cachedFavoriteIds: string[] | null = null;
let pendingFavoritesPromise: Promise<string[]> | null = null;

/**
 * Fetch favorite tour IDs once and share the promise across all TourCard and FavoriteButton components.
 */
export async function getClientFavoriteIds(): Promise<string[]> {
  if (cachedFavoriteIds !== null) return cachedFavoriteIds;
  if (pendingFavoritesPromise) return pendingFavoritesPromise;

  pendingFavoritesPromise = fetch('/api/favorites')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const ids = Array.isArray(data?.tours) ? data.tours.map((item: any) => item.id) : [];
      cachedFavoriteIds = ids;
      pendingFavoritesPromise = null;
      return ids;
    })
    .catch(() => {
      pendingFavoritesPromise = null;
      return [];
    });

  return pendingFavoritesPromise;
}

export function updateClientFavorites(newIds: string[]) {
  cachedFavoriteIds = newIds;
}
