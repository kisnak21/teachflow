"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAssignments() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.assignment.findMany({
    where: { teacherId: session.user.id },
    include: { class: true },
    orderBy: { dueDate: "asc" },
  })
}

export async function createAssignment(data: {
  title: string
  description: string
  dueDate: string
  classId: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!data.title.trim()) throw new Error("Title is required")
  if (!data.classId) throw new Error("Class is required")
  if (!data.dueDate) throw new Error("Due date is required")

  await db.assignment.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: new Date(data.dueDate),
      classId: data.classId,
      teacherId: session.user.id,
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
    classId: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.assignment.update({
    where: { id, teacherId: session.user.id },
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: new Date(data.dueDate),
      classId: data.classId,
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