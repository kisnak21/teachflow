"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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

  if (!data.title.trim()) throw new Error("Title is required")
  if (!data.classIds.length) throw new Error("At least one class is required")
  if (!data.dueDate) throw new Error("Due date is required")

  await db.assignment.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: new Date(data.dueDate),
      teacherId: session.user.id,
      classes: {
        create: data.classIds.map((classId) => ({ classId })),
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

  // Delete existing class relations then re-insert
  await db.assignmentClass.deleteMany({ where: { assignmentId: id } })

  await db.assignment.update({
    where: { id, teacherId: session.user.id },
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: new Date(data.dueDate),
      classes: {
        create: data.classIds.map((classId) => ({ classId })),
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