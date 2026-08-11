'use server'

import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function addAttachment(data: {
  url: string
  name: string
  assignmentId?: string
  lessonPlanId?: string
}) {
  const teacherId = await requireTeacher()

  if (data.assignmentId) {
    const assignment = await db.assignment.findFirst({
      where: { id: data.assignmentId, teacherId },
      select: { id: true },
    })
    if (!assignment) throw new Error('Assignment not found')
  }

  if (data.lessonPlanId) {
    const lessonPlan = await db.lessonPlan.findFirst({
      where: { id: data.lessonPlanId, teacherId },
      select: { id: true },
    })
    if (!lessonPlan) throw new Error('Lesson plan not found')
  }

  const attachment = await db.attachment.create({
    data: {
      url: data.url,
      name: data.name,
      assignmentId: data.assignmentId,
      lessonPlanId: data.lessonPlanId,
    },
  })

  if (data.assignmentId) revalidatePath('/assignments')
  if (data.lessonPlanId) revalidatePath('/lesson-plans')

  return attachment
}

export async function deleteAttachment(id: string) {
  const teacherId = await requireTeacher()

  const attachment = await db.attachment.findUnique({
    where: { id },
    include: { assignment: true, lessonPlan: true },
  })
  if (!attachment) throw new Error('Attachment not found')

  if (attachment.assignment && attachment.assignment.teacherId !== teacherId) {
    throw new Error('Unauthorized')
  }
  if (attachment.lessonPlan && attachment.lessonPlan.teacherId !== teacherId) {
    throw new Error('Unauthorized')
  }

  const fileKey = attachment.url.split('/').pop()
  if (fileKey) {
    try {
      await utapi.deleteFiles(fileKey)
    } catch (error) {
      console.error('Failed to delete file from UploadThing:', error)
    }
  }

  await db.attachment.delete({ where: { id } })

  if (attachment.assignmentId) revalidatePath('/assignments')
  if (attachment.lessonPlanId) revalidatePath('/lesson-plans')
}
