import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authRateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"

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

    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const resetToken = await db.resetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await db.resetToken.delete({ where: { id: resetToken.id } })

    return NextResponse.json({ message: "Password has been reset successfully." })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
