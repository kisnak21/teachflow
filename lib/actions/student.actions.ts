"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { studentSchema } from "@/lib/validations"
import { requireTeacher } from "@/lib/auth-helpers"

export async function getStudents(classId?: string) {
  const teacherId = await requireTeacher()

  return db.student.findMany({
    where: {
      classId: classId ?? undefined,
      class: { teacherId },
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
  const teacherId = await requireTeacher()

  const parsed = studentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const cls = await db.class.findFirst({
    where: { id: parsed.data.classId, teacherId },
    select: { id: true },
  })
  if (!cls) throw new Error("Class not found")

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
  const teacherId = await requireTeacher()

  const parsed = studentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const student = await db.student.findFirst({
    where: { id, class: { teacherId } },
    select: { id: true },
  })
  if (!student) throw new Error("Student not found")

  const targetClass = await db.class.findFirst({
    where: { id: parsed.data.classId, teacherId },
    select: { id: true },
  })
  if (!targetClass) throw new Error("Class not found")

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
  const teacherId = await requireTeacher()

  const student = await db.student.findFirst({
    where: { id, class: { teacherId } },
    select: { id: true },
  })
  if (!student) throw new Error("Student not found")

  await db.student.delete({
    where: { id },
  })

  revalidatePath("/students")
}