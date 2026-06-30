import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role
  const pathname = req.nextUrl.pathname

  const isTeacherAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/register')
  const isStudentAuthPage = pathname.startsWith('/student/login')

  const isTeacherRoute = [
    '/dashboard',
    '/classes',
    '/students',
    '/attendance',
    '/assignments',
    '/lesson-plans',
    '/analytics',
    '/settings',
  ].some((p) => pathname.startsWith(p))

  const isStudentRoute =
    (pathname.startsWith('/student/') || pathname === '/student') &&
    !isStudentAuthPage

  // Teacher route protection
  if (isTeacherRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', req.nextUrl))
    }
  }

  // Student route protection
  if (isStudentRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/student/login', req.nextUrl))
    }
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
  }

  // Redirect logged-in users away from auth pages
  if (isTeacherAuthPage && isLoggedIn && role === 'teacher') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  if (isStudentAuthPage && isLoggedIn && role === 'student') {
    return NextResponse.redirect(new URL('/student/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
