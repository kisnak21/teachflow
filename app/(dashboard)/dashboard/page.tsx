import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { DashboardView } from '@/components/dashboard/dashboard-view'

async function getDashboardStats(teacherId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const [totalClasses, totalStudents, todayAttendance, upcomingAssignments] =
    await Promise.all([
      db.class.count({
        where: { teacherId },
      }),
      db.student.count({
        where: { class: { teacherId } },
      }),
      db.attendance.groupBy({
        by: ['status'],
        where: {
          class: { teacherId },
          date: { gte: today, lt: tomorrow },
        },
        _count: { status: true },
      }),
      db.assignment.count({
        where: {
          teacherId,
          dueDate: { gte: today, lte: weekFromNow },
        },
      }),
    ])

  const totalAttendance = todayAttendance.reduce(
    (sum, r) => sum + r._count.status,
    0
  )
  const presentCount =
    todayAttendance.find((r) => r.status === 'PRESENT')?._count.status ?? 0
  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : null

  return {
    totalClasses,
    totalStudents,
    attendanceRate,
    totalAttendance,
    upcomingAssignments,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const stats = await getDashboardStats(session.id)
  return <DashboardView stats={stats} />
}
