import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authRateLimit } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"
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
    const normalizedEmail = email.toLowerCase()

    const user = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      // Return success even if not found — prevent email enumeration
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
    }

    // Delete any existing tokens for this email
    await db.resetToken.deleteMany({ where: { email: normalizedEmail } })

    // Clean up expired tokens to prevent table bloat
    await db.resetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } })

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.resetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const resetUrl = `${baseUrl}/reset-password/${token}`

    if (resend) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "TeachFlow <onboarding@resend.dev>",
        to: [email],
        subject: "Reset your TeachFlow password",
        html: `
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your TeachFlow password.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
        `,
      })
    } else {
      console.error(
        "[forgot-password] RESEND_API_KEY is not set — reset email was NOT sent."
      )
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] Password reset link: ${resetUrl}`)
      }
    }

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
