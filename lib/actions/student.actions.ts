"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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

  if (!data.name.trim()) throw new Error("Student name is required")
  if (!data.studentNumber.trim()) throw new Error("Student number is required")
  if (!data.classId) throw new Error("Class is required")

  await db.student.create({
    data: {
      name: data.name.trim(),
      studentNumber: data.studentNumber.trim(),
      classId: data.classId,
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

  await db.student.update({
    where: { id },
    data: {
      name: data.name.trim(),
      studentNumber: data.studentNumber.trim(),
      classId: data.classId,
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