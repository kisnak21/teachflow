'use server'

import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { classSchema } from '@/lib/validations'
import { generateAccessCode } from '@/lib/access-code'
import { Prisma } from '@prisma/client'

export async function getClasses() {
  const teacherId = await requireTeacher()

  return db.class.findMany({
    where: { teacherId: teacherId },
    include: { _count: { select: { students: true } } },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  })
}

export async function createClass(data: { name: string; level: string }) {
  const teacherId = await requireTeacher()

  const parsed = classSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await db.class.create({
        data: {
          name: parsed.data.name,
          level: parsed.data.level,
          teacherId: teacherId,
          accessCode: generateAccessCode(),
        },
      })
      revalidatePath('/classes')
      return created
    } catch (error) {
      const isCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      if (isCollision) continue
      throw error
    }
  }

  throw new Error('Failed to generate a unique access code, try again')
}

export async function updateClass(
  id: string,
  data: { name: string; level: string }
) {
  const teacherId = await requireTeacher()

  const parsed = classSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.class.update({
    where: { id, teacherId: teacherId },
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
    },
  })

  revalidatePath('/classes')
}

export async function deleteClass(id: string) {
  const teacherId = await requireTeacher()

  await db.class.delete({
    where: { id, teacherId: teacherId },
  })

  revalidatePath('/classes')
}
