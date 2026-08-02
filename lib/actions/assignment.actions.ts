"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { assignmentSchema } from "@/lib/validations"
import { requireTeacher } from "@/lib/auth-helpers"

export async function getAssignments() {
  const teacherId = await requireTeacher()

  const assignments = await db.assignment.findMany({
    where: { teacherId },
    include: {
      classes: {
        include: { class: true },
      },
      attachments: true,
    },
    orderBy: { dueDate: "asc" },
  })

  const now = new Date().getTime()
  return assignments.map((assignment) => {
    const diff = new Date(assignment.dueDate).getTime() - now
    const status: "overdue" | "dueSoon" | "upcoming" =
      diff < 0 ? "overdue" : diff < 1000 * 60 * 60 * 24 * 3 ? "dueSoon" : "upcoming"
    return { ...assignment, status }
  })
}

export async function createAssignment(data: {
  title: string
  description: string
  dueDate: string
  classIds: string[]
}) {
  const teacherId = await requireTeacher()

  const parsed = assignmentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const ownedClasses = await db.class.findMany({
    where: { id: { in: parsed.data.classIds }, teacherId },
    select: { id: true },
  })
  if (ownedClasses.length !== parsed.data.classIds.length) {
    throw new Error("One or more classes not found")
  }

  await db.assignment.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      teacherId,
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
  const teacherId = await requireTeacher()

  const parsed = assignmentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const assignment = await db.assignment.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!assignment) throw new Error("Assignment not found")

  const ownedClasses = await db.class.findMany({
    where: { id: { in: parsed.data.classIds }, teacherId },
    select: { id: true },
  })
  if (ownedClasses.length !== parsed.data.classIds.length) {
    throw new Error("One or more classes not found")
  }

  await db.assignmentClass.deleteMany({ where: { assignmentId: id } })

  await db.assignment.update({
    where: { id },
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
  const teacherId = await requireTeacher()

  const assignment = await db.assignment.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!assignment) throw new Error("Assignment not found")

  await db.assignment.delete({
    where: { id },
  })

  revalidatePath("/assignments")
}