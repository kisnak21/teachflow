import { RateLimit } from 'next-rate-limit'

// Max 10 requests per IP per 60 seconds — for auth endpoints
export const authRateLimit = new RateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60_000, // 1 minute
  limit: 10,
})

// Max 5 register attempts per IP per 60 seconds
export const registerRateLimit = new RateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60_000,
  limit: 5,
})
