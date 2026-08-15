'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, CalendarCheck, ClipboardList } from 'lucide-react'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

interface Stats {
  totalClasses: number
  totalStudents: number
  attendanceRate: number | null
  totalAttendance: number
  upcomingAssignments: number
}

export function DashboardView({ stats }: { stats: Stats }) {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(stats.totalClasses === 0)

  if (showWizard) {
    return (
      <OnboardingWizard
        onComplete={() => {
          setShowWizard(false)
          router.refresh()
        }}
        onSkip={() => {
          setShowWizard(false)
          router.refresh()
        }}
      />
    )
  }

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
