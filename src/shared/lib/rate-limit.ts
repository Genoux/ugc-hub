// Simple in-memory rate limiter for API routes
// Note: This works for single-instance deployments. For production with multiple
// instances, use a distributed solution like @upstash/ratelimit with Redis.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  options: { limit: number; windowMs: number } = { limit: 10, windowMs: 10000 },
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / options.windowMs)}`;

  const entry = store.get(key);

  if (!entry) {
    // First request in this window
    const resetTime = now + options.windowMs;
    store.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: resetTime,
    };
  }

  if (entry.count >= options.limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    reset: entry.resetTime,
  };
}
