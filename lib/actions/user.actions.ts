"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export async function updateProfile(data: { name: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  })
}