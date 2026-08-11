import rateLimit from 'next-rate-limit'

// Auth endpoints: max 10 requests per IP per 60 seconds
export const authRateLimit = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60_000,
})

// Register endpoint: max 5 attempts per IP per 60 seconds
export const registerRateLimit = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60_000,
})

/** In-memory per-key rate limiter for server actions (no Request object). */
export class KeyedRateLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private max: number,
    private windowMs: number
  ) {}

  /** Throws if `key` exceeds the limit within the sliding window. */
  check(key: string): void {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const recent = (this.hits.get(key) ?? []).filter((t) => t > windowStart)
    if (recent.length >= this.max) {
      throw new Error('Too many requests. Please try again later.')
    }
    recent.push(now)
    this.hits.set(key, recent)
  }
}

// AI generation: max 10 per teacher per 60 seconds (Groq cost guard)
export const aiRateLimit = new KeyedRateLimiter(10, 60_000)
