'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireStudent, requireTeacher } from '@/lib/auth-helpers'
import { z } from 'zod'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

const submitSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment is required'),
  fileUrl: z.string().min(1, 'File is required'),
  fileName: z.string().min(1, 'File name is required'),
  note: z.string().max(2000).optional(),
})

const gradeSchema = z.object({
  score: z
    .number()
    .int('Score must be a whole number')
    .min(0, 'Score must be between 0 and 100')
    .max(100, 'Score must be between 0 and 100'),
  feedback: z.string().max(2000).optional(),
})

async function deleteStoredFile(url: string) {
  const fileKey = url.split('/').pop()
  if (!fileKey) return
  try {
    await utapi.deleteFiles(fileKey)
  } catch (error) {
    console.error('Failed to delete file from UploadThing:', error)
  }
}

export async function getSubmissionOverview(assignmentId: string) {
  const teacherId = await requireTeacher()

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, teacherId },
    select: {
      id: true,
      classes: { select: { classId: true } },
    },
  })
  if (!assignment) throw new Error('Assignment not found')

  const students = await db.student.findMany({
    where: { classId: { in: assignment.classes.map((c) => c.classId) } },
    include: {
      class: { select: { name: true } },
      submissions: { where: { assignmentId } },
    },
    orderBy: { name: 'asc' },
  })

  return students.map((student) => ({
    studentId: student.id,
    name: student.name,
    studentNumber: student.studentNumber,
    className: student.class.name,
    submission: student.submissions[0] ?? null,
  }))
}

export async function getMySubmission(assignmentId: string) {
  const student = await requireStudent()

  const assignment = await db.assignment.findFirst({
    where: {
      id: assignmentId,
      classes: { some: { classId: student.classId } },
    },
    select: { id: true },
  })
  if (!assignment) throw new Error('Assignment not found')

  return db.submission.findUnique({
    where: {
      studentId_assignmentId: { studentId: student.id, assignmentId },
    },
  })
}

export async function submitAssignment(data: {
  assignmentId: string
  fileUrl: string
  fileName: string
  note?: string
}) {
  const student = await requireStudent()

  const parsed = submitSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const assignment = await db.assignment.findFirst({
    where: {
      id: parsed.data.assignmentId,
      classes: { some: { classId: student.classId } },
    },
    select: { id: true },
  })
  if (!assignment) throw new Error('Assignment not found')

  const existing = await db.submission.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: student.id,
        assignmentId: parsed.data.assignmentId,
      },
    },
    select: { id: true, fileUrl: true },
  })

  await db.submission.upsert({
    where: {
      studentId_assignmentId: {
        studentId: student.id,
        assignmentId: parsed.data.assignmentId,
      },
    },
    create: {
      studentId: student.id,
      assignmentId: parsed.data.assignmentId,
      fileUrl: parsed.data.fileUrl,
      fileName: parsed.data.fileName,
      note: parsed.data.note ?? null,
    },
    update: {
      fileUrl: parsed.data.fileUrl,
      fileName: parsed.data.fileName,
      note: parsed.data.note ?? null,
      score: null,
      feedback: null,
      gradedAt: null,
      submittedAt: new Date(),
    },
  })

  if (existing) {
    await deleteStoredFile(existing.fileUrl)
  }

  revalidatePath('/student/assignments')
}

export async function deleteSubmission(id: string) {
  const student = await requireStudent()

  const submission = await db.submission.findUnique({
    where: { id },
    select: { id: true, studentId: true, fileUrl: true },
  })
  if (!submission || submission.studentId !== student.id) {
    throw new Error('Submission not found')
  }

  await deleteStoredFile(submission.fileUrl)

  await db.submission.delete({ where: { id } })

  revalidatePath('/student/assignments')
}

export async function gradeSubmission(
  submissionId: string,
  data: { score: number; feedback?: string }
) {
  const teacherId = await requireTeacher()

  const parsed = gradeSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const submission = await db.submission.findFirst({
    where: { id: submissionId, assignment: { teacherId } },
    select: { id: true },
  })
  if (!submission) throw new Error('Submission not found')

  await db.submission.update({
    where: { id: submissionId },
    data: {
      score: parsed.data.score,
      feedback: parsed.data.feedback ?? null,
      gradedAt: new Date(),
    },
  })

  revalidatePath('/assignments')
}
