import { NextResponse } from 'next/server'
import { handlers } from '@/auth'
import { authRateLimit } from '@/lib/rate-limit'

// Extend handlers to include rate limiting
export const GET = handlers.GET

export const POST = async (req: Request) => {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    await authRateLimit.check(NextResponse.next(), 10, ip)
  } catch (error) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  return handlers.POST(req)
}
