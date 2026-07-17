"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { classSchema } from "@/lib/validations"

export async function getClasses() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.class.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { students: true } } },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  })
}

export async function createClass(data: { name: string; level: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = classSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.class.create({
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
      teacherId: session.user.id,
      accessCode: generateAccessCode(),
    },
  })

  revalidatePath("/classes")
}

/** Generate a human-readable 6-char alphanumeric access code */
function generateAccessCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function updateClass(
  id: string,
  data: { name: string; level: string }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = classSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.class.update({
    where: { id, teacherId: session.user.id },
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
    },
  })

  revalidatePath("/classes")
}

export async function deleteClass(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.class.delete({
    where: { id, teacherId: session.user.id },
  })

  revalidatePath("/classes")
}