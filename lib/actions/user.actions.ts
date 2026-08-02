"use server"

import { db } from "@/lib/db"
import { z } from "zod"
import { requireTeacher } from "@/lib/auth-helpers"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export async function updateProfile(data: { name: string }) {
  const teacherId = await requireTeacher()

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.user.update({
    where: { id: teacherId },
    data: { name: parsed.data.name },
  })
}