import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = '1 m'
const RATE_LIMIT_PREFIX = 'portfolio-site:chat'

type RateLimitResult = {
  enabled: boolean
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT, RATE_LIMIT_WINDOW),
      prefix: RATE_LIMIT_PREFIX,
      analytics: true,
    })
  : null

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(',')
    if (firstIp) return firstIp.trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'anonymous'
}

export async function checkChatRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return {
      enabled: false,
      success: true,
      limit: RATE_LIMIT,
      remaining: RATE_LIMIT,
      reset: Date.now() + 60_000,
    }
  }

  const result = await ratelimit.limit(identifier)

  return {
    enabled: true,
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
