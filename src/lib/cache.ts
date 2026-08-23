import { redis } from './redis';

type MemoryCacheEntry = {
  expiresAt: number;
  value: unknown;
};

const memoryCache = new Map<string, MemoryCacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const memoryCacheTtlSeconds = 30;

function readMemoryCache<T>(key: string): T | undefined {
  const entry = memoryCache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }

  return entry.value as T;
}

function writeMemoryCache<T>(key: string, value: T, ttl: number) {
  memoryCache.set(key, {
    expiresAt: Date.now() + Math.min(ttl, memoryCacheTtlSeconds) * 1000,
    value,
  });
}

function matchesCachePattern(key: string, pattern: string) {
  if (!pattern.includes("*")) return key === pattern;

  const [prefix, suffix] = pattern.split("*", 2);
  return key.startsWith(prefix) && key.endsWith(suffix ?? "");
}

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
  const memoryValue = readMemoryCache<T>(key);
  if (memoryValue !== undefined) return memoryValue;

  const inFlight = inFlightRequests.get(key) as Promise<T> | undefined;
  if (inFlight) return inFlight;

  const request = (async () => {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) {
        writeMemoryCache(key, cached, ttl);
        return cached;
      }
    } catch {
      // Redis unavailable — fall through to fetcher
    }

    const fresh = await fetcher();
    writeMemoryCache(key, fresh, ttl);

    try {
      await redis.set(key, fresh, { ex: ttl });
    } catch {
      // Silently skip caching if Redis is down
    }

    return fresh;
  })();

  inFlightRequests.set(key, request);

  try {
    return await request;
  } finally {
    if (inFlightRequests.get(key) === request) {
      inFlightRequests.delete(key);
    }
  }
}

/**
 * Invalidate one or more cache keys.
 */
export async function clearCache(...keys: string[]): Promise<void> {
  keys.forEach((key) => memoryCache.delete(key));

  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently ignore
  }
}

/**
 * Invalidate all cache keys matching one or more Redis glob patterns.
 */
export async function clearCacheByPattern(...patterns: string[]): Promise<string[]> {
  const keys = new Set<string>();

  for (const key of memoryCache.keys()) {
    if (patterns.some((pattern) => matchesCachePattern(key, pattern))) {
      memoryCache.delete(key);
      keys.add(key);
    }
  }

  try {
    for (const pattern of patterns) {
      let cursor = "0";

      do {
        const [nextCursor, matchedKeys] = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        matchedKeys.forEach((key) => keys.add(key));
        cursor = nextCursor;
      } while (cursor !== "0");
    }

    if (keys.size > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently ignore
  }

  return [...keys];
}

export async function clearCategoryCaches(...categorySlugs: Array<string | null | undefined>) {
  const exactKeys = new Set(["categories:all"]);

  for (const slug of categorySlugs) {
    if (slug) {
      exactKeys.add(`category:${slug}`);
      exactKeys.add(`category:${slug}:all`);
      exactKeys.add(`category:${slug}:en`);
      exactKeys.add(`category:${slug}:te`);
      exactKeys.add(`category:articles:v2:${slug}:all`);
      exactKeys.add(`category:articles:v2:${slug}:en`);
      exactKeys.add(`category:articles:v2:${slug}:te`);
    }
  }

  await clearCache(...exactKeys);
  return [...exactKeys];
}

export async function clearBreakingNewsCaches() {
  await clearCache("breaking:news");
  return ["breaking:news"];
}

export async function clearArticleCaches({
  slug,
  previousSlug,
  categorySlug,
  previousCategorySlug,
  includeBreakingNews = false,
}: {
  slug?: string | null;
  previousSlug?: string | null;
  categorySlug?: string | null;
  previousCategorySlug?: string | null;
  includeBreakingNews?: boolean;
} = {}): Promise<string[]> {
  const exactKeys = new Set([
    "homepage:articles:12",
    "homepage:articles:20",
    "trending:articles:5",
  ]);

  for (const articleSlug of [slug, previousSlug]) {
    if (articleSlug) exactKeys.add(`article:${articleSlug}`);
  }

  for (const articleCategorySlug of [categorySlug, previousCategorySlug]) {
    if (articleCategorySlug) {
      exactKeys.add(`category:${articleCategorySlug}`);
      exactKeys.add(`category:${articleCategorySlug}:all`);
      exactKeys.add(`category:${articleCategorySlug}:en`);
      exactKeys.add(`category:${articleCategorySlug}:te`);
      exactKeys.add(`category:articles:v2:${articleCategorySlug}:all`);
      exactKeys.add(`category:articles:v2:${articleCategorySlug}:en`);
      exactKeys.add(`category:articles:v2:${articleCategorySlug}:te`);
    }
  }

  if (includeBreakingNews) {
    exactKeys.add("breaking:news");
  }

  await clearCache(...exactKeys);
  const patternKeys = await clearCacheByPattern(
    "homepage:articles:*",
    "trending:articles:*",
  );

  return [...new Set([...exactKeys, ...patternKeys])];
}
