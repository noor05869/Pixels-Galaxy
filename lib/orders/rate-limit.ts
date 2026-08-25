import "server-only";

type AttemptWindow = {
  timestamps: number[];
};

type RateLimiterOptions = {
  limit?: number;
  windowMs?: number;
  maxEntries?: number;
  now?: () => number;
};

export function createMemoryRateLimiter(options: RateLimiterOptions = {}): {
  attempt(key: string): boolean;
} {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 10 * 60 * 1_000;
  const maxEntries = options.maxEntries ?? 10_000;
  const now = options.now ?? Date.now;
  const attempts = new Map<string, AttemptWindow>();

  function pruneExpired(currentTime: number): void {
    const cutoff = currentTime - windowMs;
    for (const [key, window] of attempts) {
      window.timestamps = window.timestamps.filter((timestamp) => timestamp > cutoff);
      if (window.timestamps.length === 0) attempts.delete(key);
    }
  }

  return {
    attempt(key) {
      const currentTime = now();
      pruneExpired(currentTime);

      const existing = attempts.get(key);
      if (existing) {
        if (existing.timestamps.length >= limit) return false;
        existing.timestamps.push(currentTime);
        return true;
      }

      // Fail closed for unseen clients when the bounded map is saturated.
      if (attempts.size >= maxEntries) return false;
      attempts.set(key, { timestamps: [currentTime] });
      return true;
    },
  };
}
