'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireTeacher } from '@/lib/auth-helpers'
import { z } from 'zod'

const assessmentTypes = [
  'QUIZ',
  'EXAM',
  'HOMEWORK',
  'PRACTICE',
  'OTHER',
] as const

const assessmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(assessmentTypes),
  maxScore: z.coerce.number().int().min(1).max(1000),
  weight: z.coerce.number().int().min(0).max(100).optional().nullable(),
  date: z.string().optional().nullable(),
  classId: z.string().min(1, 'Class is required'),
})

const gradeSchema = z.object({
  score: z.number().int().nullable(),
  note: z.string().max(1000).optional().nullable(),
})

export async function getAssessments(classId?: string) {
  const teacherId = await requireTeacher()
  return db.assessment.findMany({
    where: {
      teacherId,
      ...(classId ? { classId } : {}),
    },
    include: { class: { select: { name: true } } },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function getGradebook(classId: string) {
  const teacherId = await requireTeacher()

  const cls = await db.class.findFirst({
    where: { id: classId, teacherId },
    select: { id: true, name: true, level: true },
  })
  if (!cls) throw new Error('Class not found')

  const [students, assessments] = await Promise.all([
    db.student.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
    }),
    db.assessment.findMany({
      where: { classId, teacherId },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const grades = await db.assessmentGrade.findMany({
    where: {
      assessmentId: { in: assessments.map((a) => a.id) },
      studentId: { in: students.map((s) => s.id) },
    },
  })

  const gradeMap = new Map<string, (typeof grades)[number]>()
  for (const g of grades) gradeMap.set(`${g.assessmentId}:${g.studentId}`, g)

  return { cls, students, assessments, grades, gradeMap }
}

export async function createAssessment(data: {
  title: string
  type: string
  maxScore: number | string
  weight?: number | string | null
  date?: string | null
  classId: string
}) {
  const teacherId = await requireTeacher()
  const parsed = assessmentSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const cls = await db.class.findFirst({
    where: { id: parsed.data.classId, teacherId },
    select: { id: true },
  })
  if (!cls) throw new Error('Class not found')

  await db.assessment.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      maxScore: parsed.data.maxScore,
      weight: parsed.data.weight ?? null,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
      classId: parsed.data.classId,
      teacherId,
    },
  })

  revalidatePath('/grades')
}

export async function updateAssessment(
  id: string,
  data: {
    title: string
    type: string
    maxScore: number | string
    weight?: number | string | null
    date?: string | null
  }
) {
  const teacherId = await requireTeacher()
  const parsed = assessmentSchema.omit({ classId: true }).safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const existing = await db.assessment.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!existing) throw new Error('Assessment not found')

  await db.assessment.update({
    where: { id },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      maxScore: parsed.data.maxScore,
      weight: parsed.data.weight ?? null,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
    },
  })

  revalidatePath('/grades')
}

export async function deleteAssessment(id: string) {
  const teacherId = await requireTeacher()
  const existing = await db.assessment.findFirst({
    where: { id, teacherId },
    select: { id: true },
  })
  if (!existing) throw new Error('Assessment not found')

  await db.assessment.delete({ where: { id } })
  revalidatePath('/grades')
}

export async function saveAssessmentGrade(data: {
  assessmentId: string
  studentId: string
  score: number | null
  note?: string | null
}) {
  const teacherId = await requireTeacher()

  const parsed = gradeSchema.safeParse({ score: data.score, note: data.note })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const assessment = await db.assessment.findFirst({
    where: { id: data.assessmentId, teacherId },
    select: { id: true, classId: true, maxScore: true },
  })
  if (!assessment) throw new Error('Assessment not found')

  const student = await db.student.findFirst({
    where: { id: data.studentId, classId: assessment.classId },
    select: { id: true },
  })
  if (!student) throw new Error('Student not found in this class')

  if (
    parsed.data.score !== null &&
    (parsed.data.score < 0 || parsed.data.score > assessment.maxScore)
  ) {
    throw new Error(`Score must be between 0 and ${assessment.maxScore}`)
  }

  if (parsed.data.score === null && !parsed.data.note) {
    // delete grade row if both empty
    await db.assessmentGrade.deleteMany({
      where: { assessmentId: data.assessmentId, studentId: data.studentId },
    })
  } else {
    await db.assessmentGrade.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: data.assessmentId,
          studentId: data.studentId,
        },
      },
      create: {
        assessmentId: data.assessmentId,
        studentId: data.studentId,
        score: parsed.data.score,
        note: parsed.data.note ?? null,
      },
      update: {
        score: parsed.data.score,
        note: parsed.data.note ?? null,
      },
    })
  }

  revalidatePath('/grades')
}
