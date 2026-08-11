import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { authConfig } from './auth.config'
import {
  isStudentAuthPage,
  isStudentRoute,
  isTeacherAuthPage,
  isTeacherRoute,
} from './lib/routes'

const { auth } = NextAuth(authConfig)

type SessionUser = Session['user'] & { role?: 'teacher' | 'student' }

export default auth((req) => {
  const user = req.auth?.user as SessionUser | undefined
  const isLoggedIn = !!user?.id
  const role = user?.role
  const pathname = req.nextUrl.pathname

  const isTeacherPage = isTeacherAuthPage(pathname)
  const isStudentPage = isStudentAuthPage(pathname)

  const onTeacherRoute = isTeacherRoute(pathname)
  const onStudentRoute = isStudentRoute(pathname)

  // Teacher route protection
  if (onTeacherRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', req.nextUrl))
    }
  }

  // Student route protection
  if (onStudentRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/student/login', req.nextUrl))
    }
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
  }

  // Redirect logged-in users away from auth pages
  if (isTeacherPage && isLoggedIn && role === 'teacher') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  if (isStudentPage && isLoggedIn && role === 'student') {
    return NextResponse.redirect(new URL('/student/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
