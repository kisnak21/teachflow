"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { studentSchema } from "@/lib/validations"

export async function getStudents(classId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.student.findMany({
    where: {
      classId: classId,
      class: { teacherId: session.user.id },
    },
    include: { class: true },
    orderBy: { name: "asc" },
  })
}

export async function createStudent(data: {
  name: string
  studentNumber: string
  classId: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = studentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.student.create({
    data: {
      name: parsed.data.name,
      studentNumber: parsed.data.studentNumber,
      classId: parsed.data.classId,
    },
  })

  revalidatePath("/students")
}

export async function updateStudent(
  id: string,
  data: {
    name: string
    studentNumber: string
    classId: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = studentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.student.update({
    where: { id },
    data: {
      name: parsed.data.name,
      studentNumber: parsed.data.studentNumber,
      classId: parsed.data.classId,
    },
  })

  revalidatePath("/students")
}

export async function deleteStudent(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.student.delete({
    where: { id },
  })

  revalidatePath("/students")
}