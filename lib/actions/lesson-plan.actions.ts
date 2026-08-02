"use server"

import { db } from "@/lib/db"
import { requireTeacher } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"
import { lessonPlanSchema } from "@/lib/validations"

export async function getLessonPlans() {
  const teacherId = await requireTeacher()

  return db.lessonPlan.findMany({
    where: { teacherId: teacherId },
    include: { class: true, attachments: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createLessonPlan(data: {
  title: string
  subject: string
  objectives: string
  activities: string
  assessment: string
  notes: string
  classId: string
}) {
  const teacherId = await requireTeacher()

  const parsed = lessonPlanSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const cls = await db.class.findFirst({
    where: { id: parsed.data.classId, teacherId },
    select: { id: true },
  })
  if (!cls) throw new Error("Class not found")

  await db.lessonPlan.create({
    data: {
      title: parsed.data.title,
      subject: parsed.data.subject,
      objectives: parsed.data.objectives ?? "",
      activities: parsed.data.activities ?? "",
      assessment: parsed.data.assessment ?? "",
      notes: parsed.data.notes ?? "",
      classId: parsed.data.classId,
      teacherId: teacherId,
    },
  })

  revalidatePath("/lesson-plans")
}

export async function updateLessonPlan(
  id: string,
  data: {
    title: string
    subject: string
    objectives: string
    activities: string
    assessment: string
    notes: string
    classId: string
  }
) {
  const teacherId = await requireTeacher()

  const parsed = lessonPlanSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const lessonPlan = await db.lessonPlan.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!lessonPlan) throw new Error("Lesson plan not found")

  const cls = await db.class.findFirst({
    where: { id: parsed.data.classId, teacherId },
    select: { id: true },
  })
  if (!cls) throw new Error("Class not found")

  await db.lessonPlan.update({
    where: { id },
    data: {
      title: parsed.data.title,
      subject: parsed.data.subject,
      objectives: parsed.data.objectives ?? "",
      activities: parsed.data.activities ?? "",
      assessment: parsed.data.assessment ?? "",
      notes: parsed.data.notes ?? "",
      classId: parsed.data.classId,
    },
  })

  revalidatePath("/lesson-plans")
}

export async function deleteLessonPlan(id: string) {
  const teacherId = await requireTeacher()

  const lessonPlan = await db.lessonPlan.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!lessonPlan) throw new Error("Lesson plan not found")

  await db.lessonPlan.delete({
    where: { id },
  })

  revalidatePath("/lesson-plans")
}