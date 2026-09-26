/**
 * A small sliding-window rate limiter kept in server memory.
 *
 * It is the first line of defence and needs no service: with Fluid Compute, function instances are
 * reused across requests, so repeated abuse from one client usually lands on a warm instance and is
 * counted. It is not global (each instance and region keeps its own counts, and a cold start begins
 * at zero), so production also uses the Vercel Firewall (see the Book a demo action), which is.
 *
 * Memory is bounded: expired entries are pruned as keys are touched, and the map is capped.
 */
type Window = { limit: number; windowMs: number };

const MAX_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs }: Window) {
  const hits = new Map<string, number[]>();

  /** Oldest keys first: Map keeps insertion order, and every hit re-inserts its key at the end. */
  const trim = () => {
    for (const key of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      hits.delete(key);
    }
  };

  const recentFor = (key: string, now: number) => (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  return {
    /** Whether one more hit for `key` would be allowed, without recording anything. */
    allows(key: string, now = Date.now()): boolean {
      return recentFor(key, now).length < limit;
    },

    /** Records a hit for `key`, for work that was actually done (use with `allows`). */
    record(key: string, now = Date.now()): void {
      const recent = recentFor(key, now);
      recent.push(now);
      hits.delete(key);
      hits.set(key, recent);
      trim();
    },

    /**
     * Records a hit for `key` unless it is over the limit. Returns whether it was allowed and, when
     * not, how many seconds until the oldest hit in the window expires.
     */
    take(key: string, now = Date.now()): { allowed: true } | { allowed: false; retryAfter: number } {
      const recent = recentFor(key, now);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfter: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }
      recent.push(now);
      hits.delete(key); // re-insert, so the key counts as the most recently used
      hits.set(key, recent);
      trim();
      return { allowed: true };
    },
  };
}

/**
 * The visitor's IP, as reported by the platform. On Vercel the edge sets x-real-ip and overwrites
 * x-forwarded-for, so neither can be spoofed by the client. Locally both may be missing.
 */
export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
