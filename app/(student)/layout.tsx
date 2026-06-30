import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'
import {
  GraduationCap,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'student') {
    redirect('/student/login')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">TeachFlow</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/student/attendance"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <CalendarCheck className="h-4 w-4" />
              Attendance
            </Link>
            <Link
              href="/student/assignments"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              Assignments
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session.user.name}
          </span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/student/login' })
            }}
          >
            <Button variant="ghost" size="icon" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  )
}
