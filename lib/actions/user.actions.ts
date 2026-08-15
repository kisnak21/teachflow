'use server'

import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireTeacher } from '@/lib/auth-helpers'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100),
})

export async function updateProfile(data: { name: string }) {
  const teacherId = await requireTeacher()

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.user.update({
    where: { id: teacherId },
    data: { name: parsed.data.name },
  })
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const teacherId = await requireTeacher()

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const user = await db.user.findUnique({
    where: { id: teacherId },
    select: { password: true },
  })
  if (!user) throw new Error('User not found')

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!ok) throw new Error('Current password is incorrect')

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.user.update({
    where: { id: teacherId },
    data: { password: hashed },
  })
}
