'use server'

import { db } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import { AttendanceReportPDF } from '@/lib/pdf/attendance-report'
import { ClassRosterPDF } from '@/lib/pdf/class-roster'
import { GradebookReportPDF } from '@/lib/pdf/gradebook-report'
import { LessonPlanPDF, type LessonPlanPdfData } from '@/lib/pdf/lesson-plan'
import { requireTeacher } from '@/lib/auth-helpers'

export async function generateAttendancePDF(classId: string, date: string) {
  const teacherId = await requireTeacher()

  const cls = await db.class.findUnique({
    where: { id: classId, teacherId },
  })
  if (!cls) throw new Error('Class not found')

  const targetDate = new Date(date)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const students = await db.student.findMany({
    where: { classId },
    orderBy: { name: 'asc' },
  })

  const attendance = await db.attendance.findMany({
    where: {
      classId,
      date: { gte: targetDate, lt: nextDay },
    },
  })

  const attendanceMap = new Map(attendance.map((a) => [a.studentId, a.status]))

  const records = students.map((s) => ({
    studentName: s.name,
    studentNumber: s.studentNumber,
    status: attendanceMap.get(s.id) ?? 'ABSENT',
  }))

  const buffer = await renderToBuffer(
    AttendanceReportPDF({
      className: cls.name,
      date,
      records,
    })
  )

  return buffer.toString('base64')
}

export async function generateClassRosterPDF(classId: string) {
  const teacherId = await requireTeacher()

  const cls = await db.class.findUnique({
    where: { id: classId, teacherId },
    include: {
      students: {
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!cls) throw new Error('Class not found')

  const buffer = await renderToBuffer(
    ClassRosterPDF({
      className: cls.name,
      level: cls.level,
      students: cls.students,
    })
  )

  return buffer.toString('base64')
}

export async function generateGradebookPDF(classId: string) {
  const teacherId = await requireTeacher()

  const cls = await db.class.findUnique({
    where: { id: classId, teacherId },
    select: { name: true, level: true },
  })
  if (!cls) throw new Error('Class not found')

  const [students, assessments] = await Promise.all([
    db.student.findMany({ where: { classId }, orderBy: { name: 'asc' } }),
    db.assessment.findMany({
      where: { classId, teacherId },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const grades = await db.assessmentGrade.findMany({
    where: { assessmentId: { in: assessments.map((a) => a.id) } },
  })
  const gradeMap = new Map(
    grades.map((g) => [`${g.assessmentId}:${g.studentId}`, g.score])
  )

  function avgFor(studentId: string): number | null {
    const scores: number[] = []
    let weightedSum = 0
    let totalWeight = 0
    let hasWeighted = false
    for (const a of assessments) {
      const sc = gradeMap.get(`${a.id}:${studentId}`)
      if (sc !== null && sc !== undefined) {
        const pct = (sc / a.maxScore) * 100
        if (a.weight !== null) {
          hasWeighted = true
          weightedSum += pct * (a.weight / 100)
          totalWeight += a.weight
        } else {
          scores.push(pct)
        }
      }
    }
    if (hasWeighted && totalWeight === 100)
      return Math.round(weightedSum * 10) / 10
    if (hasWeighted) {
      // mixed: weighted part + simple for unweighted
      const allPcts: number[] = []
      for (const a of assessments) {
        const sc = gradeMap.get(`${a.id}:${studentId}`)
        if (sc !== null && sc !== undefined)
          allPcts.push((sc / a.maxScore) * 100)
      }
      if (allPcts.length === 0) return null
      return (
        Math.round((allPcts.reduce((s, v) => s + v, 0) / allPcts.length) * 10) /
        10
      )
    }
    if (scores.length === 0) return null
    return (
      Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
    )
  }

  const reportStudents = students.map((s) => ({
    name: s.name,
    studentNumber: s.studentNumber,
    average: avgFor(s.id),
    scores: assessments.map((a) => ({
      title: a.title,
      score: gradeMap.get(`${a.id}:${s.id}`) ?? null,
      maxScore: a.maxScore,
    })),
  }))

  const buffer = await renderToBuffer(
    GradebookReportPDF({
      className: cls.name,
      level: cls.level,
      assessments: assessments.map((a) => ({
        title: a.title,
        maxScore: a.maxScore,
      })),
      students: reportStudents,
    }) as unknown as Parameters<typeof renderToBuffer>[0]
  )

  return buffer.toString('base64')
}

export async function generateLessonPlanPdfFromData(data: LessonPlanPdfData) {
  await requireTeacher()
  const buffer = await renderToBuffer(
    LessonPlanPDF(data) as unknown as Parameters<typeof renderToBuffer>[0]
  )
  return buffer.toString('base64')
}

export async function generateLessonPlanPdfById(planId: string) {
  const teacherId = await requireTeacher()
  const plan = await db.lessonPlan.findFirst({
    where: { id: planId, teacherId },
    include: { class: true },
  })
  if (!plan) throw new Error('Lesson plan not found')

  const pdfData: LessonPlanPdfData = {
    title: plan.title,
    subject: plan.subject,
    grade: plan.class.level ?? '-',
    duration: '-',
    objectives: (plan.objectives ?? '').split('\n').filter(Boolean),
    activities: (plan.activities ?? '').split('\n').filter(Boolean),
    assessment: (plan.assessment ?? '').split('\n').filter(Boolean),
    homework: (plan.notes ?? '').split('\n').filter(Boolean),
    materials: (plan.materials ?? '').split('\n').filter(Boolean),
    methods: (plan.methods ?? '').split('\n').filter(Boolean),
    differentiation: (plan.differentiation ?? '').split('\n').filter(Boolean),
  }

  const buffer = await renderToBuffer(
    LessonPlanPDF(pdfData) as unknown as Parameters<typeof renderToBuffer>[0]
  )
  return buffer.toString('base64')
}
