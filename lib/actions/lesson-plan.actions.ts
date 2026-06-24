"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { lessonPlanSchema } from "@/lib/validations"

export async function getLessonPlans() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.lessonPlan.findMany({
    where: { teacherId: session.user.id },
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
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = lessonPlanSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.lessonPlan.create({
    data: {
      title: parsed.data.title,
      subject: parsed.data.subject,
      objectives: parsed.data.objectives ?? "",
      activities: parsed.data.activities ?? "",
      assessment: parsed.data.assessment ?? "",
      notes: parsed.data.notes ?? "",
      classId: parsed.data.classId,
      teacherId: session.user.id,
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
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = lessonPlanSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.lessonPlan.update({
    where: { id, teacherId: session.user.id },
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
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.lessonPlan.delete({
    where: { id, teacherId: session.user.id },
  })

  revalidatePath("/lesson-plans")
}