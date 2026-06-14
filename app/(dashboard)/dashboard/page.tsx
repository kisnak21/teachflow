import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, CalendarCheck, ClipboardList } from "lucide-react"
import { auth } from "@/auth"
import { db } from "@/lib/db"

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
      db.attendance.count({
        where: {
          class: { teacherId },
          date: { gte: today, lt: tomorrow },
          status: "PRESENT",
        },
      }),
      db.assignment.count({
        where: {
          teacherId,
          dueDate: { gte: today, lte: weekFromNow },
        },
      }),
    ])

  return { totalClasses, totalStudents, todayAttendance, upcomingAssignments }
}

export default async function DashboardPage() {
  const session = await auth()
  const stats = await getDashboardStats(session!.user!.id!)

  const cards = [
    {
      title: "Total Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      description: "Active classes",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Enrolled students",
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: CalendarCheck,
      description: "Present today",
    },
    {
      title: "Upcoming Assignments",
      value: stats.upcomingAssignments,
      icon: ClipboardList,
      description: "Due this week",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here`s what`s happening today.
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