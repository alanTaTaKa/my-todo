import type { MiddlewareHandler } from 'hono'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10000

function clientIp(forwardedFor: string | undefined, realIp: string | undefined): string {
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }
  if (realIp) return realIp.trim()
  return 'unknown'
}

export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { windowMs, max, message = '请求过于频繁，请稍后再试' } = options

  return async (c, next) => {
    const now = Date.now()
    if (buckets.size > MAX_BUCKETS) buckets.clear()

    const ip = clientIp(
      c.req.header('x-forwarded-for'),
      c.req.header('x-real-ip'),
    )
    const key = `${c.req.method}:${c.req.path}:${ip}`
    const bucket = buckets.get(key)

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
    } else if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      c.header('Retry-After', String(retryAfter))
      return c.json({ error: message }, 429)
    } else {
      bucket.count += 1
    }

    await next()
    return undefined
  }
}
