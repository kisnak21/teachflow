"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getLessonPlans() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db.lessonPlan.findMany({
    where: { teacherId: session.user.id },
    include: { class: true },
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

  if (!data.title.trim()) throw new Error("Title is required")
  if (!data.subject.trim()) throw new Error("Subject is required")
  if (!data.classId) throw new Error("Class is required")

  await db.lessonPlan.create({
    data: {
      title: data.title.trim(),
      subject: data.subject.trim(),
      objectives: data.objectives.trim(),
      activities: data.activities.trim(),
      assessment: data.assessment.trim(),
      notes: data.notes.trim(),
      classId: data.classId,
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

  await db.lessonPlan.update({
    where: { id, teacherId: session.user.id },
    data: {
      title: data.title.trim(),
      subject: data.subject.trim(),
      objectives: data.objectives.trim(),
      activities: data.activities.trim(),
      assessment: data.assessment.trim(),
      notes: data.notes.trim(),
      classId: data.classId,
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