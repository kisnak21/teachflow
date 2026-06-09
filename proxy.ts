import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
	const isLoggedIn = !!req.auth
	const isAuthPage =
		req.nextUrl.pathname.startsWith('/login') ||
		req.nextUrl.pathname.startsWith('/register')
	const isProtectedRoute =
		req.nextUrl.pathname.startsWith('/dashboard') ||
		req.nextUrl.pathname.startsWith('/classes') ||
		req.nextUrl.pathname.startsWith('/students') ||
		req.nextUrl.pathname.startsWith('/attendance') ||
		req.nextUrl.pathname.startsWith('/assignments') ||
		req.nextUrl.pathname.startsWith('/lesson-plans')

	if (isProtectedRoute && !isLoggedIn) {
		return NextResponse.redirect(new URL('/login', req.nextUrl))
	}

	if (isAuthPage && isLoggedIn) {
		return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
	}

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
