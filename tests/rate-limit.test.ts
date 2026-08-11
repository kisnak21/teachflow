import { describe, it, expect, vi } from 'vitest'
import { KeyedRateLimiter } from '@/lib/rate-limit'

describe('KeyedRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = new KeyedRateLimiter(3, 60_000)
    expect(() => {
      limiter.check('user-1')
      limiter.check('user-1')
      limiter.check('user-1')
    }).not.toThrow()
  })

  it('throws once the limit is exceeded', () => {
    const limiter = new KeyedRateLimiter(2, 60_000)
    limiter.check('user-1')
    limiter.check('user-1')
    expect(() => limiter.check('user-1')).toThrow()
  })

  it('tracks keys independently', () => {
    const limiter = new KeyedRateLimiter(1, 60_000)
    limiter.check('user-a')
    expect(() => limiter.check('user-a')).toThrow()
    expect(() => limiter.check('user-b')).not.toThrow()
  })

  it('resets after the window elapses', () => {
    const limiter = new KeyedRateLimiter(1, 10)
    limiter.check('user-1')
    expect(() => limiter.check('user-1')).toThrow()
    vi.waitFor(() => {
      expect(() => limiter.check('user-1')).not.toThrow()
    })
  })
})
