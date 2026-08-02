import { NextRequest, NextResponse } from 'next/server'
import { handlers } from '@/auth'
import { authRateLimit } from '@/lib/rate-limit'

export const GET = handlers.GET

export const POST = async (req: NextRequest) => {
  try {
    authRateLimit.checkNext(req, 10)
  } catch {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  return handlers.POST(req)
}
