import { describe, it, expect } from 'vitest'
import { generateAccessCode } from '@/lib/access-code'

describe('generateAccessCode', () => {
  it('returns a 6-char code by default', () => {
    expect(generateAccessCode()).toHaveLength(6)
  })

  it('only uses unambiguous alphanumeric characters', () => {
    expect(generateAccessCode()).toMatch(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/
    )
  })

  it('generates different codes across calls', () => {
    const codes = new Set(
      Array.from({ length: 50 }, () => generateAccessCode())
    )
    expect(codes.size).toBeGreaterThan(1)
  })

  it('supports a custom length', () => {
    expect(generateAccessCode(8)).toHaveLength(8)
  })
})
