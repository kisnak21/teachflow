"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

export async function addAttachment(data: {
  url: string
  name: string
  assignmentId?: string
  lessonPlanId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.attachment.create({
    data: {
      url: data.url,
      name: data.name,
      assignmentId: data.assignmentId,
      lessonPlanId: data.lessonPlanId,
    },
  })

  if (data.assignmentId) revalidatePath("/assignments")
  if (data.lessonPlanId) revalidatePath("/lesson-plans")
}

export async function deleteAttachment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const attachment = await db.attachment.findUnique({ where: { id } })
  if (!attachment) throw new Error("Attachment not found")

  // Extract file key from URL and delete from Uploadthing storage
  const fileKey = attachment.url.split("/").pop()
  if (fileKey) {
    await utapi.deleteFiles(fileKey)
  }

  await db.attachment.delete({ where: { id } })

  if (attachment.assignmentId) revalidatePath("/assignments")
  if (attachment.lessonPlanId) revalidatePath("/lesson-plans")
}