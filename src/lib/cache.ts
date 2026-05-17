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

/**
 * Invalidate all cache keys matching one or more Redis glob patterns.
 */
export async function clearCacheByPattern(...patterns: string[]): Promise<string[]> {
  const keys = new Set<string>();

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
    if (slug) exactKeys.add(`category:${slug}`);
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
    if (articleCategorySlug) exactKeys.add(`category:${articleCategorySlug}`);
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
