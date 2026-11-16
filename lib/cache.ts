interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Fetch from in-memory cache if fresh, otherwise call `fn()`, cache the result, and return it.
 * @param key Unique cache key
 * @param ttlSeconds Time-to-live in seconds
 * @param fn Async factory function
 */
export async function withMemoryCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const entry = memoryCache.get(key);
  const now = Date.now();
  if (entry && entry.expiresAt > now) {
    return entry.data;
  }
  const result = await fn();
  memoryCache.set(key, { data: result, expiresAt: now + ttlSeconds * 1000 });
  return result;
}

/** Invalidate cache entries by prefix or exact key */
export function invalidateMemoryCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k);
    }
  }
}
