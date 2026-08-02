export const TEACHER_AUTH_PAGES = ['/login', '/register'] as const
export const STUDENT_AUTH_PAGE = '/student/login' as const

export const TEACHER_ROUTES = [
  '/dashboard',
  '/classes',
  '/students',
  '/attendance',
  '/assignments',
  '/lesson-plans',
  '/analytics',
  '/settings',
] as const

export const STUDENT_PREFIX = '/student'

export function isTeacherAuthPage(pathname: string): boolean {
  return TEACHER_AUTH_PAGES.some((p) => pathname.startsWith(p))
}

export function isStudentAuthPage(pathname: string): boolean {
  return pathname.startsWith(STUDENT_AUTH_PAGE)
}

export function isTeacherRoute(pathname: string): boolean {
  return TEACHER_ROUTES.some((p) => pathname.startsWith(p))
}

export function isStudentRoute(pathname: string): boolean {
  return (
    (pathname.startsWith(STUDENT_PREFIX) || pathname === STUDENT_PREFIX) &&
    !isStudentAuthPage(pathname)
  )
}
