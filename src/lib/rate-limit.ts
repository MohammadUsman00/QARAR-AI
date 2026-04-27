import { createHash } from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitWindow>();

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  mode: "durable" | "memory";
};

function checkMemoryRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowKey = `${key}:${windowStart}`;
  const existing = buckets.get(windowKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = windowStart + windowMs;
    buckets.set(windowKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterSeconds: 0,
      mode: "memory",
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      mode: "memory",
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
    mode: "memory",
  };
}

export async function checkRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const fallback = () => checkMemoryRateLimit({ key, limit, windowMs });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NODE_ENV === "test"
  ) {
    return fallback();
  }

  try {
    const supabase = await createServiceRoleClient();
    const { data, error } = await supabase
      .rpc("increment_ai_rate_limit", {
        p_scope: scope,
        p_identifier_hash: key,
        p_window_start: new Date(windowStart).toISOString(),
        p_limit: limit,
      })
      .single<{ allowed: boolean; current_count: number }>();

    if (error || !data) {
      console.warn("rate limit rpc fallback", error);
      return fallback();
    }

    const remaining = Math.max(0, limit - data.current_count);
    return {
      allowed: data.allowed,
      limit,
      remaining,
      resetAt,
      retryAfterSeconds: data.allowed ? 0 : Math.ceil((resetAt - now) / 1000),
      mode: "durable",
    };
  } catch (error) {
    console.warn("rate limit durable check failed; using memory fallback", error);
    return fallback();
  }
}

export function rateLimitKey(
  scope: string,
  userId: string,
  request: Request,
): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const rawKey = `${scope}:${userId}:${forwardedFor ?? realIp ?? "unknown-ip"}`;
  return createHash("sha256").update(rawKey).digest("hex");
}
