import { redis } from './redis';

/**
 * Generic cache-aside helper.
 * Checks Redis first; on miss, calls `fetcher`, stores the result with a TTL, and returns it.
 *
 * @param key   - Redis key (e.g. "homepage:articles")
 * @param fetcher - async function that produces the fresh value
 * @param ttl   - time-to-live in seconds (default 300 = 5 minutes)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Redis unavailable — fall through to fetcher
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, fresh, { ex: ttl });
  } catch {
    // Silently skip caching if Redis is down
  }

  return fresh;
}

/**
 * Invalidate one or more cache keys.
 */
export async function clearCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently ignore
  }
}
