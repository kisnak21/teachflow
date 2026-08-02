'use server'

import { db } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import { AttendanceReportPDF } from '@/lib/pdf/attendance-report'
import { ClassRosterPDF } from '@/lib/pdf/class-roster'
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
