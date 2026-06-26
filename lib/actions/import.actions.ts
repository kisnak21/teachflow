"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface ImportRow {
  name: string
  studentNumber: string
  className: string
}

export interface ImportPreviewRow extends ImportRow {
  status: "valid" | "error"
  error?: string
  classId?: string
}

export async function previewStudentImport(rows: ImportRow[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true },
  })

  const classMap = new Map(
    classes.map((c) => [c.name.trim().toLowerCase(), c.id])
  )

  const preview: ImportPreviewRow[] = rows.map((row) => {
    const name = row.name?.trim()
    const studentNumber = row.studentNumber?.trim()
    const className = row.className?.trim()

    if (!name) {
      return { ...row, status: "error", error: "Missing name" }
    }
    if (!studentNumber) {
      return { ...row, status: "error", error: "Missing student number" }
    }
    if (!className) {
      return { ...row, status: "error", error: "Missing class" }
    }

    const classId = classMap.get(className.toLowerCase())
    if (!classId) {
      return {
        ...row,
        status: "error",
        error: `Class "${className}" not found`,
      }
    }

    return { ...row, status: "valid", classId }
  })

  return preview
}

export async function confirmStudentImport(rows: ImportPreviewRow[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const validRows = rows.filter((r) => r.status === "valid" && r.classId)

  if (validRows.length === 0) {
    throw new Error("No valid rows to import")
  }

  await db.student.createMany({
    data: validRows.map((row) => ({
      name: row.name.trim(),
      studentNumber: row.studentNumber.trim(),
      classId: row.classId!,
    })),
  })

  revalidatePath("/students")

  return { imported: validRows.length }
}