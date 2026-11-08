/**
 * Very small fixed-window rate limiter.
 *
 * This lives in module memory, so it is per serverless instance rather than
 * global. It is meant to stop runaway clients and accidental polling loops
 * from burning Gmail API quota / Fluid Active CPU, not as a hard security
 * boundary. Vercel Firewall rules can add an edge-level layer if needed.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return ip;
}

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  request: Request,
  scope: string,
  maxRequests = 60,
  windowMs = 60_000
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const key = `${scope}:${getClientKey(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > MAX_BUCKETS) prune(now);
    return { limited: false, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > maxRequests) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { limited: false, retryAfter: 0 };
}
