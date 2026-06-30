import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'teacher'
        token.classId = (user as { classId?: string }).classId
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.name) session.user.name = token.name as string
      session.user.role = (token.role as 'teacher' | 'student') ?? 'teacher'
      if (token.classId) session.user.classId = token.classId as string
      return session
    },
  },
}
