import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, ClipboardList, User } from 'lucide-react'

async function getStudentData(studentId: string, classId: string) {
  const [student, totalAttendance, presentCount, assignments] =
    await Promise.all([
      db.student.findUnique({
        where: { id: studentId },
        include: { class: true },
      }),
      db.attendance.count({
        where: { studentId },
      }),
      db.attendance.count({
        where: { studentId, status: 'PRESENT' },
      }),
      db.assignment.count({
        where: {
          classes: { some: { classId } },
          dueDate: { gte: new Date() },
        },
      }),
    ])

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : null

  return { student, attendanceRate, totalAttendance, assignments }
}

export default async function StudentDashboardPage() {
  const session = await auth()
  const { student, attendanceRate, totalAttendance, assignments } =
    await getStudentData(session!.user.id, session!.user.classId!)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome, {student?.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {student?.class.name} — {student?.class.level}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Number
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.studentNumber}</div>
            <p className="text-xs text-muted-foreground mt-1">Your ID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceRate !== null ? `${attendanceRate}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAttendance} sessions recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Assignments
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Due upcoming</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
