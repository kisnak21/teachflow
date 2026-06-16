"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { assignmentSchema } from "@/lib/validations"

export async function getAssignments() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.assignment.findMany({
    where: { teacherId: session.user.id },
    include: {
      classes: {
        include: { class: true },
      },
    },
    orderBy: { dueDate: "asc" },
  })
}

export async function createAssignment(data: {
  title: string
  description: string
  dueDate: string
  classIds: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = assignmentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.assignment.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      teacherId: session.user.id,
      classes: {
        create: parsed.data.classIds.map((classId) => ({ classId })),
      },
    },
  })

  revalidatePath("/assignments")
}

export async function updateAssignment(
  id: string,
  data: {
    title: string
    description: string
    dueDate: string
    classIds: string[]
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = assignmentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.assignmentClass.deleteMany({ where: { assignmentId: id } })

  await db.assignment.update({
    where: { id, teacherId: session.user.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      classes: {
        create: parsed.data.classIds.map((classId) => ({ classId })),
      },
    },
  })

  revalidatePath("/assignments")
}

export async function deleteAssignment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.assignment.delete({
    where: { id, teacherId: session.user.id },
  })

  revalidatePath("/assignments")
}