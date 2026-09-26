import { createRateLimiter } from "./rate-limit";

/**
 * Abuse guards for the Book a demo action, kept apart from the action so they can be tested.
 *
 * - Per IP: every attempt counts (valid or not), so nobody can hammer the endpoint.
 * - Per email: checked after validation and recorded only once the team email has gone out, so one
 *   inbox can't be flooded with confirmations from many IPs, while a failed send (an outage) never
 *   locks a real person out.
 * Limits are generous for real people: a demo request is normally sent once.
 */
export const ipLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
export const emailLimiter = createRateLimiter({ limit: 3, windowMs: 60 * 60_000 });

/**
 * True when the request carries a browser Origin header matching this site's host. Next.js already
 * rejects a mismatched Origin for Server Actions, but lets a request with no Origin through (with a
 * warning). Browsers always send Origin on these POSTs, so a missing one means a script: reject it.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
