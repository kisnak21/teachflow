import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, CalendarCheck, ClipboardList } from 'lucide-react'
import { auth } from '@/auth'
import { db } from '@/lib/db'

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
  const session = await auth()
  console.log('SESSION ROLE:', session?.user?.role)
  const stats = await getDashboardStats(session!.user!.id!)

  const attendanceDisplay =
    stats.attendanceRate !== null ? `${stats.attendanceRate}%` : '—'

  const attendanceDescription =
    stats.totalAttendance > 0
      ? `${stats.totalAttendance} recorded today`
      : 'No attendance recorded today'

  const cards = [
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: BookOpen,
      description: 'Active classes',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      description: 'Enrolled students',
    },
    {
      title: "Today's Attendance",
      value: attendanceDisplay,
      icon: CalendarCheck,
      description: attendanceDescription,
    },
    {
      title: 'Upcoming Assignments',
      value: stats.upcomingAssignments,
      icon: ClipboardList,
      description: 'Due this week',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
