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
