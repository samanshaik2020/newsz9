import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Cache outages should fall back to the database promptly, without SDK retries.
export const redis = url && token && !url.includes("your_") && !token.includes("your_")
  ? new Redis({
      url,
      token,
      retry: false,
      signal: () => AbortSignal.timeout(500),
    })
  : null;
