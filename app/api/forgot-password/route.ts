import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    try {
      authRateLimit.checkNext(req, 5)
    } catch {
      return NextResponse.json(
        { error: "Too many password reset attempts. Try again later." },
        { status: 429 }
      )
    }

    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Return success even if not found — prevent email enumeration
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
    }

    // Delete any existing tokens for this email
    await db.resetToken.deleteMany({ where: { email } })

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.resetToken.create({
      data: { email, token, expiresAt },
    })

    console.log(`[DEV] Password reset link: http://localhost:3000/reset-password/${token}`)

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
