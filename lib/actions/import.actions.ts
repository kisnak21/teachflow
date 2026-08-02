"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireTeacher } from "@/lib/auth-helpers"

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
  const teacherId = await requireTeacher()

  const classes = await db.class.findMany({
    where: { teacherId },
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
  const teacherId = await requireTeacher()

  const validRows = rows.filter((r) => r.status === "valid" && r.classId)

  if (validRows.length === 0) {
    throw new Error("No valid rows to import")
  }

  const classIds = Array.from(new Set(validRows.map((r) => r.classId!)))
  const ownedClasses = await db.class.findMany({
    where: { id: { in: classIds }, teacherId },
    select: { id: true },
  })
  if (ownedClasses.length !== classIds.length) {
    throw new Error("Unauthorized class write")
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