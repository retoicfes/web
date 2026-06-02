import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Límite simple en memoria (por instancia). En producción escala usar Upstash/Vercel KV. */
export function rateLimit(
  req: NextRequest,
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const bucketKey = `${ip}:${key}`;
  const now = Date.now();
  let bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, bucket);
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true };
}

export function sanitizeApodo(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .replace(/[<>"'`\\]/g, "")
    .slice(0, 24);
}

export function sanitizeTexto(raw: unknown, max: number): string {
  return String(raw ?? "")
    .trim()
    .slice(0, max);
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
