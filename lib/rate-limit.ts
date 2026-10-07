import { getSession } from "@/lib/auth/guards";
import { sql } from "@/lib/db";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "auth:login": { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "ratelimit:login" },
  "auth:register": { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "ratelimit:register" },
  "auth:verify": { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "ratelimit:verify" },
  "auth:forgot-password": { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "ratelimit:forgot" },
  "auth:reset-password": { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "ratelimit:reset" },
  "auth:resend": { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "ratelimit:resend" },
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

async function getClientIdentifier(): Promise<string> {
  const session = await getSession();
  if (session?.user?.id) {
    return `user:${session.user.id}`;
  }
  return `anon:${generateAnonymousId()}`;
}

function generateAnonymousId(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
}

export async function checkRateLimit(
  action: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[action];
  const identifier = await getClientIdentifier();
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();

  try {
    const result = await sql`
      WITH cleaned AS (
        DELETE FROM rate_limits
        WHERE key = ${key} AND expires_at < ${new Date(now)}
      )
      INSERT INTO rate_limits (key, count, expires_at)
      VALUES (${key}, 1, ${new Date(now + config.windowMs)})
      ON CONFLICT (key) DO UPDATE
      SET count = rate_limits.count + 1,
          expires_at = GREATEST(rate_limits.expires_at, EXCLUDED.expires_at)
      RETURNING count, expires_at
    `;

    const count = result[0]?.count ?? 1;
    const expiresAt = result[0]?.expires_at ? new Date(result[0].expires_at).getTime() : now + config.windowMs;

    if (count > config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: expiresAt,
        error: `Too many requests. Please try again later.`,
      };
    }

    return {
      success: true,
      remaining: config.maxRequests - count,
      resetTime: expiresAt,
    };
  } catch (err) {
    console.error(`[rate-limit:${action}] check failed:`, err);
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }
}

export function getRateLimitHeaders(action: keyof typeof RATE_LIMITS, result: RateLimitResult): Record<string, string> {
  const config = RATE_LIMITS[action];
  return {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };
}